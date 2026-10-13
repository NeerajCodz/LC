import test from "node:test";
import assert from "node:assert/strict";
import {
  InstancedMesh,
  Matrix4,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Vector3,
} from "three";
import { PetalDynamics, type SurfaceForces } from "../lib/three/petalDynamics";
import {
  specimenCages,
  applySpecimenPins,
  type SpecimenModel,
  type SpecimenInstanceGroup,
} from "../lib/three/specimenModel";
import {
  specimenInstanceGeometry,
  updateFloretInstances,
} from "../lib/three/floretInstances";
import { petalOpenness } from "../lib/three/easing";
import { supportedBendSlope, supportedBendWeight } from "../lib/flowers/wind";
import { PANSY_MODEL } from "../components/flowers/pansy/pansyGeometry";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
import { BLUEBELL_MODEL } from "../components/flowers/bluebell/bluebellGeometry";
import { HYACINTH_MODEL } from "../components/flowers/hyacinth/hyacinthGeometry";
import { AMARYLLIS_MODEL } from "../components/flowers/amaryllis/amaryllisGeometry";
import { CANNA_MODEL } from "../components/flowers/canna/cannaGeometry";
import { AGAPANTHUS_MODEL } from "../components/flowers/agapanthus/agapanthusGeometry";
import {
  WISTERIA_MODEL,
  WISTERIA_SHOOT_POINTS,
  WISTERIA_STEM_LENGTH,
  WISTERIA_SUPPORT_HEIGHT,
} from "../components/flowers/wisteria/wisteriaGeometry";
import { BOTTLEBRUSH_MODEL } from "../components/flowers/bottlebrush/bottlebrushGeometry";
import { SCABIOSA_MODEL } from "../components/flowers/scabiosa/scabiosaGeometry";
import type { Vec3 } from "../lib/flowers/types";

const SPECIMENS = [
  ["pansy", PANSY_MODEL],
  ["african-violet", AFRICAN_VIOLET_MODEL],
  ["bluebell", BLUEBELL_MODEL],
  ["hyacinth", HYACINTH_MODEL],
  ["amaryllis", AMARYLLIS_MODEL],
  ["canna", CANNA_MODEL],
  ["agapanthus", AGAPANTHUS_MODEL],
  ["wisteria", WISTERIA_MODEL],
  ["bottlebrush", BOTTLEBRUSH_MODEL],
  ["scabiosa", SCABIOSA_MODEL],
] as const;

function plantedMatrix() {
  const plant = new Object3D();
  plant.position.set(-0.38, 0.27, 0.19);
  plant.rotation.set(-0.21, 0.46, 0.17);
  plant.scale.setScalar(0.88);
  plant.updateMatrix();
  return plant.matrix.clone();
}

function clusterMatrices(model: SpecimenModel, parent: Matrix4) {
  const cluster = new Object3D();
  return model.clusters.map((c) => {
    cluster.position.set(...c.position);
    cluster.rotation.set(...c.rotation);
    cluster.scale.setScalar(c.scale);
    cluster.updateMatrix();
    return new Matrix4().multiplyMatrices(parent, cluster.matrix);
  });
}

function meanFreeError(sim: PetalDynamics) {
  let squared = 0,
    count = 0;
  for (let node = 0; node < sim.inverseMass.length; node++) {
    if (!sim.inverseMass[node]) continue;
    for (let axis = 0; axis < 3; axis++) {
      const k = node * 3 + axis;
      squared += (sim.positions[k] - sim.rest[k]) ** 2;
    }
    count++;
  }
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
      `${label}: node ${node} stays within its local tissue envelope`,
    );
    if (!sim.inverseMass[node])
      for (let axis = 0; axis < 3; axis++)
        assert.equal(
          sim.positions[k + axis],
          sim.rest[k + axis],
          `${label}: insertion ${node} does not drift`,
        );
    assert.ok(
      Number.isFinite(
        sim.velocity[k] + sim.velocity[k + 1] + sim.velocity[k + 2],
      ),
    );
    assert.ok(
      Math.abs(
        Math.hypot(sim.normals[k], sim.normals[k + 1], sim.normals[k + 2]) - 1,
      ) < 1e-8,
      `${label}: node ${node} retains a unit normal`,
    );
  }
}

for (const [name, model] of SPECIMENS)
  test(`${name}: actual transformed cages retain attachments through gust, contact, pulse and uninterrupted reverse bloom`, (t) => {
    const parent = plantedMatrix(),
      clusters = clusterMatrices(model, parent);
    for (const constrained of [false, true]) {
      const { indices, patches } = specimenCages(model, constrained),
        sim = new PetalDynamics(patches, constrained),
        initialPositions = sim.positions,
        initialNormals = sim.normals;
      assert.ok(
        sim.inverseMass.length > 0 &&
          sim.inverseMass.length <= (constrained ? 512 : 2048),
      );
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
      const fullRest = sim.rest.slice(),
        firstFree = sim.inverseMass.findIndex((mass) => mass > 0),
        force: SurfaceForces = {
          wind: 0,
          pulse: 0,
          time: 0,
          x: sim.rest[firstFree * 3],
          y: sim.rest[firstFree * 3 + 1],
          z: sim.rest[firstFree * 3 + 2],
          proximity: 0,
        };
      assert.ok(firstFree >= 0, "the authored model retains flexible tissue");
      let frames = 0,
        elapsed = 0,
        contacts = 0;
      const advance = (count: number, label: string) => {
        for (let frame = 0; frame < count; frame++) {
          force.time = frames / 60;
          const start = performance.now();
          sim.step(1 / 60, force);
          elapsed += performance.now() - start;
          frames++;
          contacts += sim.contactCount;
          assertAttached(
            sim,
            `${name}/${constrained ? "constrained" : "desktop"}/${label}`,
          );
        }
      };
      force.wind = 2.4;
      advance(12, "gust");
      assert.ok(
        meanFreeError(sim) > 1e-6,
        "the actual transformed petals respond to forcing",
      );
      force.wind = 0;
      force.proximity = 1;
      advance(10, "pointer contact at a real cage insertion");
      force.proximity = 0;
      force.pulse = 1;
      advance(10, "bloom pulse");
      force.pulse = 0;
      advance(24, "released interaction");
      // Do not reset between stages: velocities and physical contacts survive reversal.
      for (const bloom of [0.5, 0, 0.5, 1]) {
        restAt(bloom);
        advance(8, `reverse bloom ${bloom}`);
      }
      assert.deepEqual(
        sim.rest,
        fullRest,
        "reopening returns to exactly the authored transformed rest shape",
      );
      assert.equal(sim.positions, initialPositions);
      assert.equal(sim.normals, initialNormals);
      sim.reset();
      assert.deepEqual(
        sim.positions,
        sim.rest,
        "reduced motion settles directly to the current authored bloom",
      );
      assert.deepEqual(sim.previous, sim.rest);
      assert.ok(sim.velocity.every((v) => v === 0));
      assertAttached(sim, `${name}/reduced motion`);

      // Separate elastic recovery from neighboring surfaces' persistent rest overlap.
      // This is the species' actual first flexible organ, with its actual cluster pose.
      const flexible = indices.findIndex(
          (index) => model.surfaces[index].flexible,
        ),
        isolated = new PetalDynamics([patches[flexible]], constrained),
        surface = model.surfaces[indices[flexible]];
      isolated.setRest(0, 1, clusters[surface.cluster].elements);
      isolated.reset();
      force.wind = 2.4;
      force.pulse = 1;
      for (let frame = 0; frame < 20; frame++) {
        force.time = frame / 60;
        isolated.step(1 / 60, force);
      }
      const driven = meanFreeError(isolated);
      assert.ok(driven > 1e-6, "the actual representative organ deforms");
      for (let frame = 0; frame < 80; frame++) isolated.step(1 / 60);
      const recovered = meanFreeError(isolated);
      assert.ok(
        recovered < driven * 0.3,
        `${name}: released tissue error ${recovered} falls below 30% of driven error ${driven}`,
      );
      assertAttached(isolated, `${name}/elastic recovery`);
      t.diagnostic(
        `${constrained ? "constrained" : "desktop"}: ${sim.inverseMass.length} nodes; ${frames} scene steps; ${(elapsed / frames).toFixed(3)} ms/step; ${contacts} resolved contacts; released representative error ${(recovered / driven).toExponential(2)} of driven`,
      );
    }
  });

function verifyCarriedInsertions(
  name: string,
  model: SpecimenModel,
  groups: { group: SpecimenInstanceGroup; surfaces: number[]; base: Vec3 }[],
) {
  test(`${name}: rendered organ carriers remain on the transformed pinned floral insertion through reverse bloom`, () => {
    const clusters = clusterMatrices(model, plantedMatrix()),
      scratch = new Object3D(),
      poseMatrix = new Matrix4(),
      world = new Matrix4(),
      centroid = new Vector3(),
      rendered = new Vector3();
    for (const constrained of [false, true]) {
      const { indices, patches } = specimenCages(model, constrained),
        sim = new PetalDynamics(patches, constrained);
      for (const { group, surfaces, base } of groups) {
        const geometry = specimenInstanceGeometry(
            group,
            constrained ? "overview" : "low",
          ),
          material = new MeshStandardMaterial(),
          prototype = geometry.organs[0] ?? geometry.surfaces[0],
          mesh = new InstancedMesh(prototype, material, group.poses.length),
          target = new Mesh(prototype, material);
        try {
          assert.equal(surfaces.length, group.poses.length);
          for (const bloom of [0, 0.7, 1, 0.35, 0]) {
            updateFloretInstances(
              mesh,
              target,
              group.poses,
              bloom,
              5,
              1,
              true,
              scratch,
            );
            surfaces.forEach((surfaceIndex, instance) => {
              const surface = model.surfaces[surfaceIndex],
                patchIndex = indices.indexOf(surfaceIndex),
                patch = patches[patchIndex],
                stride = patch.periodic ? patch.columns : patch.columns + 1;
              assert.ok(
                patch.periodic,
                "a circular insertion supplies a whole pinned base ring",
              );
              sim.setRest(
                patchIndex,
                petalOpenness(bloom, surface.delay ?? 0, surfaceIndex * 0.31),
                clusters[surface.cluster].elements,
              );
              centroid.set(0, 0, 0);
              for (let column = 0; column < stride; column++) {
                const node = sim.offsets[patchIndex] + column;
                assert.equal(sim.inverseMass[node], 0);
                centroid.x += sim.rest[node * 3] / stride;
                centroid.y += sim.rest[node * 3 + 1] / stride;
                centroid.z += sim.rest[node * 3 + 2] / stride;
              }
              mesh.getMatrixAt(instance, poseMatrix);
              world.multiplyMatrices(clusters[group.cluster], poseMatrix);
              rendered.set(...base).applyMatrix4(world);
              assert.ok(
                rendered.distanceTo(centroid) < 1e-6,
                `${name}/${group.name}/${instance}/bloom ${bloom}: organ carrier detached ${rendered.distanceTo(centroid)} from its pinned corolla base`,
              );
            });
          }
        } finally {
          mesh.morphTexture?.dispose();
          mesh.dispose();
          material.dispose();
          [...geometry.surfaces, ...geometry.organs].forEach((g) =>
            g.dispose(),
          );
        }
      }
    }
  });
}

verifyCarriedInsertions("bottlebrush", BOTTLEBRUSH_MODEL, [
  {
    group: BOTTLEBRUSH_MODEL.instances![0],
    surfaces: BOTTLEBRUSH_MODEL.instances![0].poses.map((_, i) => i),
    base: [0, 0.004, 0],
  },
]);
verifyCarriedInsertions("scabiosa", SCABIOSA_MODEL, [
  {
    group: SCABIOSA_MODEL.instances![0],
    surfaces: SCABIOSA_MODEL.instances![0].poses.map((_, i) => i),
    base: [0, 0, 0],
  },
]);
verifyCarriedInsertions(
  "agapanthus",
  AGAPANTHUS_MODEL,
  AGAPANTHUS_MODEL.instances!.map((group) => ({
    group,
    surfaces: group.poses.map(() =>
      AGAPANTHUS_MODEL.surfaces.findIndex(
        (s) => s.cluster === group.cluster && s.role === "tube",
      ),
    ),
    base: [0, 0, 0],
  })),
);

test("wisteria: the actual lower twining shoot stays fixed through its authored support while the free extension bends", () => {
  const parent = plantedMatrix(),
    still = new Vector3(),
    bent = new Vector3();
  let fixed = 0,
    moving = 0;
  for (const point of WISTERIA_SHOOT_POINTS) {
    const height = (point[1] + WISTERIA_STEM_LENGTH) / WISTERIA_STEM_LENGTH,
      weight = supportedBendWeight(height, WISTERIA_SUPPORT_HEIGHT);
    still.set(...point).applyMatrix4(parent);
    bent
      .set(
        point[0] + 0.17 * weight,
        point[1] - 0.03 * weight,
        point[2] - 0.12 * weight,
      )
      .applyMatrix4(parent);
    if (height <= WISTERIA_SUPPORT_HEIGHT) {
      assert.equal(weight, 0);
      assert.equal(supportedBendSlope(height, WISTERIA_SUPPORT_HEIGHT), 0);
      assert.equal(
        bent.distanceTo(still),
        0,
        "the attached wood below the support cannot drift",
      );
      fixed++;
    } else {
      assert.ok(bent.distanceTo(still) > 0);
      moving++;
    }
  }
  assert.ok(
    fixed > 50 && moving > 10,
    "both fixed and free authored shoot portions were exercised",
  );
  assert.equal(
    supportedBendWeight(WISTERIA_SUPPORT_HEIGHT, WISTERIA_SUPPORT_HEIGHT),
    0,
  );
  assert.equal(
    supportedBendSlope(WISTERIA_SUPPORT_HEIGHT, WISTERIA_SUPPORT_HEIGHT),
    0,
  );
});
