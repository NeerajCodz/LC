import test from "node:test";
import assert from "node:assert/strict";
import {
  BoxGeometry,
  DoubleSide,
  Group,
  Mesh,
  MeshBasicMaterial,
  Ray,
  Vector3,
} from "three";
import {
  createToreniaStigmaProbeScratch,
  probeToreniaStigmaRay,
  registerToreniaStigmaProbe,
} from "../components/flowers/torenia/toreniaStigmaProbe";
import { createToreniaStigmaGeometry } from "../components/flowers/torenia/toreniaStigmaGeometry";
import { toreniaStigma } from "../components/flowers/torenia/toreniaGeometry";
test("real inner-face ray triggers only its lobe, with a rare occlusion query and no young-bud hits", () => {
  const geometries = ([0, 1] as const).map((l) =>
      createToreniaStigmaGeometry(0, l, "low"),
    ),
    material = new MeshBasicMaterial({ side: DoubleSide }),
    root = new Group();
  const meshes = geometries.map((g) => {
    const m = new Mesh(g, material);
    m.updateMorphTargets();
    root.add(m);
    return m;
  });
  root.updateMatrixWorld(true);
  const scratch = createToreniaStigmaProbeScratch(),
    center = new Vector3(...toreniaStigma(0.5, 0.6, 1, 0)),
    inner = new Vector3(0, 1, 0);
  const ray = new Ray(
    center.clone().addScaledVector(inner, 0.012),
    inner.clone().negate(),
  );
  assert.equal(probeToreniaStigmaRay(ray, meshes, 1, root, scratch), true);
  assert.deepEqual(scratch.result, { cluster: 0, lobe: 0 });
  const outer = new Ray(
    center.clone().addScaledVector(inner, -0.02),
    inner.clone(),
  );
  assert.equal(probeToreniaStigmaRay(outer, meshes, 1, root, scratch), false);
  assert.equal(probeToreniaStigmaRay(ray, meshes, 0.3, root, scratch), false);
  assert.equal(
    probeToreniaStigmaRay(
      ray,
      [null, null, null, null, null, null, ...meshes],
      1,
      root,
      scratch,
    ),
    false,
  );
  const wallGeometry = new BoxGeometry(0.08, 0.002, 0.08),
    wall = new Mesh(wallGeometry, material);
  wall.position.copy(center).addScaledVector(inner, 0.007);
  root.add(wall);
  root.updateMatrixWorld(true);
  let queries = 0;
  const original = wall.raycast.bind(wall);
  wall.raycast = (caster, hits) => {
    queries++;
    original(caster, hits);
  };
  assert.equal(probeToreniaStigmaRay(outer, meshes, 1, root, scratch), false);
  assert.equal(queries, 0);
  assert.equal(probeToreniaStigmaRay(ray, meshes, 1, root, scratch), false);
  assert.equal(queries, 1);
  for (const g of geometries) g.dispose();
  wallGeometry.dispose();
  material.dispose();
});
test("imperative probe cleanup cannot clear a newer resource registration", () => {
  const slot = { current: null as ((ray: Ray) => void) | null },
    old = () => {},
    next = () => {};
  const removeOld = registerToreniaStigmaProbe(slot, old),
    removeNext = registerToreniaStigmaProbe(slot, next);
  removeOld();
  assert.equal(slot.current, next);
  removeNext();
  assert.equal(slot.current, null);
});
