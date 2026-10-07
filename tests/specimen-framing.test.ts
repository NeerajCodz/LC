import test from "node:test";
import assert from "node:assert/strict";
import { flowerHeadTarget } from "../lib/flowers/framing";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import {
  GARDEN_PLANTINGS,
  MOBILE_GARDEN_PLANTINGS,
} from "../lib/flowers/garden";
test("focused specimen and both garden targets use the tilted anatomical center above fixed roots", () => {
  for (const layout of [GARDEN_PLANTINGS, MOBILE_GARDEN_PLANTINGS]) {
    assert.deepEqual(
      layout.map((p) => p.type).sort(),
      [...FLOWER_TYPES].sort(),
    );
    for (const plant of layout) {
      const s = FLOWER_STRUCTURES[plant.type],
        c = s.headCenter ?? [0, 0, 0],
        target = flowerHeadTarget(s, plant.position, plant.scale);
      assert.equal(target[0], plant.position[0] + c[0] * plant.scale);
      assert.ok(
        Math.abs(
          target[1] -
            (plant.position[1] +
              plant.scale *
                (s.stemLength +
                  c[1] * Math.cos(s.headTilt) -
                  c[2] * Math.sin(s.headTilt))),
        ) < 1e-9,
      );
      assert.ok(target.every(Number.isFinite));
    }
  }
});
