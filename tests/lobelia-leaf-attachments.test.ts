import test from "node:test";
import assert from "node:assert/strict";
import { Matrix4, Object3D, Vector3 } from "three";
import {
  LOBELIA_UPPER_ATTACHMENTS,
  writeLobeliaUpperLeafMatrix,
} from "../components/flowers/lobelia/lobeliaLeafAttachments";
import { writeHeadAttachmentVertex } from "../lib/three/plantAttachments";
test("all nine upper leaves stay at actual pedicel roots through growth and head contact", () => {
  assert.equal(LOBELIA_UPPER_ATTACHMENTS.length, 9);
  for (const growth of [0.03, 0.5, 1]) {
    const head = new Object3D();
    head.position.set(0.12, -(1 - growth) * 1.18 - 0.016, -0.08);
    head.rotation.set(-0.1, 0, -0.14);
    head.updateMatrix();
    const state = {
      stemLength: 1.18,
      supportHeight: 0,
      growth,
      motion: { x: 0.12, z: -0.08, drop: 0.016 },
      head: head.matrix,
    };
    for (const pose of LOBELIA_UPPER_ATTACHMENTS) {
      const frame = new Matrix4(),
        scratch = { position: new Vector3(), normal: new Vector3() },
        expected = new Vector3(...pose.root),
        normal = new Vector3(0, 1, 0);
      writeHeadAttachmentVertex(expected, normal, pose.root, pose.tip, state);
      writeLobeliaUpperLeafMatrix(frame, pose, state, scratch);
      const actual = new Vector3().setFromMatrixPosition(frame);
      assert.ok(actual.distanceTo(expected) < 1e-12);
      assert.ok(frame.elements.every(Number.isFinite));
    }
  }
});
