import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import { PLUMERIA_MODEL } from "../components/flowers/plumeria/plumeriaGeometry";
import { specimenCages } from "../lib/three/specimenModel";
import { createCagePatch, PetalDynamics } from "../lib/three/petalDynamics";
import {
  closestSegments,
  closestTriangle,
  PetalContacts,
} from "../lib/three/petalContacts";

const patch = () =>
  createCagePatch({
    columns: 4,
    rows: 5,
    thickness: 0.012,
    sample: (u, v, open) => [(u - 0.5) * 0.5, v, v * v * open * 0.2],
  });

test("contact near a pinned edge endpoint cannot fling its free endpoint", () => {
  const positions = Float64Array.from([
    0, 0, 0, 1, 0, 0, 0.001, 0.004, -1, 0.001, 0.004, 1,
  ]);
  const previous = positions.slice();
  const contacts = new PetalContacts(
    new Uint32Array(),
    Uint32Array.from([0, 1, 2, 3]),
    Uint16Array.from([0, 0, 1, 1]),
    new Float64Array(4).fill(0.012),
    Float64Array.from([0, 1, 0, 0]),
    [2, 2],
  );
  assert.equal(contacts.solve(positions, previous), 1);
  assert.ok(
    Math.hypot(positions[3] - 1, positions[4], positions[5]) <= 0.012001,
  );
  for (const node of [0, 2, 3])
    for (let component = 0; component < 3; component++)
      assert.equal(
        positions[node * 3 + component],
        previous[node * 3 + component],
      );
});

test("fleshy plumeria lobes retain curvature while their overlap settles", () => {
  for (const constrained of [false, true]) {
    const { indices, patches } = specimenCages(PLUMERIA_MODEL, constrained);
    const sim = new PetalDynamics(patches, constrained);
    indices.forEach((index, i) => {
      const cluster =
        PLUMERIA_MODEL.clusters[PLUMERIA_MODEL.surfaces[index].cluster];
      const matrix = new Matrix4().compose(
        new Vector3(...cluster.position),
        new Quaternion().setFromEuler(new Euler(...cluster.rotation)),
        new Vector3(cluster.scale, cluster.scale, cluster.scale),
      );
      sim.setRest(i, 1, matrix.elements);
    });
    sim.reset();
    for (let frame = 0; frame < 240; frame++) sim.step(1 / 60);
    for (let node = 0; node < sim.inverseMass.length; node++) {
      const k = node * 3;
      const distance = Math.hypot(
        sim.positions[k] - sim.rest[k],
        sim.positions[k + 1] - sim.rest[k + 1],
        sim.positions[k + 2] - sim.rest[k + 2],
      );
      assert.ok(distance < 0.08, `lobe displacement ${distance}`);
      const normalAgreement =
        sim.normals[k] * sim.restNormals[k] +
        sim.normals[k + 1] * sim.restNormals[k + 1] +
        sim.normals[k + 2] * sim.restNormals[k + 2];
      assert.ok(
        normalAgreement > 0,
        "the fleshy lobe must not fold inside out",
      );
    }
  }
});

test("contact primitives find triangle interiors and crossing edges", () => {
  const points = Float64Array.from([-1, 0, -1, 1, 0, -1, 0, 0, 1]);
  const out = new Float64Array(9);
  closestTriangle(points, 0, 1, 2, 0, 0.005, 0, out);
  assert.ok(Math.abs(out[1]) < 1e-10 && Math.abs(out[0]) < 1e-10);
  assert.ok(Math.abs(out[3] + out[4] + out[5] - 1) < 1e-10);
  const edges = Float64Array.from([
    -1, 0, 0, 1, 0, 0, 0, 0.005, -1, 0, 0.005, 1,
  ]);
  closestSegments(edges, 0, 1, 2, 3, out);
  assert.ok(Math.abs(out[5] - 0.005) < 1e-10);
  assert.ok(Math.abs(out[3] - 0.5) < 1e-10 && Math.abs(out[4] - 0.5) < 1e-10);
});

test("thickness contacts separate flexible tissue from a pinned neighboring surface", () => {
  const obstacle = createCagePatch({
    columns: 3,
    rows: 3,
    thickness: 0.012,
    pinRows: 4,
    sample: (u, v) => [(u - 0.5) * 0.8, v, 0],
  });
  const flexible = createCagePatch({
    columns: 3,
    rows: 3,
    thickness: 0.012,
    sample: (u, v) => [(u - 0.5) * 0.5, v * 0.9 + 0.03, 0.004],
  });
  const sim = new PetalDynamics([obstacle, flexible]);
  sim.step(1 / 30);
  assert.ok(sim.contactCount > 0);
  const offset = sim.offsets[1];
  for (let i = 8; i < 16; i++)
    assert.ok(sim.positions[(offset + i) * 3 + 2] >= 0.01);
  for (let i = 0; i < obstacle.open.length; i++)
    assert.equal(sim.positions[i], sim.rest[i]);
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
test("extreme force inputs stay finite and reverse bloom retains fixed insertions", () => {
  const sim = new PetalDynamics([patch()], true),
    forces = {
      wind: 1e8,
      time: NaN,
      pulse: 1e8,
      x: Infinity,
      y: 0,
      z: 0,
      proximity: Infinity,
    };
  for (const bloom of [1, 0.5, 0, 0.5, 1]) {
    sim.setRest(0, bloom);
    sim.step(10, forces);
    assert.ok(sim.positions.every(Number.isFinite));
    for (let node = 0; node < sim.inverseMass.length; node++)
      for (let c = 0; c < 3; c++) {
        const k = node * 3 + c;
        assert.ok(Math.abs(sim.positions[k] - sim.rest[k]) <= 0.180001);
        if (!sim.inverseMass[node]) assert.equal(sim.positions[k], sim.rest[k]);
      }
  }
  const before = sim.positions.slice();
  sim.step(0);
  assert.deepEqual(sim.positions, before);
  sim.reset();
  assert.deepEqual(sim.positions, sim.rest);
});
