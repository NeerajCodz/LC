import test from "node:test";
import assert from "node:assert/strict";
import {
  GREVILLEA_LEAF,
  GREVILLEA_FOLIAGE_NODES,
} from "../components/flowers/grevillea/grevilleaLeaf";
import { verifySpecimen } from "./specimen-checks";
import { SINGLE_CLUSTER } from "../lib/three/specimenModel";
verifySpecimen("grevillea revolute blades", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [GREVILLEA_LEAF],
  organs: [],
});
test("grevillea: narrow pointed blades retain rolled margins and alternate shoot insertions", () => {
  const edge = GREVILLEA_LEAF.sample(1, 0.5, 1),
    center = GREVILLEA_LEAF.sample(0.5, 0.5, 1);
  assert.ok(edge[0] > 0.025 && edge[0] < 0.07);
  assert.ok(edge[2] - center[2] > 0.025);
  assert.ok(GREVILLEA_LEAF.sample(1, 1, 1)[0] < edge[0] * 0.15);
  assert.equal(
    new Set(GREVILLEA_FOLIAGE_NODES.map((n) => n.t)).size,
    GREVILLEA_FOLIAGE_NODES.length,
  );
  assert.ok(GREVILLEA_FOLIAGE_NODES.length >= 12);
});
