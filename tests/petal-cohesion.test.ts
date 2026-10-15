import test from "node:test";
import assert from "node:assert/strict";
import { createCagePatch, PetalDynamics } from "../lib/three/petalDynamics";
import { PetalContacts } from "../lib/three/petalContacts";
import {
  specimenCages,
  type SpecimenModel,
  type SpecimenSurface,
} from "../lib/three/specimenModel";

type Cohesion = { group: number; release: number; persistent?: boolean };
const cohesion: Cohesion = { group: 3, release: 0.25 };
const force = {
  wind: 2.4,
  pulse: 1,
  proximity: 1,
  time: 0,
  x: 0,
  y: 0.5,
  z: 0,
};
function patch(
  closedCohesion?: Cohesion,
  options: {
    columns?: number;
    rows?: number;
    pinRows?: number;
    periodic?: boolean;
    x?: number;
    z?: number;
  } = {},
) {
  return createCagePatch({
    columns: options.columns ?? 2,
    rows: options.rows ?? 3,
    pinRows: options.pinRows ?? 1,
    periodic: options.periodic ?? false,
    thickness: 0.012,
    closedCohesion,
    sample: (u, v, open) => [
      (u - 0.5) * 0.2 + (options.x ?? 0),
      0.1 + v * 0.7,
      (options.z ?? 0) + open * 0.02 * v * v,
    ],
  });
}
function setOpen(sim: PetalDynamics, open: number) {
  sim.patches.forEach((_, index) => sim.setRest(index, open));
}
function rowSpread(sim: PetalDynamics, members: number[], row: number) {
  const stride = sim.patches[members[0]].columns + 1,
    reference = (sim.offsets[members[0]] + row * stride) * 3;
  let spread = 0;
  for (const member of members)
    for (let column = 0; column < stride; column++) {
      const index = (sim.offsets[member] + row * stride + column) * 3;
      for (let axis = 0; axis < 3; axis++)
        spread = Math.max(
          spread,
          Math.abs(
            sim.positions[index + axis] -
              sim.rest[index + axis] -
              (sim.positions[reference + axis] - sim.rest[reference + axis]),
          ),
        );
    }
  return spread;
}

test("closed cohesion reaches real cages and rejects incompatible groups", () => {
  assert.deepEqual(patch(cohesion).closedCohesion, cohesion);
  assert.throws(
    () => new PetalDynamics([patch(cohesion)]),
    "a declared closed cohort cannot be constructed from a singleton",
  );
  for (const bad of [
    { group: -1, release: 0.25 },
    { group: 0.5, release: 0.25 },
    { group: NaN, release: 0.25 },
    { group: 3, release: 0 },
    { group: 3, release: 1.1 },
    { group: 3, release: NaN },
  ])
    assert.throws(() => new PetalDynamics([patch(bad), patch(bad)]));
  for (const incompatible of [
    patch(cohesion, { columns: 1 }),
    patch(cohesion, { rows: 2 }),
    patch(cohesion, { pinRows: 0 }),
    patch(cohesion, { periodic: true }),
    patch({ ...cohesion, release: 0.5 }),
    patch({ ...cohesion, persistent: true }),
  ])
    assert.throws(() => new PetalDynamics([patch(cohesion), incompatible]));
  assert.doesNotThrow(
    () => new PetalDynamics([patch(cohesion), patch(cohesion)]),
  );
});

test("specimen cohesion is explicit, propagated, and confined to one cluster", () => {
  const surface = (cluster: number): SpecimenSurface => ({
    name: "real closed lobe",
    cluster,
    role: "petal",
    thickness: 0.012,
    flexible: true,
    cage: [2, 3],
    mobileCage: [1, 1],
    closedCohesion: cohesion,
    sample: (u, v) => [u * 0.2, v, 0],
  });
  const model: SpecimenModel = {
    clusters: [0, 1].map(() => ({
      position: [0, 0, 0],
      rotation: [0, 0, 0],
      scale: 1,
      nod: 0,
    })),
    surfaces: [surface(0), surface(0)],
    organs: [],
  };
  for (const constrained of [false, true]) {
    const { patches } = specimenCages(model, constrained);
    assert.deepEqual(
      patches.map((p) => p.closedCohesion),
      [cohesion, cohesion],
    );
    assert.equal(
      new PetalDynamics(patches, constrained).inverseMass.length,
      constrained ? 8 : 24,
    );
    assert.throws(() =>
      specimenCages(
        { ...model, surfaces: [surface(0), surface(1)] },
        constrained,
      ),
    );
  }
});

test("closed rows move together with pinned roots and coherent final velocities", () => {
  for (const constrained of [false, true]) {
    const sim = new PetalDynamics(
        [patch(cohesion), patch(cohesion)],
        constrained,
      ),
      positions = sim.positions,
      nodes = sim.inverseMass.length;
    setOpen(sim, 0);
    sim.reset();
    for (let frame = 0; frame < 20; frame++) {
      sim.step(sim.stepSize, { ...force, time: frame * sim.stepSize });
      assert.equal(
        sim.contactCount,
        0,
        "closed seams must not repel themselves",
      );
      for (let row = 0; row <= 3; row++)
        assert.ok(rowSpread(sim, [0, 1], row) < 1e-10, `closed row ${row}`);
      for (let node = 0; node < nodes; node++)
        for (let axis = 0; axis < 3; axis++) {
          const index = node * 3 + axis;
          if (!sim.inverseMass[node]) {
            assert.equal(sim.positions[index], sim.rest[index]);
            assert.equal(sim.velocity[index], 0);
          }
          const actualVelocity = Math.max(
            -2,
            Math.min(
              2,
              (sim.positions[index] - sim.previous[index]) / sim.stepSize,
            ),
          );
          assert.ok(
            Math.abs(sim.velocity[index] - actualVelocity) < 1e-10,
            "velocity must include the final cohesion/contact projection",
          );
        }
    }
    assert.equal(sim.positions, positions);
    assert.equal(sim.inverseMass.length, nodes);
    assert.ok(sim.positions.some((v, i) => Math.abs(v - sim.rest[i]) > 1e-5));
    assert.ok(sim.normals.every(Number.isFinite));
    const finalNormals = new Float64Array(sim.normals.length);
    sim.computeNormals(sim.positions, finalNormals);
    assert.deepEqual(
      sim.normals,
      finalNormals,
      "normals must use the final coupled/contact-projected positions",
    );
    const paused = sim.positions.slice(),
      pausedVelocity = sim.velocity.slice();
    sim.step(0, force);
    assert.deepEqual(sim.positions, paused);
    assert.deepEqual(sim.velocity, pausedVelocity);
    sim.reset();
    assert.deepEqual(sim.positions, sim.rest);
    assert.ok(sim.velocity.every((v) => v === 0));
    assert.deepEqual(sim.normals, sim.restNormals);
  }
});

test("released groups exactly preserve the unannotated solver and restore inter-patch contacts", () => {
  for (const constrained of [false, true]) {
    const legacy = new PetalDynamics(
        [patch(), patch(undefined, { z: 0.004 })],
        constrained,
      ),
      released = new PetalDynamics(
        [patch(cohesion), patch(cohesion, { z: 0.004 })],
        constrained,
      );
    for (const open of [1, 0.25, 1]) {
      setOpen(legacy, open);
      setOpen(released, open);
      legacy.reset();
      released.reset();
      let contacts = 0;
      for (let frame = 0; frame < 10; frame++) {
        const input = { ...force, time: frame / 60 };
        legacy.step(1 / 60, input);
        released.step(1 / 60, input);
        assert.deepEqual(released.positions, legacy.positions);
        assert.deepEqual(released.normals, legacy.normals);
        assert.deepEqual(released.velocity, legacy.velocity);
        assert.equal(released.contactCount, legacy.contactCount);
        contacts += released.contactCount;
      }
      assert.ok(contacts > 0, "fully released members must collide normally");
      assert.ok(
        rowSpread(released, [0, 1], 3) > 1e-6,
        "open lobes move independently",
      );
    }
  }
});

test("persistent young tissue stays coupled at UI full bloom and reverse bloom re-arms ordinary groups", () => {
  const young = { ...cohesion, persistent: true },
    youngPatches = [patch(young), patch(young)];
  youngPatches.forEach((p) => p.open.set(p.folded));
  const persistent = new PetalDynamics(youngPatches),
    reversing = new PetalDynamics([patch(cohesion), patch(cohesion)]);
  for (const open of [0, 0.24, 0.25, 1, 0.25, 0.24, 0]) {
    setOpen(persistent, open);
    setOpen(reversing, open);
    for (let frame = 0; frame < 10; frame++) {
      persistent.step(1 / 60, force);
      reversing.step(1 / 60, force);
      assert.equal(persistent.contactCount, 0);
      assert.ok(rowSpread(persistent, [0, 1], 3) < 1e-10);
      assert.ok(reversing.positions.every(Number.isFinite));
      assert.ok(reversing.velocity.every((v) => Math.abs(v) <= 2));
    }
    if (open === 0) {
      assert.equal(reversing.contactCount, 0);
      assert.ok(rowSpread(reversing, [0, 1], 3) < 1e-10);
    }
  }
});

test("closed cohesion retains external obstacle clearance after the complete solver projection", () => {
  for (const constrained of [false, true])
    for (const separateGroup of [false, true])
      for (const open of [0, 1e-8, 0.0625, 0.125, 0.249999, 0.25, 0.250001]) {
        const obstacleCohesion = separateGroup
          ? { group: 9, release: 0.25 }
          : undefined;
        const obstacle = createCagePatch({
          columns: 3,
          rows: 3,
          pinRows: 4,
          thickness: 0.012,
          closedCohesion: obstacleCohesion,
          sample: (u, v) => [(u - 0.5) * 0.8, 0.1 + v * 0.7, 0],
        });
        // Only the first coupled member touches this independent pinned tissue.
        const sim = new PetalDynamics(
          [
            obstacle,
            patch(cohesion, { z: 0.004 }),
            patch(cohesion, { x: 1.2, z: 0.004 }),
            ...(separateGroup
              ? [
                  createCagePatch({
                    columns: 3,
                    rows: 3,
                    pinRows: 4,
                    thickness: 0.012,
                    closedCohesion: obstacleCohesion,
                    sample: (u, v) => [3 + (u - 0.5) * 0.8, 0.1 + v * 0.7, 0],
                  }),
                ]
              : []),
          ],
          constrained,
        );
        setOpen(sim, open);
        sim.reset();
        sim.step(1 / 30);
        assert.ok(
          sim.contactCount > 0,
          "external tissue contact must still execute",
        );
        for (let node = 6; node < 12; node++)
          assert.ok(
            sim.positions[(sim.offsets[1] + node) * 3 + 2] >= 0.01,
            `the final cohesion projection must not undo external tissue clearance at ${open}`,
          );
        if (open === 0)
          for (let row = 1; row <= 3; row++)
            assert.ok(rowSpread(sim, [1, 2], row) < 1e-10);
        for (let i = 0; i < obstacle.open.length; i++)
          assert.equal(sim.positions[i], sim.rest[i]);
      }
});

test("one contact cannot spend a coupled row's projection budget once per barycentric endpoint", () => {
  for (const weight of [0, 0.25, 0.5, 0.75, 1]) {
    const positions = Float64Array.from([
        0, 0, 0, 1, 0, 0, 0.5, 0.004, -1, 0.5, 0.004, 1, 2, 0, 0, 3, 0, 0,
      ]),
      previous = positions.slice(),
      contacts = new PetalContacts(
        new Uint32Array(),
        Uint32Array.from([0, 1, 2, 3]),
        Uint16Array.from([0, 0, 1, 1, 2, 2]),
        new Float64Array(6).fill(0.012),
        Float64Array.from([1, 1, 0, 0, 1, 1]),
        [2, 2, 2],
        {
          patchGroups: Int32Array.from([0, -1, 0]),
          weights: Float64Array.from([weight]),
          nodeRows: Int32Array.from([0, 0, -1, -1, 0, 0]),
          rows: [{ group: 0, nodes: Uint32Array.from([0, 1, 4, 5]) }],
        },
      );
    assert.equal(contacts.solve(positions, previous), 1);
    for (const node of [0, 1, 4, 5]) {
      const displacement = Math.hypot(
        positions[node * 3] - previous[node * 3],
        positions[node * 3 + 1] - previous[node * 3 + 1],
        positions[node * 3 + 2] - previous[node * 3 + 2],
      );
      assert.ok(
        displacement <= 0.012001,
        `cohesion ${weight}: one contact exceeded the existing thickness budget: ${displacement}`,
      );
    }
    for (const node of [2, 3])
      for (let axis = 0; axis < 3; axis++)
        assert.equal(positions[node * 3 + axis], previous[node * 3 + axis]);
  }
});

test("an infinitesimal opening cannot abruptly release closed seam contact projection", () => {
  const adjacent = (x: number) =>
    createCagePatch({
      columns: 2,
      rows: 3,
      pinRows: 1,
      thickness: 0.012,
      closedCohesion: cohesion,
      sample: (u, v, open) => [
        (u - 0.5) * 0.2 + x,
        v,
        Math.sign(x) * open * 0.2 * v,
      ],
    });
  for (const constrained of [false, true])
    for (const input of [undefined, force]) {
      const closed = new PetalDynamics(
        [adjacent(-0.1), adjacent(0.1)],
        constrained,
      );
      setOpen(closed, 0);
      closed.reset();
      closed.step(1 / 60, input);
      assert.equal(closed.contactCount, 0);
      for (const open of [1e-8, 1e-6]) {
        const opening = new PetalDynamics(
          [adjacent(-0.1), adjacent(0.1)],
          constrained,
        );
        setOpen(opening, open);
        opening.reset();
        opening.step(1 / 60, input);
        const change = Math.max(
          ...opening.positions.map((value, i) =>
            Math.abs(value - closed.positions[i]),
          ),
        );
        assert.ok(
          change < 1e-4,
          `near-closed release must be continuous at ${open}; measured jump ${change}`,
        );
        assert.ok(
          opening.contactCount > 0,
          "partly released seams still process contacts without an exclusion epsilon",
        );
      }
      for (const center of [0.0625, 0.125, cohesion.release]) {
        const reference = new PetalDynamics(
          [adjacent(-0.1), adjacent(0.1)],
          constrained,
        );
        setOpen(reference, center);
        reference.reset();
        reference.step(1 / 60, input);
        for (const open of [center - 1e-6, center + 1e-6]) {
          const neighbor = new PetalDynamics(
            [adjacent(-0.1), adjacent(0.1)],
            constrained,
          );
          setOpen(neighbor, open);
          neighbor.reset();
          neighbor.step(1 / 60, input);
          const change = Math.max(
            ...neighbor.positions.map((value, i) =>
              Math.abs(value - reference.positions[i]),
            ),
          );
          assert.ok(
            change < 1e-4,
            `release must be continuous around ${center} at ${open}; measured jump ${change}`,
          );
        }
      }
    }
});
