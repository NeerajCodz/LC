import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Group,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Ray,
  Raycaster,
  Vector3,
} from "three";
import {
  createToreniaStigmaGeometry,
  TORENIA_RENDER_MODEL,
} from "../components/flowers/torenia/toreniaStigmaGeometry";
import {
  createToreniaStigmaProbeScratch,
  probeToreniaStigmaRay,
} from "../components/flowers/torenia/toreniaStigmaProbe";
import { toreniaStigma } from "../components/flowers/torenia/toreniaGeometry";
import { specimenGeometry, specimenCages } from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";
import {
  bindCageGeometry,
  bindCageRaycast,
  CageDeformation,
} from "../lib/three/petalDeformation";
test("Torenia's actual contact-deformed roof blocks an inner stigma ray that undeformed CPU geometry misses", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    root = new Group(),
    surface = TORENIA_RENDER_MODEL.surfaces[0],
    geometry = specimenGeometry(surface, "low");
  const patch = specimenCages(
      {
        clusters: TORENIA_RENDER_MODEL.clusters,
        surfaces: [surface],
        organs: [],
      },
      false,
    ).patches[0],
    sim = new PetalDynamics([patch]);
  sim.setRest(0, 1);
  sim.reset();
  const deformation = new CageDeformation(sim);
  deformation.setEnabled(true);
  bindCageGeometry(geometry, patch, 0);
  const corolla = new Mesh(geometry, material);
  corolla.updateMorphTargets();
  root.add(corolla);
  const stigma = ([0, 1] as const).map((l) => {
    const mesh = new Mesh(createToreniaStigmaGeometry(0, l, "low"), material);
    mesh.updateMorphTargets();
    root.add(mesh);
    return mesh;
  });
  root.updateMatrixWorld(true);
  const center = new Vector3(...toreniaStigma(0.5, 0.6, 1, 0)),
    ray = new Ray(
      center.clone().add(new Vector3(0, 0, 0.4)),
      new Vector3(0, 0, -1),
    ),
    scratch = createToreniaStigmaProbeScratch();
  assert.equal(probeToreniaStigmaRay(ray, stigma, 1, root, scratch), true);
  // The broad roof needs a deeper authored press to cross this inner-face ray.
  // Keep the fixture inside the solver's 0.18 per-axis displacement ceiling.
  for (let i = 0; i < sim.inverseMass.length; i++)
    if (sim.inverseMass[i]) sim.positions[i * 3 + 1] -= 0.14;
  deformation.update([new Matrix4()]);
  let maximumOffset = 0;
  for (let i = 0; i < sim.inverseMass.length; i++) {
    const offset = Math.hypot(
      deformation.data[i * 4],
      deformation.data[i * 4 + 1],
      deformation.data[i * 4 + 2],
    );
    maximumOffset = Math.max(maximumOffset, offset);
    if (!sim.inverseMass[i])
      assert.equal(offset, 0, "the insertion stays pinned");
  }
  assert.ok(
    maximumOffset <= 0.18,
    "the roof press stays within the contact budget",
  );
  assert.equal(
    probeToreniaStigmaRay(ray, stigma, 1, root, scratch),
    true,
    "legacy CPU roof misses visible shader displacement",
  );
  const cleanup = bindCageRaycast(corolla, deformation);
  try {
    const raycaster = new Raycaster(ray.origin, ray.direction),
      roofHit = raycaster.intersectObject(corolla, false)[0],
      stigmaHit = raycaster.intersectObjects(stigma, false)[0];
    assert.ok(
      roofHit?.face,
      "the displaced roof physically intersects the ray",
    );
    assert.ok(stigmaHit, "the inner lamella remains on the same ray");
    assert.ok(
      roofHit.distance < stigmaHit.distance - 0.005,
      "actual displaced tissue crosses ahead of the lamella rather than behind it",
    );
    const a = new Vector3(),
      b = new Vector3(),
      c = new Vector3();
    corolla.getVertexPosition(roofHit.face.a, a);
    corolla.getVertexPosition(roofHit.face.b, b);
    corolla.getVertexPosition(roofHit.face.c, c);
    const triangleHit = ray.intersectTriangle(a, b, c, false, new Vector3());
    assert.ok(
      triangleHit,
      "the actual cage-deformed triangle contains the crossing",
    );
    assert.ok(triangleHit.distanceTo(roofHit.point) < 0.000001);
    assert.equal(probeToreniaStigmaRay(ray, stigma, 1, root, scratch), false);
    assert.equal(scratch.occlusion[0].object, corolla);
    deformation.setEnabled(false);
    assert.equal(
      probeToreniaStigmaRay(ray, stigma, 1, root, scratch),
      true,
      "settled renderer and CPU query both ignore cage offsets",
    );
  } finally {
    cleanup();
    geometry.dispose();
    for (const mesh of stigma) mesh.geometry.dispose();
    material.dispose();
    deformation.dispose();
  }
});
