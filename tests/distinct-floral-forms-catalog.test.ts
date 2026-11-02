import test from "node:test";
import assert from "node:assert/strict";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { FLOWERS } from "../lib/flowers/catalog";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import { WIND_PROFILES } from "../lib/flowers/wind";

const APPROVED = [
  ["trillium", "Trillium grandiflorum", "Melanthiaceae"],
  ["datura", "Datura stramonium", "Solanaceae"],
  ["allium", "Allium giganteum", "Amaryllidaceae"],
  ["grevillea", "Grevillea rosmarinifolia", "Proteaceae"],
  ["calceolaria", "Calceolaria integrifolia", "Calceolariaceae"],
] as const;

for (const [slug, latin, family] of APPROVED)
  test(`${slug}: approved taxon has one complete interactive catalog registration`, () => {
    const type = FLOWER_TYPES.find((candidate) => String(candidate) === slug);
    assert.ok(type, `${slug} missing from the typed API`);
    const entries = FLOWERS.filter((flower) => flower.type === type);
    assert.equal(entries.length, 1, `${slug} must appear exactly once`);
    assert.equal(entries[0].latin, latin);
    assert.equal(entries[0].family, family);
    const structure = FLOWER_STRUCTURES[type];
    assert.equal(
      structure.layers.length,
      0,
      "dedicated organs own the anatomy",
    );
    assert.equal(structure.airbornePollen, false);
    assert.equal(structure.simulatedSurfaces, true);
    assert.ok(structure.headRadius! > 0 && structure.portraitBounds);
    for (const axis of [0, 1, 2])
      assert.ok(
        structure.portraitBounds.min[axis] < structure.portraitBounds.max[axis],
      );
    const response = WIND_PROFILES[type];
    assert.ok(response.stiffness > 0 && response.compliance > 0);
  });
