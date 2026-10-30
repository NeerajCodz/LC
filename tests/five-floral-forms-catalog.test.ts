import test from "node:test";
import assert from "node:assert/strict";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { FLOWERS } from "../lib/flowers/catalog";

test("the five approved floral forms have unique typed catalog entries", () => {
  for (const [slug, latin] of [
    ["gazania", "Gazania rigens"],
    ["salvia", "Salvia splendens"],
    ["nicotiana", "Nicotiana alata"],
    ["lantana", "Lantana camara"],
    ["echinacea", "Echinacea purpurea"],
  ]) {
    assert.ok(
      FLOWER_TYPES.some((type) => String(type) === slug),
      `${slug} is missing`,
    );
    const entries = FLOWERS.filter((flower) => String(flower.type) === slug);
    assert.equal(entries.length, 1);
    assert.equal(entries[0].latin, latin);
  }
});
