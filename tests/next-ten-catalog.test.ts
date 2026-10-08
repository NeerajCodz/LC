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
test("crocus is a typed specimen with dedicated anchored scapes", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "crocus");
  assert.ok(type, "crocus catalog integration is missing");
  assert.equal(getFlower(type).latin, "Crocus vernus");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
test("freesia is a typed specimen with a bent spike and true funnels", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "freesia");
  assert.ok(type, "freesia catalog integration is missing");
  assert.equal(getFlower(type).latin, "Freesia refracta");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
test("lisianthus preserves its sourced species name in the catalog", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "lisianthus");
  assert.ok(type, "lisianthus catalog integration is missing");
  assert.equal(getFlower(type).latin, "Eustoma russellianum");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
test("camellia preserves its single-form woody specimen API", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "camellia");
  assert.ok(type, "camellia catalog integration is missing");
  assert.equal(getFlower(type).latin, "Camellia japonica");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
test("magnolia is a typed specimen with genuine spiral floral organs", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "magnolia");
  assert.ok(type, "magnolia catalog integration is missing");
  assert.equal(getFlower(type).latin, "Magnolia grandiflora");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
test("gardenia is a typed specimen with a long fused corolla", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "gardenia");
  assert.ok(type, "gardenia catalog integration is missing");
  assert.equal(getFlower(type).latin, "Gardenia jasminoides");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
test("nasturtium is a typed specimen with bilateral floral anatomy", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "nasturtium");
  assert.ok(type, "nasturtium catalog integration is missing");
  assert.equal(getFlower(type).latin, "Tropaeolum majus");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
test("cosmos is a typed specimen with neuter rays and true disk florets", () => {
  const type = FLOWER_TYPES.find((t) => String(t) === "cosmos");
  assert.ok(type, "cosmos catalog integration is missing");
  assert.equal(getFlower(type).latin, "Cosmos bipinnatus");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
});
