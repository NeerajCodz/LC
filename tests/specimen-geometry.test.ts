import test from "node:test";
import assert from "node:assert/strict";
import {
  specimenGeometry,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { createCagePatch, PetalDynamics } from "../lib/three/petalDynamics";
import { CARNATION_MODEL } from "../components/flowers/carnation/carnationGeometry";
import { PLUMERIA_MODEL } from "../components/flowers/plumeria/plumeriaGeometry";
import { FOXGLOVE_MODEL } from "../components/flowers/foxglove/foxgloveGeometry";

export function verifySpecimen(name: string, model: SpecimenModel) {
  test(`${name}: deterministic sealed surfaces, positive thickness and stable bloom normals`, () => {
    for (const s of model.surfaces) {
      const g = specimenGeometry(s, "low"),
        b = specimenGeometry(s, "low");
      const p = g.getAttribute("position"),
        f = g.morphAttributes.position![0],
        half = p.count / 2;
      assert.deepEqual(p.array, b.getAttribute("position").array, s.name);
      for (const a of [
        p,
        f,
        g.getAttribute("normal"),
        g.morphAttributes.normal![0],
      ])
        assert.ok(Array.from(a.array).every(Number.isFinite), s.name);
      for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
        for (let i = 0; i < a.count; i++)
          assert.ok(
            Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
            s.name,
          );
      for (const a of [p, f])
        for (let i = 0; i < half; i++)
          assert.ok(
            Math.hypot(
              a.getX(i) - a.getX(i + half),
              a.getY(i) - a.getY(i + half),
              a.getZ(i) - a.getZ(i + half),
            ) >
              s.thickness * 0.79,
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
        s.name,
      );
      for (const open of [0, 0.5, 1])
        for (let i = 0; i < ix.length; i += 3) {
          const a = ix[i] * 3,
            b = ix[i + 1] * 3,
            c = ix[i + 2] * 3;
          const x = (k: number) => p.array[k] * open + f.array[k] * (1 - open);
          const ux = x(b) - x(a),
            uy = x(b + 1) - x(a + 1),
            uz = x(b + 2) - x(a + 2),
            vx = x(c) - x(a),
            vy = x(c + 1) - x(a + 1),
            vz = x(c + 2) - x(a + 2);
          assert.ok(
            Math.hypot(
              uy * vz - uz * vy,
              uz * vx - ux * vz,
              ux * vy - uy * vx,
            ) > 1e-12,
            `${s.name} at ${open}`,
          );
        }
      g.dispose();
      b.dispose();
    }
  });
  test(`${name}: whole-plant cages respect both node ceilings`, () => {
    for (const constrained of [true, false]) {
      const patches = model.surfaces
        .filter((s) => s.flexible)
        .map((s) => {
          const [columns, rows] = (constrained ? s.mobileCage : s.cage) ?? [
            3, 5,
          ];
          return createCagePatch({ ...s, columns, rows });
        });
      const sim = new PetalDynamics(patches, constrained);
      assert.ok(sim.inverseMass.length <= (constrained ? 512 : 2048));
    }
  });
}
verifySpecimen("carnation", CARNATION_MODEL);
verifySpecimen("plumeria", PLUMERIA_MODEL);
verifySpecimen("foxglove", FOXGLOVE_MODEL);
