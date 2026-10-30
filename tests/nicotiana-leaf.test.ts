import test from "node:test";
import assert from "node:assert/strict";
import {
  NICOTIANA_LEAF,
  NICOTIANA_DECURRENT_WINGS,
  NICOTIANA_FOLIAGE_NODES,
} from "../components/flowers/nicotiana/nicotianaLeaf";
import { NICOTIANA_MODEL } from "../components/flowers/nicotiana/nicotianaGeometry";
import { specimenGeometry, SINGLE_CLUSTER } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("nicotiana foliage", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [NICOTIANA_LEAF, ...NICOTIANA_DECURRENT_WINGS],
  organs: [],
});
test("nicotiana: actual lower foliage exceeds the mature tube and grades into small cauline leaves", () => {
  const g = specimenGeometry(NICOTIANA_LEAF, "overview");
  try {
    g.computeBoundingBox();
    const bladeLength = g.boundingBox!.max.y - g.boundingBox!.min.y,
      lower = bladeLength * NICOTIANA_FOLIAGE_NODES[0].scale,
      upper = bladeLength * NICOTIANA_FOLIAGE_NODES.at(-1)!.scale,
      tube = NICOTIANA_MODEL.surfaces.find((s) => s.role === "tube")!,
      matureLength =
        tube.sample(0, 0.78, 1)[2] * NICOTIANA_MODEL.clusters[1].scale;
    assert.ok(
      lower > matureLength * 1.8,
      "basal tobacco foliage is smaller than the long flower tube",
    );
    assert.ok(
      lower / upper > 3.5,
      "upper cauline foliage is too similar to basal spatulate leaves",
    );
    assert.ok(
      upper < matureLength * 0.6,
      "upper stem leaves compete with the flowering raceme",
    );
  } finally {
    g.dispose();
  }
});
test("nicotiana: real decurrent wings enclose a broad undulating blade's stem insertion", () => {
  assert.equal(NICOTIANA_DECURRENT_WINGS.length, 2);
  for (const wing of NICOTIANA_DECURRENT_WINGS) {
    const g = specimenGeometry(wing, "medium");
    g.computeBoundingBox();
    assert.ok(g.boundingBox!.min.y < -0.07);
    assert.ok(g.boundingBox!.max.y > 0);
    g.dispose();
  }
  assert.ok(NICOTIANA_LEAF.sample(1, 0.5, 1)[0] > 0.25);
  assert.ok(NICOTIANA_LEAF.sample(1, 0, 1)[0] > 0.02);
});
test("nicotiana: enlarged basal foliage keeps every descending wing above the planting point", () => {
  for (const wing of NICOTIANA_DECURRENT_WINGS) {
    const g = specimenGeometry(wing, "high");
    try {
      g.computeBoundingBox();
      for (const node of NICOTIANA_FOLIAGE_NODES) {
        const lowest = -1.6 + 1.6 * node.t + g.boundingBox!.min.y * node.scale;
        assert.ok(
          lowest >= -1.6,
          `decurrent wing crosses the rooted planting point: ${lowest}`,
        );
      }
    } finally {
      g.dispose();
    }
  }
});
