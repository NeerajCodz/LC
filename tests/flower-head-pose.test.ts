import test from "node:test";
import { RANUNCULUS_MODEL } from "../components/flowers/ranunculus/ranunculusGeometry";
import { ANEMONE_MODEL } from "../components/flowers/anemone/anemoneGeometry";
import { CAMELLIA_MODEL } from "../components/flowers/camellia/camelliaGeometry";
import { MAGNOLIA_MODEL } from "../components/flowers/magnolia/magnoliaGeometry";
import { GARDENIA_MODEL } from "../components/flowers/gardenia/gardeniaGeometry";
import { COSMOS_MODEL } from "../components/flowers/cosmos/cosmosGeometry";
import assert from "node:assert/strict";
import { Object3D, Vector3 } from "three";
test("orienting a floral head preserves its stem insertion in plant coordinates", async () => {
  const anatomy = await import("../lib/three/specimenModel");
  assert.equal(
    typeof anatomy.anchoredHeadCluster,
    "function",
    "anchored head orientation is missing",
  );
  for (const [angle, anchor, scale] of [
    [0.8, -0.14, 1],
    [0.72, -0.1, 1],
    [0.8, -0.17, 0.86],
    [0.9, 0, 0.89],
  ]) {
    const pose = anatomy.anchoredHeadCluster(angle, anchor, scale),
      dummy = new Object3D();
    dummy.position.set(...pose.position);
    dummy.rotation.set(...pose.rotation);
    dummy.scale.setScalar(pose.scale);
    dummy.updateMatrix();
    const point = new Vector3(0, anchor, 0).applyMatrix4(dummy.matrix);
    assert.ok(point.distanceTo(new Vector3(0, anchor * scale, 0)) < 1e-10);
    const center = anatomy.specimenClusterPoint(pose, [0, 0.3, 0]),
      expected = new Vector3(0, 0.3, 0).applyMatrix4(dummy.matrix);
    assert.ok(expected.distanceTo(new Vector3(...center)) < 1e-10);
  }
});
test("the authored flower faces remain readable without shifting their insertions", () => {
  for (const [model, anchor] of [
    [RANUNCULUS_MODEL, 0],
    [ANEMONE_MODEL, -0.13],
    [CAMELLIA_MODEL, 0],
    [MAGNOLIA_MODEL, -0.1],
    [GARDENIA_MODEL, -0.17],
    [COSMOS_MODEL, -0.14],
  ] as const) {
    const pose = model.clusters[0],
      dummy = new Object3D();
    dummy.position.set(...pose.position);
    dummy.rotation.set(...pose.rotation);
    dummy.scale.setScalar(pose.scale);
    dummy.updateMatrix();
    assert.ok(Math.sin(pose.rotation[0]) > 0.5, "flower face remains edge-on");
    assert.ok(
      new Vector3(0, anchor, 0)
        .applyMatrix4(dummy.matrix)
        .distanceTo(new Vector3(0, anchor * pose.scale, 0)) < 1e-10,
    );
  }
});
