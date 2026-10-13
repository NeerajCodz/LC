import test from "node:test";
import assert from "node:assert/strict";
import * as garden from "../lib/flowers/garden";
import { flowerEnvelope } from "../lib/flowers/wind";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import type { FlowerType, Vec3 } from "../lib/flowers/types";

test("planting clearance separates a crowded composition deterministically without moving ground roots", () => {
  const arrange = (
    garden as typeof garden & {
      arrangePlantings?: (
        p: { type: FlowerType; position: Vec3; scale: number }[],
      ) => { type: FlowerType; position: Vec3; scale: number }[];
    }
  ).arrangePlantings;
  assert.ok(arrange, "planting needs its own clearance solve");
  const plants = Array.from({ length: 24 }, () => ({
    type: "iris" as const,
    position: [0, garden.GARDEN_GROUND, 0] as Vec3,
    scale: 0.66,
  }));
  const before = JSON.stringify(plants),
    solved = arrange(plants);
  assert.equal(JSON.stringify(plants), before);
  assert.deepEqual(arrange(plants), solved);
  assert.equal(solved.length, plants.length);
  const diameter = flowerEnvelope(FLOWER_STRUCTURES.iris) * 0.66 * 2;
  for (let i = 0; i < solved.length; i++) {
    assert.equal(solved[i].position[1], garden.GARDEN_GROUND);
    for (let j = 0; j < i; j++)
      assert.ok(
        Math.hypot(
          solved[i].position[0] - solved[j].position[0],
          solved[i].position[2] - solved[j].position[2],
        ) >= diameter,
      );
  }
});
