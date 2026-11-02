import test from "node:test";
import assert from "node:assert/strict";
import {
  ALLIUM_LEAF,
  ALLIUM_FOLIAGE_NODES,
} from "../components/flowers/allium/alliumLeaf";
import { verifySpecimen } from "./specimen-checks";
import { SINGLE_CLUSTER } from "../lib/three/specimenModel";
verifySpecimen("allium basal straps", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [ALLIUM_LEAF],
  organs: [],
});
test("allium: long curved strap blades insert only below the naked scape", () => {
  assert.ok(ALLIUM_FOLIAGE_NODES.length >= 3);
  assert.ok(ALLIUM_FOLIAGE_NODES.every((n) => n.t < 0.2));
  assert.ok(ALLIUM_LEAF.sample(0.5, 1, 1)[1] > 1);
  assert.ok(ALLIUM_LEAF.sample(1, 0.5, 1)[0] < 0.18);
  assert.ok(Math.abs(ALLIUM_LEAF.sample(0.5, 0.7, 1)[2]) > 0.03);
  assert.deepEqual(ALLIUM_LEAF.sample(0.5, 0, 1), [0, 0, 0]);
});
