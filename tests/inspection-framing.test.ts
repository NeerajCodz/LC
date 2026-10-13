import test from "node:test";
import assert from "node:assert/strict";
import { Box3, PerspectiveCamera, Vector3 } from "three";
test("inspection framing contains complete tall specimens and asymmetric macro bounds", async () => {
  const framing = await import("../lib/three/inspectionFraming").catch(
    () => null,
  );
  assert.ok(framing, "actual inspection bounds fitting is missing");
  const examples = [
    {
      box: new Box3(new Vector3(-0.9, -2.9, -0.4), new Vector3(0.9, 2.8, 0.6)),
      target: undefined,
    },
    {
      box: new Box3(new Vector3(-0.8, 0.18, -0.5), new Vector3(0.85, 2.8, 0.6)),
      target: [0, 1.14, 0] as [number, number, number],
    },
    {
      box: new Box3(
        new Vector3(-0.2, -1.55, -0.5),
        new Vector3(1.3, 1.65, 0.6),
      ),
      target: [0.43, 0.83, 0.2] as [number, number, number],
    },
  ];
  for (const aspect of [0.45, 1.04, 1.8])
    for (const { box, target } of examples) {
      const pose = framing.fitInspectionBounds(box, aspect, 36, target);
      if (target) assert.deepEqual(pose.target, target);
      const camera = new PerspectiveCamera(36, aspect, 0.01, 100);
      camera.position.set(...pose.position);
      camera.lookAt(...pose.target);
      camera.updateMatrixWorld();
      for (let i = 0; i < 8; i++) {
        const p = new Vector3(
          i & 1 ? box.max.x : box.min.x,
          i & 2 ? box.max.y : box.min.y,
          i & 4 ? box.max.z : box.min.z,
        ).project(camera);
        assert.ok(
          Math.abs(p.x) <= 0.91 && Math.abs(p.y) <= 0.91,
          `corner clipped: ${p.x},${p.y}`,
        );
        assert.ok(p.z >= -1 && p.z <= 1);
      }
    }
});
