import test from "node:test";
import assert from "node:assert/strict";
import {
  NICOTIANA_LEAF,
  NICOTIANA_DECURRENT_WINGS,
} from "../components/flowers/nicotiana/nicotianaLeaf";
import { specimenGeometry, SINGLE_CLUSTER } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("nicotiana foliage", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [NICOTIANA_LEAF, ...NICOTIANA_DECURRENT_WINGS],
  organs: [],
});
test("nicotiana: real decurrent wings enclose a broad undulating blade's stem insertion", () => {
  assert.equal(NICOTIANA_DECURRENT_WINGS.length, 2);
  for (const wing of NICOTIANA_DECURRENT_WINGS) {
    const g = specimenGeometry(wing, "medium");
    g.computeBoundingBox();
    assert.ok(g.boundingBox!.min.y < -0.2);
    assert.ok(g.boundingBox!.max.y > 0);
    g.dispose();
  }
  assert.ok(NICOTIANA_LEAF.sample(1, 0.5, 1)[0] > 0.25);
  assert.ok(NICOTIANA_LEAF.sample(1, 0, 1)[0] > 0.02);
});
