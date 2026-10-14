import test from "node:test";
import assert from "node:assert/strict";
import { Matrix4, Object3D } from "three";
import { PetalDynamics, type SurfaceForces } from "../lib/three/petalDynamics";
import {
  specimenCages,
  applySpecimenPins,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { petalOpenness } from "../lib/three/easing";
import { SurfaceClock } from "../lib/three/surfaceClock";
import { CYMES_MODELS } from "./cymes-and-spikes-models";

function transformedClusters(model: SpecimenModel) {
  const plant = new Object3D(),
    cluster = new Object3D();
  plant.position.set(-0.38, 0.27, 0.19);
  plant.rotation.set(-0.21, 0.46, 0.17);
  plant.scale.setScalar(0.88);
  plant.updateMatrix();
  return model.clusters.map((pose) => {
    cluster.position.set(...pose.position);
    cluster.rotation.set(...pose.rotation);
    cluster.scale.setScalar(pose.scale);
    cluster.updateMatrix();
    return new Matrix4().multiplyMatrices(plant.matrix, cluster.matrix);
  });
}

function simulationFor(model: SpecimenModel, constrained: boolean) {
  const { indices, patches } = specimenCages(model, constrained),
    sim = new PetalDynamics(patches, constrained),
    clusters = transformedClusters(model);
  assert.ok(patches.length > 0, "the real specimen supplies contact tissue");
  assert.ok(
    sim.inverseMass.length > 0 &&
      sim.inverseMass.length <= (constrained ? 512 : 2048),
  );
  assert.equal(sim.stepSize, constrained ? 1 / 60 : 1 / 120);
  applySpecimenPins(sim, model, indices);
  const restAt = (bloom: number) =>
    indices.forEach((index, patch) => {
      const surface = model.surfaces[index];
      sim.setRest(
        patch,
        petalOpenness(bloom, surface.delay ?? 0, index * 0.31),
        clusters[surface.cluster].elements,
      );
    });
  restAt(1);
  sim.reset();
  return { sim, indices, patches, clusters, restAt };
}

function meanFreeError(sim: PetalDynamics, reference = sim.rest) {
  let squared = 0,
    count = 0;
  for (let node = 0; node < sim.inverseMass.length; node++) {
    if (!sim.inverseMass[node]) continue;
    for (let axis = 0; axis < 3; axis++) {
      const k = node * 3 + axis;
      squared += (sim.positions[k] - reference[k]) ** 2;
    }
    count++;
  }
  assert.ok(count > 0, "the model keeps a free tissue response");
  return Math.sqrt(squared / count);
}

function assertAttached(sim: PetalDynamics, label: string) {
  for (let node = 0; node < sim.inverseMass.length; node++) {
    const k = node * 3,
      distance = Math.hypot(
        sim.positions[k] - sim.rest[k],
        sim.positions[k + 1] - sim.rest[k + 1],
        sim.positions[k + 2] - sim.rest[k + 2],
      );
    assert.ok(
      Number.isFinite(distance) && distance < 0.325,
      `${label}: bounded node ${node}`,
    );
    if (!sim.inverseMass[node])
      for (let axis = 0; axis < 3; axis++)
        assert.equal(
          sim.positions[k + axis],
          sim.rest[k + axis],
          `${label}: insertion ${node} is pinned`,
        );
    for (let axis = 0; axis < 3; axis++)
      assert.ok(Number.isFinite(sim.velocity[k + axis]));
    assert.ok(
      Math.abs(
        Math.hypot(sim.normals[k], sim.normals[k + 1], sim.normals[k + 2]) - 1,
      ) < 1e-8,
      `${label}: finite unit normal ${node}`,
    );
  }
}

const STILL: SurfaceForces = {
  wind: 0,
  pulse: 0,
  time: 0,
  x: 0,
  y: 0,
  z: 0,
  proximity: 0,
};

test("hollyhock: full-bloom claws separate non-neighbor pinned contact roots by actual tissue thickness", () => {
  const specimen = CYMES_MODELS.find(({ slug }) => slug === "hollyhock");
  assert.ok(specimen);
  for (const constrained of [false, true]) {
    const { sim, patches, indices } = simulationFor(
      specimen.model,
      constrained,
    );
    patches.forEach((patch, index) => {
      const surface = specimen.model.surfaces[indices[index]];
      assert.equal(surface.role, "petal");
      assert.equal(patch.periodic, false);
      // Neighboring columns are excluded from self-contact; roots two columns apart are not.
      for (let left = 0; left <= patch.columns; left++)
        for (let right = left + 2; right <= patch.columns; right++) {
          const a = sim.offsets[index] + left,
            b = sim.offsets[index] + right,
            distance = Math.hypot(
              sim.rest[a * 3] - sim.rest[b * 3],
              sim.rest[a * 3 + 1] - sim.rest[b * 3 + 1],
              sim.rest[a * 3 + 2] - sim.rest[b * 3 + 2],
            );
          assert.equal(sim.inverseMass[a], 0);
          assert.equal(sim.inverseMass[b], 0);
          assert.ok(
            distance > patch.thickness,
            `${constrained ? "constrained" : "desktop"}/cluster ${surface.cluster}/roots ${left},${right}: claw clearance ${distance} must exceed tissue thickness ${patch.thickness}`,
          );
        }
    });
  }
});

for (const { slug, model } of CYMES_MODELS) {
  test(`${slug}: transformed whole-model cages retain pins through contact, pulse and uninterrupted reverse bloom`, (t) => {
    for (const constrained of [false, true]) {
      const { sim, indices, patches, clusters, restAt } = simulationFor(
          model,
          constrained,
        ),
        positions = sim.positions,
        normals = sim.normals,
        fullRest = sim.rest.slice(),
        firstFree = sim.inverseMass.findIndex((mass) => mass > 0);
      assert.ok(firstFree >= 0);
      const force: SurfaceForces = {
        ...STILL,
        x: sim.rest[firstFree * 3],
        y: sim.rest[firstFree * 3 + 1],
        z: sim.rest[firstFree * 3 + 2],
      };
      let frames = 0,
        contacts = 0;
      const advance = (count: number, stage: string) => {
        for (let frame = 0; frame < count; frame++) {
          force.time = frames++ / 60;
          sim.step(1 / 60, force);
          contacts += sim.contactCount;
          assertAttached(
            sim,
            `${slug}/${constrained ? "constrained" : "desktop"}/${stage}`,
          );
        }
      };
      force.wind = 2.4;
      advance(12, "gust");
      assert.ok(meanFreeError(sim) > 1e-6);
      force.wind = 0;
      force.proximity = 1;
      advance(10, "pointer contact on actual tissue");
      force.proximity = 0;
      force.pulse = 1;
      advance(10, "pulse");
      force.pulse = 0;
      advance(24, "release");
      for (const bloom of [0.5, 0, 0.5, 1]) {
        restAt(bloom);
        advance(8, `reverse bloom ${bloom}`);
      }
      assert.deepEqual(
        sim.rest,
        fullRest,
        "reopening restores the authored transformed rest state",
      );
      assert.equal(
        sim.positions,
        positions,
        "simulation storage survives bloom reversal",
      );
      assert.equal(sim.normals, normals);
      sim.reset();
      assert.deepEqual(sim.positions, sim.rest);
      assert.deepEqual(sim.previous, sim.rest);
      assert.ok(sim.velocity.every((value) => value === 0));
      assertAttached(sim, `${slug}/settled reduced motion`);

      // Compare matched unforced tissue: curved cages may resolve self-contact at rest.
      // This still catches contact traps caused by forcing, which differ from that baseline.
      const flexible = indices.findIndex(
        (index) => model.surfaces[index].flexible,
      );
      assert.ok(flexible >= 0);
      const isolated = new PetalDynamics([patches[flexible]], constrained),
        unforced = new PetalDynamics([patches[flexible]], constrained),
        surface = model.surfaces[indices[flexible]];
      for (const tissue of [isolated, unforced]) {
        applySpecimenPins(tissue, model, [indices[flexible]]);
        tissue.setRest(0, 1, clusters[surface.cluster].elements);
        tissue.reset();
      }
      force.wind = 2.4;
      force.pulse = 1;
      for (let frame = 0; frame < 20; frame++) {
        force.time = frame / 60;
        isolated.step(1 / 60, force);
        unforced.step(1 / 60);
      }
      const driven = meanFreeError(isolated, unforced.positions);
      assert.ok(driven > 1e-6);
      for (let frame = 0; frame < 80; frame++) {
        isolated.step(1 / 60);
        unforced.step(1 / 60);
      }
      const recovered = meanFreeError(isolated, unforced.positions);
      assert.ok(
        recovered < driven * 0.3,
        `${slug}: released perturbation ${recovered} remains below 30% of driven perturbation ${driven}`,
      );
      assertAttached(isolated, `${slug}/released organ`);
      assertAttached(unforced, `${slug}/unforced recovery baseline`);
      t.diagnostic(
        `${constrained ? "constrained" : "desktop"}: ${sim.inverseMass.length} nodes, ${frames} frames, ${contacts} resolved contacts`,
      );
    }
  });

  test(`${slug}: real cages freeze while inactive, settle for reduced motion and bound extreme time/forces`, () => {
    for (const constrained of [false, true]) {
      const { sim, restAt } = simulationFor(model, constrained),
        clock = new SurfaceClock();
      assert.equal(clock.delta(0), 0);
      sim.step(clock.delta(1 / 60), { ...STILL, pulse: 1, wind: 2.4 });
      const retained = sim.positions.slice(),
        velocity = sim.velocity.slice();
      for (let frame = 0; frame < 120; frame++)
        sim.step(clock.delta(1 / 60), { ...STILL, pulse: 1 });
      assert.deepEqual(
        sim.positions,
        retained,
        "retained active time freezes positions",
      );
      assert.deepEqual(
        sim.velocity,
        velocity,
        "pause does not accumulate force",
      );
      for (const invalidDt of [0, -1, Number.NaN])
        sim.step(invalidDt, { ...STILL, wind: 4 });
      assert.deepEqual(sim.positions, retained);
      restAt(0.5);
      assert.equal(clock.delta(3600, true), -1);
      sim.reset();
      assert.deepEqual(sim.positions, sim.rest);
      assert.ok(sim.velocity.every((value) => value === 0));
      assert.equal(
        clock.delta(3600),
        0,
        "leaving reduced motion does not replay elapsed time",
      );

      const long = simulationFor(model, constrained).sim,
        bounded = simulationFor(model, constrained).sim,
        force = { ...STILL, wind: 2.4, pulse: 1 };
      long.step(3600, force);
      bounded.step(1 / 30, force); // Four desktop or two constrained substeps.
      assert.deepEqual(
        long.positions,
        bounded.positions,
        "a long frame cannot exceed the per-call substep cap",
      );
      assert.deepEqual(long.velocity, bounded.velocity);
      const after = long.positions.slice();
      long.step(1 / 1200, force);
      assert.deepEqual(
        long.positions,
        after,
        "discarded catch-up time is not queued for later frames",
      );
      assertAttached(long, `${slug}/long-frame cap`);

      const invalid = simulationFor(model, constrained).sim,
        still = simulationFor(model, constrained).sim;
      invalid.step(1 / 60, {
        wind: Number.NaN,
        pulse: Infinity,
        time: -Infinity,
        x: Infinity,
        y: Number.NaN,
        z: -Infinity,
        proximity: Number.NaN,
      });
      still.step(1 / 60, STILL);
      assert.deepEqual(
        invalid.positions,
        still.positions,
        "nonfinite input cannot poison authored tissue",
      );
      sim.step(Infinity, {
        wind: 1e20,
        pulse: -1e20,
        time: 1e20,
        x: 1e20,
        y: -1e20,
        z: 1e20,
        proximity: 1e20,
      });
      assertAttached(sim, `${slug}/extreme bounded forcing`);
    }
  });
}
