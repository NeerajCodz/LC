import test from "node:test";
import assert from "node:assert/strict";
import { Object3D } from "three";
import { PetalDynamics } from "../lib/three/petalDynamics";
import { specimenCages } from "../lib/three/specimenModel";
import { RANUNCULUS_MODEL } from "../components/flowers/ranunculus/ranunculusGeometry";
for (const [name, model] of [["ranunculus", RANUNCULUS_MODEL]] as const)
  test(`${name}: transformed cages keep insertions pinned through gust, reverse bloom and release`, () => {
    for (const constrained of [true, false]) {
      const { indices, patches } = specimenCages(model, constrained),
        sim = new PetalDynamics(patches, constrained),
        dummy = new Object3D();
      const matrices = indices.map((i) => {
        const c = model.clusters[model.surfaces[i].cluster];
        dummy.position.set(...c.position);
        dummy.rotation.set(...c.rotation);
        dummy.scale.setScalar(c.scale);
        dummy.updateMatrix();
        return dummy.matrix.clone();
      });
      for (let i = 0; i < indices.length; i++)
        if (model.surfaces[indices[i]].pinMidrib) {
          const patch = patches[i],
            stride = patch.periodic ? patch.columns : patch.columns + 1;
          for (let j = 0; j <= patch.rows; j++)
            sim.inverseMass[
              sim.offsets[i] + j * stride + Math.floor(stride / 2)
            ] = 0;
        }
      const force = {
        wind: 3,
        time: 0,
        pulse: 1,
        x: 0,
        y: 0.15,
        z: 0.12,
        proximity: 1,
      };
      for (const open of [1, 0.5, 0, 1]) {
        indices.forEach((_, i) =>
          sim.setRest(i, open, matrices[i].elements, 0.8),
        );
        sim.reset();
        for (let frame = 0; frame < 18; frame++) {
          force.time = frame / 60;
          force.wind = frame < 8 ? 3 : 0;
          force.pulse = frame < 8 ? 1 : 0;
          sim.step(1 / 60, force);
        }
        for (let node = 0; node < sim.inverseMass.length; node++) {
          const k = node * 3;
          assert.ok(
            Number.isFinite(
              sim.positions[k] + sim.positions[k + 1] + sim.positions[k + 2],
            ),
          );
          const distance = Math.hypot(
            sim.positions[k] - sim.rest[k],
            sim.positions[k + 1] - sim.rest[k + 1],
            sim.positions[k + 2] - sim.rest[k + 2],
          );
          assert.ok(distance < 1, `${name} node ${node} remains bounded`);
          if (sim.inverseMass[node] === 0)
            assert.equal(distance, 0, `${name} insertion remains fixed`);
        }
        sim.reset();
        assert.deepEqual(
          sim.positions,
          sim.rest,
          "reduced motion settles directly to authored rest",
        );
      }
    }
  });
