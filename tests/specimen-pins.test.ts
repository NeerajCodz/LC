import test from "node:test";
import assert from "node:assert/strict";
import {
  applySpecimenPins,
  specimenCages,
  SINGLE_CLUSTER,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";

test("production specimen pins follow actual periodic and nonperiodic cage rows without spilling into neighbors", () => {
  const model: SpecimenModel = {
    clusters: [SINGLE_CLUSTER],
    organs: [],
    surfaces: [
      {
        name: "nonperiodic pinned blade",
        cluster: 0,
        role: "petal",
        thickness: 0.01,
        flexible: true,
        pinMidrib: true,
        cage: [4, 3],
        sample: (u, v) => [(u - 0.5) * 0.2, v * 0.3, 0.01 * (u - 0.5) ** 2],
      },
      {
        name: "periodic pinned corolla",
        cluster: 0,
        role: "tube",
        thickness: 0.01,
        flexible: true,
        periodic: true,
        pinMidrib: true,
        cage: [6, 3],
        sample: (u, v) => [
          Math.sin(u * Math.PI * 2) * 0.07,
          v * 0.3,
          Math.cos(u * Math.PI * 2) * 0.07,
        ],
      },
      {
        name: "neighboring unpinned blade",
        cluster: 0,
        role: "petal",
        thickness: 0.01,
        flexible: true,
        cage: [2, 2],
        sample: (u, v) => [0.4 + (u - 0.5) * 0.1, v * 0.2, 0],
      },
    ],
  };
  const { indices, patches } = specimenCages(model, false),
    sim = new PetalDynamics(patches, false);
  applySpecimenPins(sim, model, indices);
  const pinned = Array.from(sim.inverseMass).flatMap((mass, i) =>
    mass === 0 ? [i] : [],
  );
  assert.deepEqual(
    pinned,
    [0, 1, 2, 3, 4, 7, 12, 17, 20, 21, 22, 23, 24, 25, 29, 35, 41, 44, 45, 46],
  );
  sim.reset();
  for (let frame = 0; frame < 8; frame++)
    sim.step(1 / 60, {
      wind: 2.4,
      time: frame / 60,
      pulse: 1,
      proximity: 1,
      x: 0,
      y: 0.15,
      z: 0,
    });
  for (const node of pinned)
    for (let axis = 0; axis < 3; axis++)
      assert.equal(sim.positions[node * 3 + axis], sim.rest[node * 3 + axis]);
  assert.ok(
    sim.inverseMass.slice(47).every((mass) => mass === 1),
    "adjacent tissue must remain flexible",
  );
});
