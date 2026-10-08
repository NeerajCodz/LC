import test from "node:test";
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
