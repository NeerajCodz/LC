import test from "node:test";
import assert from "node:assert/strict";
import { Vector3, Matrix4 } from "three";
import {
  DATURA_FORKS,
  DATURA_FOLIAGE_NODES,
  DATURA_STEM_LENGTH,
} from "../components/flowers/datura/daturaLeaf";
import { writeDaturaBranchVertex } from "../components/flowers/datura/daturaAttachments";
import { writeStemNodeMatrix } from "../lib/three/plantAttachments";
test("datura fork tips follow the actual leaf insertions through entrance and anchored bending", () => {
  const position = new Vector3(),
    normal = new Vector3(),
    matrix = new Matrix4(),
    nodeRoot = new Vector3();
  for (const growth of [0, 0.15, 0.5, 1])
    for (const motion of [
      { x: 0, z: 0, drop: 0 },
      { x: 0.2, z: -0.15, drop: 0.035 },
    ])
      for (let i = 0; i < 2; i++) {
        position.set(...DATURA_FORKS[i].points.at(-1)!);
        normal.set(0, 0, 1);
        writeDaturaBranchVertex(position, normal, growth, motion);
        writeStemNodeMatrix(matrix, DATURA_FOLIAGE_NODES.at(-2 + i)!, {
          growth,
          motion,
          stemLength: DATURA_STEM_LENGTH,
          supportHeight: 0,
          head: new Matrix4(),
        });
        nodeRoot.set(0, 0, 0).applyMatrix4(matrix);
        assert.ok(
          position.distanceTo(nodeRoot) < 1e-9,
          `fork floats at growth ${growth}`,
        );
        assert.ok(Math.abs(normal.length() - 1) < 1e-12);
      }
});
