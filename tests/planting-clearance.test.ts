import test from "node:test";
import assert from "node:assert/strict";
import * as garden from "../lib/flowers/garden";
import { flowerEnvelope } from "../lib/flowers/wind";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import type { FlowerType, Vec3 } from "../lib/flowers/types";

test("both gardens reserve the complete new foliage footprint without enlarging head contact", () => {
  assert.ok(
    garden.plantingEnvelope("allium") >
      flowerEnvelope(FLOWER_STRUCTURES.allium),
  );
  assert.equal(flowerEnvelope(FLOWER_STRUCTURES.allium), 1.03);
  for (const plants of [
    garden.GARDEN_PLANTINGS,
    garden.MOBILE_GARDEN_PLANTINGS,
  ])
    for (let i = 0; i < plants.length; i++)
      for (let j = 0; j < i; j++) {
        const a = plants[i],
          b = plants[j];
        if (
          FLOWER_STRUCTURES[a.type].plantingRadius === undefined &&
          FLOWER_STRUCTURES[b.type].plantingRadius === undefined
        )
          continue;
        const reach =
          garden.plantingEnvelope(a.type) * a.scale +
          garden.plantingEnvelope(b.type) * b.scale;
        assert.ok(
          Math.hypot(
            a.position[0] - b.position[0],
            a.position[2] - b.position[2],
          ) >= reach,
          `${a.type}/${b.type} foliage clearance`,
        );
      }
});

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
