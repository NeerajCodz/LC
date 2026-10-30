import test from "node:test";
import assert from "node:assert/strict";
import { Box3, Euler, Matrix4, Vector3 } from "three";
import {
  NICOTIANA_LEAF,
  NICOTIANA_FOLIAGE_NODES,
  NICOTIANA_LEAF_TILT,
} from "../components/flowers/nicotiana/nicotianaLeaf";
import { nicotianaStructure } from "../components/flowers/nicotiana/Nicotiana";
import { specimenGeometry } from "../lib/three/specimenModel";

test("Nicotiana portrait contains every actual enlarged basal and upper leaf", () => {
  const bounds = nicotianaStructure.portraitBounds!,
    box = new Box3(new Vector3(...bounds.min), new Vector3(...bounds.max)),
    geometry = specimenGeometry(NICOTIANA_LEAF, "high"),
    point = new Vector3();
  try {
    for (const node of NICOTIANA_FOLIAGE_NODES) {
      const matrix = new Matrix4()
        .makeRotationFromEuler(
          new Euler(NICOTIANA_LEAF_TILT, node.angle, 0.1, "YXZ"),
        )
        .scale(new Vector3(node.scale, node.scale, node.scale))
        .setPosition(
          0.025 * Math.sin(node.t * Math.PI),
          -nicotianaStructure.stemLength * (1 - node.t),
          0,
        )
        // NicotianaLeaf turns its own blade inside the BotanicalStem node frame.
        .multiply(new Matrix4().makeRotationY(Math.PI));
      for (const positions of [
        geometry.getAttribute("position"),
        geometry.morphAttributes.position![0],
      ])
        for (let i = 0; i < positions.count; i++) {
          point.fromBufferAttribute(positions, i).applyMatrix4(matrix);
          assert.ok(
            box.containsPoint(point),
            `leaf at ${node.t} outside portrait: ${point.toArray()}`,
          );
        }
    }
  } finally {
    geometry.dispose();
  }
});
