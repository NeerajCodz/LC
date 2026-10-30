import test from "node:test";
import assert from "node:assert/strict";
import { SALVIA_MODEL } from "../components/flowers/salvia/salviaGeometry";
import { NICOTIANA_MODEL } from "../components/flowers/nicotiana/nicotianaGeometry";
import { SALVIA_LEAF } from "../components/flowers/salvia/salviaLeaf";
import {
  NICOTIANA_LEAF,
  NICOTIANA_DECURRENT_WINGS,
} from "../components/flowers/nicotiana/nicotianaLeaf";
import {
  specimenGeometry,
  specimenOrganParts,
} from "../lib/three/specimenModel";
import { DoubleSide, Mesh, MeshBasicMaterial, Raycaster, Vector3 } from "three";

for (const [name, model, maximumZ] of [
  ["salvia", SALVIA_MODEL, 0.72],
  ["nicotiana", NICOTIANA_MODEL, 1.23],
] as const) {
  for (const organQuality of ["low", "high"] as const)
    test(`${name}: actual ${organQuality} mature and young reproductive buffers remain inside the curved tube cavity through bloom`, () => {
      const material = new MeshBasicMaterial({ side: DoubleSide }),
        ray = new Raycaster(),
        direction = new Vector3(1, 0, 0),
        origin = new Vector3();
      try {
        for (const cluster of [1, model.clusters.length - 1]) {
          const surface = model.surfaces.find(
              (s) => s.role === "tube" && s.cluster === cluster,
            )!,
            geometry = specimenGeometry(surface, "high"),
            p = geometry.getAttribute("position"),
            f = geometry.morphAttributes.position![0],
            side = geometry.getAttribute("tissueSide"),
            uv = geometry.getAttribute("uv"),
            rest = Float32Array.from(p.array),
            indices = Array.from(geometry.index!.array);
          geometry.setIndex(
            indices.filter((_, i) => {
              const triangle = Math.floor(i / 3) * 3;
              return (
                side.getX(indices[triangle]) < 0 &&
                side.getX(indices[triangle + 1]) < 0 &&
                side.getX(indices[triangle + 2]) < 0
              );
            }),
          );
          const mesh = new Mesh(geometry, material),
            parts = specimenOrganParts(model, cluster, organQuality, true);
          try {
            for (const open of [0, 0.25, 0.5, 0.75, 1]) {
              for (let i = 0; i < p.array.length; i++)
                p.array[i] = rest[i] * open + f.array[i] * (1 - open);
              p.needsUpdate = true;
              geometry.computeBoundingSphere();
              let mouthZ = Infinity;
              for (let i = 0; i < p.count; i++)
                if (side.getX(i) < 0 && uv.getY(i) > 0.999)
                  mouthZ = Math.min(mouthZ, p.getZ(i));
              for (const part of parts) {
                const organ = part.organ,
                  a = part.geometry.getAttribute("position"),
                  b = part.geometry.morphAttributes.position![0];
                if (!organ.bloomMorph) continue;
                for (let i = 0; i < a.count; i++) {
                  const x = a.getX(i) * open + b.getX(i) * (1 - open),
                    y = a.getY(i) * open + b.getY(i) * (1 - open),
                    z = a.getZ(i) * open + b.getZ(i) * (1 - open);
                  if (z < 0.09 || z > Math.min(maximumZ, mouthZ - 0.012))
                    continue;
                  origin.set(x, y, z);
                  ray.set(origin, direction);
                  const hits = ray.intersectObject(mesh, false),
                    distances: number[] = [];
                  for (const hit of hits)
                    if (
                      !distances.some((d) => Math.abs(d - hit.distance) < 1e-7)
                    )
                      distances.push(hit.distance);
                  assert.equal(
                    distances.length % 2,
                    1,
                    `${organ.name} escapes ${name} cluster ${cluster} cavity at bloom ${open}, vertex ${i}: ${x},${y},${z}`,
                  );
                }
              }
            }
          } finally {
            parts.forEach((part) => part.geometry.dispose());
            geometry.dispose();
          }
        }
      } finally {
        material.dispose();
      }
    });
}

for (const [name, model] of [
  ["salvia", SALVIA_MODEL],
  ["nicotiana", NICOTIANA_MODEL],
] as const)
  test(`${name}: outward tissue labels follow the farther radial skin in actual open and folded buffers`, () => {
    for (const quality of [
      "overview",
      "low",
      "medium",
      "high",
      "ultra",
    ] as const) {
      const surface = model.surfaces.find((s) => s.role === "tube")!,
        g = specimenGeometry(surface, quality),
        p = g.getAttribute("position"),
        f = g.morphAttributes.position![0],
        uv = g.getAttribute("uv"),
        side = g.getAttribute("tissueSide"),
        half = p.count / 2,
        row = Array.from({ length: half }, (_, i) => i).filter(
          (i) => Math.abs(uv.getY(i) - 0.5) < 1e-5,
        );
      try {
        assert.ok(
          row.length > 0,
          "tube section is sampled for radial side inspection",
        );
        for (const open of [0, 0.5, 1]) {
          const at = (i: number, axis: number) =>
              p.array[i * 3 + axis] * open + f.array[i * 3 + axis] * (1 - open),
            centerX =
              row.reduce(
                (sum, i) => sum + (at(i, 0) + at(i + half, 0)) * 0.5,
                0,
              ) / row.length,
            centerY =
              row.reduce(
                (sum, i) => sum + (at(i, 1) + at(i + half, 1)) * 0.5,
                0,
              ) / row.length;
          for (const i of row) {
            const firstRadius = Math.hypot(
                at(i, 0) - centerX,
                at(i, 1) - centerY,
              ),
              secondRadius = Math.hypot(
                at(i + half, 0) - centerX,
                at(i + half, 1) - centerY,
              ),
              outer = firstRadius > secondRadius ? i : i + half,
              inner = firstRadius > secondRadius ? i + half : i;
            assert.equal(
              side.getX(outer),
              1,
              `${name}/${quality} farther radial skin mislabeled as interior at ${open}`,
            );
            assert.equal(
              side.getX(inner),
              -1,
              `${name}/${quality} cavity skin mislabeled as exterior at ${open}`,
            );
          }
        }
      } finally {
        g.dispose();
      }
    }
  });

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
          for (const open of [0, 0.25, 0.5, 0.75, 1])
            for (let i = 0; i < ix.length; i += 3) {
              const a = ix[i] * 3,
                b = ix[i + 1] * 3,
                c = ix[i + 2] * 3,
                at = (k: number) => p.array[k] * open + f.array[k] * (1 - open),
                ux = at(b) - at(a),
                uy = at(b + 1) - at(a + 1),
                uz = at(b + 2) - at(a + 2),
                vx = at(c) - at(a),
                vy = at(c + 1) - at(a + 1),
                vz = at(c + 2) - at(a + 2);
              assert.ok(
                Math.hypot(
                  uy * vz - uz * vy,
                  uz * vx - ux * vz,
                  ux * vy - uy * vx,
                ) > 1e-12,
                `${s.name} degenerate triangle at ${open}`,
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
