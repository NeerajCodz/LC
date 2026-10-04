import test from "node:test";
import assert from "node:assert/strict";
import { createCagePatch, PetalDynamics } from "../lib/three/petalDynamics";

const patch = () =>
  createCagePatch({
    columns: 4,
    rows: 5,
    thickness: 0.012,
    sample: (u, v, open) => [(u - 0.5) * 0.5, v, v * v * open * 0.2],
  });

test("surface dynamics pin insertions, remain bounded and recover across frame rates", () => {
  const ends: number[] = [];
  for (const fps of [30, 60, 120]) {
    const sim = new PetalDynamics([patch()]);
    sim.setRest(0, 1);
    sim.reset();
    const forces = {
      wind: 1,
      time: 0,
      pulse: 0,
      x: 0,
      y: 0.8,
      z: 0,
      proximity: 0,
    };
    for (let i = 0; i < fps; i++) {
      forces.time = i / fps;
      sim.step(1 / fps, forces);
    }
    for (let i = 0; i < 5 * 3; i++) assert.equal(sim.positions[i], sim.rest[i]);
    assert.ok(sim.positions.every(Number.isFinite));
    assert.ok(sim.positions.some((v, i) => Math.abs(v - sim.rest[i]) > 0.0001));
    const before = Array.from(sim.positions);
    sim.step(0, forces);
    assert.deepEqual(Array.from(sim.positions), before);
    forces.wind = 0;
    for (let i = 0; i < fps * 2; i++) sim.step(1 / fps, forces);
    const error = Math.max(
      ...sim.positions.map((v, i) => Math.abs(v - sim.rest[i])),
    );
    assert.ok(error < 0.003);
    ends.push(error);
    sim.step(60, forces);
    assert.ok(sim.positions.every(Number.isFinite));
  }
  assert.ok(Math.max(...ends) - Math.min(...ends) < 0.002);
});

test("cages obey whole-specimen budgets and retain topology through morph changes", () => {
  const sim = new PetalDynamics([patch()], true);
  const positions = sim.positions;
  for (const bloom of [0, 0.5, 1, 0]) {
    sim.setRest(0, bloom);
    sim.reset();
  }
  assert.equal(sim.positions, positions);
  assert.ok(sim.normals.every(Number.isFinite));
  assert.throws(
    () => new PetalDynamics(Array.from({ length: 20 }, patch), true),
    /512/,
  );
  assert.throws(
    () => new PetalDynamics(Array.from({ length: 80 }, patch)),
    /2048/,
  );
});
