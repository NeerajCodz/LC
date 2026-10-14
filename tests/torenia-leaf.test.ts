import test from "node:test";
import assert from "node:assert/strict";
import {
  TORENIA_LEAF,
  TORENIA_PETIOLE,
} from "../components/flowers/torenia/toreniaLeaf";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("torenia toothed foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  organs: [],
  surfaces: [TORENIA_LEAF],
});
test("torenia: petiolate ovate leaves keep coarse teeth in actual sampled margins", () => {
  assert.deepEqual(
    TORENIA_PETIOLE.points.at(-1),
    TORENIA_LEAF.sample(0.5, 0, 1),
  );
  assert.ok(
    Math.abs(
      TORENIA_LEAF.sample(1, 0.5, 1)[0] -
        TORENIA_LEAF.sample(1, 0.5 + 1 / 24, 1)[0],
    ) > 0.025,
  );
});
