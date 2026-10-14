import test from "node:test";
import assert from "node:assert/strict";
import {
  LOBELIA_MODEL,
  LOBELIA_STALKS,
  lobeliaCorolla,
} from "../components/flowers/lobelia/lobeliaGeometry";
import { verifySpecimen } from "./specimen-checks";
import { specimenOrganParts } from "../lib/three/specimenModel";
test("lobelia: dorsal cleft stays open above the basal bridge with two upper and three lower lobes", () => {
  assert.equal(LOBELIA_MODEL.clusters.length, 9);
  const tubes = LOBELIA_MODEL.surfaces.filter(
    (s) => s.name === "dorsally split lobelia corolla",
  );
  assert.equal(tubes.length, 9);
  assert.ok(
    tubes.every((s) => s.periodic === false && s.overviewColumns! >= 20),
  );
  for (const open of [0, 0.5, 1]) {
    const left = lobeliaCorolla(0, 0.7, open),
      right = lobeliaCorolla(1, 0.7, open);
    assert.ok(
      Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]) >
        0.015,
    );
  }
  const lower = lobeliaCorolla(0.5, 1, 1),
    upper = lobeliaCorolla(0.025, 1, 1);
  assert.ok(Math.abs(lower[1]) > upper[1] * 1.8);
  for (let c = 0; c < 9; c++) {
    assert.equal(
      LOBELIA_MODEL.surfaces.filter(
        (s) => s.cluster === c && s.name === "fused lobelia anther tube",
      ).length,
      1,
    );
    assert.equal(
      LOBELIA_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "lobelia stamen filament",
      ).length,
      5,
    );
    assert.equal(
      LOBELIA_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "lower anther beard hair",
      ).length,
      6,
    );
    assert.equal(
      LOBELIA_MODEL.surfaces.filter(
        (s) => s.cluster === c && s.name === "pale throat bump",
      ).length,
      2,
    );
  }
  const stalks = LOBELIA_STALKS.filter(
    (o) => o.name === "slender lobelia pedicel",
  );
  assert.equal(stalks.length, 9);
  stalks.forEach((p, i) =>
    assert.deepEqual(p.points.at(-1), LOBELIA_MODEL.clusters[i].position),
  );
});
verifySpecimen("lobelia", LOBELIA_MODEL);
test("lobelia: complete pistils retain actual subinferior ovaries in the fixed renderer partition", () => {
  for (let c = 0; c < 9; c++) {
    const parts = specimenOrganParts(LOBELIA_MODEL, c, "overview", false);
    try {
      assert.equal(
        parts.filter((p) => p.organ.name === "subinferior lobelia ovary")
          .length,
        1,
      );
    } finally {
      parts.forEach((p) => p.geometry.dispose());
    }
  }
});
test("lobelia: actual terminal-bud anther, style and beard buffers stay enclosed", () => {
  for (const c of [7, 8])
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(LOBELIA_MODEL, c, quality, true);
      try {
        for (const { geometry } of parts) {
          const p = geometry.getAttribute("position");
          for (let i = 0; i < p.count; i++) assert.ok(p.getZ(i) < 0.435);
        }
      } finally {
        parts.forEach(({ geometry }) => geometry.dispose());
      }
    }
});

test("lobelia is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "lobelia");
  assert.ok(type, "lobelia catalog integration is missing");
  assert.equal(getFlower(type).latin, "Lobelia erinus");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
