import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import {
  TRILLIUM_LEAF,
  TRILLIUM_FOLIAGE_NODES,
  TRILLIUM_LEAF_TILT,
  TRILLIUM_STEM_LENGTH,
} from "../components/flowers/trillium/trilliumLeaf";
import { specimenGeometry, SINGLE_CLUSTER } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("trillium foliage", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [TRILLIUM_LEAF],
  organs: [],
});
test("trillium: exactly three broad sessile bracts occupy one terminal whorl on an otherwise naked scape", () => {
  assert.equal(TRILLIUM_FOLIAGE_NODES.length, 3);
  assert.equal(new Set(TRILLIUM_FOLIAGE_NODES.map((n) => n.t)).size, 1);
  assert.ok(TRILLIUM_FOLIAGE_NODES[0].t > 0.8);
  assert.deepEqual(TRILLIUM_LEAF.sample(0.5, 0, 1), [0, 0, 0]);
  const angles = TRILLIUM_FOLIAGE_NODES.map((n) => n.angle);
  for (let i = 1; i < 3; i++)
    assert.ok(Math.abs(angles[i] - angles[i - 1] - (Math.PI * 2) / 3) < 1e-9);
  assert.ok(TRILLIUM_LEAF.sample(1, 0.5, 1)[0] > 0.4);
});
test("trillium: actual pitched whorl spreads below the flower and stays above the rooted planting point", () => {
  for (const quality of ["overview", "high"] as const) {
    const g = specimenGeometry(TRILLIUM_LEAF, quality),
      p = g.getAttribute("position");
    try {
      for (const node of TRILLIUM_FOLIAGE_NODES) {
        const rotation = new Euler(TRILLIUM_LEAF_TILT, node.angle, 0.1, "YXZ"),
          points = Array.from({ length: p.count }, (_, i) =>
            new Vector3(p.getX(i), p.getY(i), p.getZ(i))
              .multiplyScalar(node.scale)
              .applyEuler(rotation)
              .add(
                new Vector3(
                  0.025 * Math.sin(node.t * Math.PI),
                  -TRILLIUM_STEM_LENGTH + TRILLIUM_STEM_LENGTH * node.t,
                  0,
                ),
              ),
          );
        assert.ok(Math.min(...points.map((p) => p.y)) > -TRILLIUM_STEM_LENGTH);
        assert.ok(
          Math.max(...points.map((p) => p.y)) < 0.12,
          "bract intrudes above the floral base",
        );
        assert.ok(
          Math.max(...points.map((p) => Math.hypot(p.x, p.z))) > 1.1,
          "terminal bract fails to spread",
        );
      }
    } finally {
      g.dispose();
    }
  }
});
