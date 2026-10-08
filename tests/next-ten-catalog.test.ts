import test from "node:test";
import assert from "node:assert/strict";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { getFlower } from "../lib/flowers/catalog";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import { WIND_PROFILES } from "../lib/flowers/wind";

test("ranunculus is a complete catalog specimen with dedicated nested-surface physics", () => {
  assert.ok(
    (FLOWER_TYPES as readonly string[]).includes("ranunculus"),
    "ranunculus catalog integration is missing",
  );
  const type = FLOWER_TYPES.find((t) => String(t) === "ranunculus")!;
  assert.equal(getFlower(type).latin, "Ranunculus asiaticus");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
test("anemone is available throughout the typed catalog with included pollen", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "anemone");
  assert.ok(type, "anemone catalog integration is missing");
  assert.equal(getFlower(type).latin, "Anemone coronaria");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
});
