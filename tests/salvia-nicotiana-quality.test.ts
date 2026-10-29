import test from "node:test";
import assert from "node:assert/strict";
import { SALVIA_MODEL } from "../components/flowers/salvia/salviaGeometry";
import { NICOTIANA_MODEL } from "../components/flowers/nicotiana/nicotianaGeometry";
import { SALVIA_LEAF } from "../components/flowers/salvia/salviaLeaf";
import {
  NICOTIANA_LEAF,
  NICOTIANA_DECURRENT_WINGS,
} from "../components/flowers/nicotiana/nicotianaLeaf";
import { specimenGeometry } from "../lib/three/specimenModel";

for (const [name, model, foliage] of [
  ["salvia", SALVIA_MODEL, [SALVIA_LEAF]],
  [
    "nicotiana",
    NICOTIANA_MODEL,
    [NICOTIANA_LEAF, ...NICOTIANA_DECURRENT_WINGS],
  ],
] as const)
  for (const quality of [
    "overview",
    "low",
    "medium",
    "high",
    "ultra",
  ] as const) {
    test(`${name}: actual ${quality} shells retain finite matched buffers, closed edges and positive walls throughout bloom`, () => {
      for (const s of [...model.surfaces, ...foliage]) {
        const g = specimenGeometry(s, quality),
          p = g.getAttribute("position"),
          f = g.morphAttributes.position![0],
          half = p.count / 2;
        try {
          for (const a of [
            ...Object.values(g.attributes),
            ...Object.values(g.morphAttributes).flat(),
          ]) {
            assert.equal(a.count, p.count, `${s.name} buffer length`);
            for (const n of a.array)
              assert.ok(Number.isFinite(n), `${s.name} nonfinite buffer`);
          }
          for (const normals of [
            g.getAttribute("normal"),
            g.morphAttributes.normal![0],
          ])
            for (let i = 0; i < normals.count; i++)
              assert.ok(
                Math.abs(
                  Math.hypot(
                    normals.getX(i),
                    normals.getY(i),
                    normals.getZ(i),
                  ) - 1,
                ) < 0.002,
                s.name,
              );
          const edges = new Map<string, number>(),
            ix = g.index!.array;
          for (let i = 0; i < ix.length; i += 3)
            for (let j = 0; j < 3; j++) {
              const a = ix[i + j],
                b = ix[i + ((j + 1) % 3)],
                key = a < b ? `${a}:${b}` : `${b}:${a}`;
              edges.set(key, (edges.get(key) ?? 0) + 1);
            }
          assert.ok(
            [...edges.values()].every((n) => n === 2),
            `${s.name} unsealed edge`,
          );
          for (const open of [0, 0.25, 0.5, 0.75, 1])
            for (let i = 0; i < half; i++) {
              const d = [0, 1, 2].map(
                (axis) =>
                  (p.array[i * 3 + axis] - p.array[(i + half) * 3 + axis]) *
                    open +
                  (f.array[i * 3 + axis] - f.array[(i + half) * 3 + axis]) *
                    (1 - open),
              );
              // Linear position morphs rotate the two offset skins as the limb unfolds.
              // They may narrow between authored endpoints but must never touch or reverse.
              const minimum = open === 0 || open === 1 ? 0.79 : 0.45;
              assert.ok(
                Math.hypot(...d) > s.thickness * minimum,
                `${s.name} wall collapsed at ${open}`,
              );
            }
          if (s.role === "tube") {
            const uv = g.getAttribute("uv");
            for (const open of [0, 0.25, 0.5, 0.75, 1])
              for (let i = half; i < p.count; i++)
                if (uv.getY(i) === 1) {
                  const x = p.getX(i) * open + f.getX(i) * (1 - open),
                    y = p.getY(i) * open + f.getY(i) * (1 - open);
                  // Every inner rim vertex must remain on the same side of the tube axis as its midsurface.
                  const centerY = name === "salvia" ? 0.035 : 0,
                    full = s.sample(uv.getX(i), 1, 1),
                    fold = s.sample(uv.getX(i), 1, 0),
                    axisX = full[0] * open + fold[0] * (1 - open),
                    axisY =
                      (full[1] - centerY) * open +
                      (fold[1] - centerY) * (1 - open);
                  assert.ok(
                    x * axisX + (y - centerY) * axisY > 0,
                    `${s.name} inner rim crossed axis at ${open}`,
                  );
                }
          }
        } finally {
          g.dispose();
        }
      }
    });
  }
