import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Vector3,
} from "three";
import { createParametricShell } from "../lib/three/parametricShell";
import { createCagePatch, PetalDynamics } from "../lib/three/petalDynamics";
import {
  bindCageGeometry,
  bindCageRaycast,
  CageDeformation,
} from "../lib/three/petalDeformation";
test("rare cage raycast uses actual displacement plus normal-side offset and moved bounds", () => {
  const sample = (
    u: number,
    v: number,
    open: number,
  ): [number, number, number] => [
    (u - 0.5) * 0.08,
    0.4 + (v - 0.5) * 0.08,
    open * 0.002,
  ];
  const patch = createCagePatch({
      columns: 2,
      rows: 2,
      thickness: 0.002,
      sample,
    }),
    sim = new PetalDynamics([patch]),
    deformation = new CageDeformation(sim);
  sim.setRest(0, 1);
  sim.reset();
  for (let i = 0; i < sim.inverseMass.length; i++) {
    sim.positions[i * 3] += 0.15;
    sim.normals[i * 3] = 0;
    sim.normals[i * 3 + 1] = 0.6;
    sim.normals[i * 3 + 2] = 0.8;
  }
  deformation.update([new Matrix4()]);
  deformation.setEnabled(true);
  const geometry = createParametricShell({
    columns: 4,
    rows: 4,
    thickness: 0.002,
    sample,
  });
  bindCageGeometry(geometry, patch, 0);
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    mesh = new Mesh(geometry, material);
  mesh.updateMorphTargets();
  mesh.morphTargetInfluences![0] = 0.5;
  mesh.updateMatrixWorld(true);
  const originalVertex = mesh.getVertexPosition,
    originalRaycast = mesh.raycast,
    originalSphere = geometry.boundingSphere;
  const ray = new Raycaster(new Vector3(0.15, 0.4, 0.2), new Vector3(0, 0, -1));
  assert.equal(ray.intersectObject(mesh).length, 0);
  const cleanup = bindCageRaycast(mesh, deformation),
    side = geometry.getAttribute("cageSide");
  for (const index of [12, 37]) {
    const base = originalVertex.call(mesh, index, new Vector3()),
      actual = mesh.getVertexPosition(index, new Vector3());
    assert.ok(Math.abs(actual.x - base.x - 0.15) < 1e-7);
    assert.ok(Math.abs(actual.y - base.y - 0.6 * side.getX(index)) < 1e-7);
    assert.ok(Math.abs(actual.z - base.z + 0.2 * side.getX(index)) < 1e-7);
  }
  assert.ok(
    ray.intersectObject(mesh).length > 0,
    "displaced wall must not miss the broad-phase sphere",
  );
  assert.equal(
    geometry.boundingSphere,
    originalSphere,
    "temporary query bounds must not leak into drawing",
  );
  deformation.setEnabled(false);
  assert.equal(ray.intersectObject(mesh).length, 0);
  cleanup();
  assert.equal(mesh.getVertexPosition, originalVertex);
  assert.equal(mesh.raycast, originalRaycast);
  geometry.dispose();
  material.dispose();
  deformation.dispose();
});
