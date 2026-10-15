import test from "node:test";
import assert from "node:assert/strict";
import {
  LOBELIA_LOWER_LEAF,
  LOBELIA_UPPER_LEAF,
  LOBELIA_LOWER_PETIOLE,
} from "../components/flowers/lobelia/lobeliaLeaf";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("lobelia heteromorphic foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  organs: [],
  surfaces: [LOBELIA_LOWER_LEAF, LOBELIA_UPPER_LEAF],
});
test("lobelia: broader lower blades and narrow upper blades retain distinct insertions", () => {
  assert.deepEqual(
    LOBELIA_LOWER_PETIOLE.points.at(-1),
    LOBELIA_LOWER_LEAF.sample(0.5, 0, 1),
  );
  assert.ok(
    LOBELIA_LOWER_LEAF.sample(1, 0.5, 1)[0] >
      LOBELIA_UPPER_LEAF.sample(1, 0.5, 1)[0] * 2,
  );
  assert.equal(LOBELIA_UPPER_LEAF.sample(0.5, 0, 1)[1], 0);
});
