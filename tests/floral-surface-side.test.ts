import test from "node:test";
import assert from "node:assert/strict";
import { specimenGeometry } from "../lib/three/specimenModel";
import { SALVIA_MODEL } from "../components/flowers/salvia/salviaGeometry";
import { NICOTIANA_MODEL } from "../components/flowers/nicotiana/nicotianaGeometry";

for (const [name, model] of [
  ["salvia", SALVIA_MODEL],
  ["nicotiana", NICOTIANA_MODEL],
] as const)
  test(`${name}: skin labels identify the actual outer and inner tube in both morph states`, () => {
    const surface = model.surfaces.find((s) => s.role === "tube")!,
      geometry = specimenGeometry(surface, "high");
    try {
      const uv = geometry.getAttribute("uv"),
        sides = geometry.getAttribute("tissueSide"),
        half = sides.count / 2;
      for (const positions of [
        geometry.getAttribute("position"),
        geometry.morphAttributes.position![0],
      ]) {
        const rows = new Map<number, number[]>();
        for (let i = 0; i < half; i++) {
          const v = uv.getY(i);
          if (v < 0.12 || v > 0.55) continue;
          const row = rows.get(v) ?? [];
          row.push(i);
          rows.set(v, row);
        }
        for (const row of rows.values()) {
          const center = [0, 0, 0];
          for (const i of row)
            for (let axis = 0; axis < 3; axis++)
              center[axis] +=
                (positions.array[i * 3 + axis] +
                  positions.array[(i + half) * 3 + axis]) /
                (2 * row.length);
          for (const i of row) {
            let radialOffset = 0;
            for (let axis = 0; axis < 3; axis++) {
              const a = positions.array[i * 3 + axis],
                b = positions.array[(i + half) * 3 + axis];
              radialOffset += (a - b) * ((a + b) * 0.5 - center[axis]);
            }
            assert.ok(
              radialOffset * sides.getX(i) > 0,
              `${name} mislabeled actual inner/outer skin at ${uv.getX(i)},${uv.getY(i)}`,
            );
            assert.equal(sides.getX(i), -sides.getX(i + half));
          }
        }
      }
    } finally {
      geometry.dispose();
    }
  });
