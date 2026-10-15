import test from "node:test";
import assert from "node:assert/strict";
import {
  TORENIA_MODEL,
  TORENIA_STALKS,
  toreniaCorolla,
} from "../components/flowers/torenia/toreniaGeometry";
import { verifySpecimen } from "./specimen-checks";
import { specimenOrganParts } from "../lib/three/specimenModel";
test("torenia: bilateral trumpet retains four paired unequal stamens and two stigma lamellae", () => {
  assert.equal(TORENIA_MODEL.clusters.length, 5);
  for (let c = 0; c < 5; c++) {
    const organs = TORENIA_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      organs.filter((o) => o.name === "didynamous torenia filament").length,
      4,
    );
    assert.equal(
      organs.filter((o) => o.name === "paired torenia anther chamber").length,
      8,
    );
    assert.equal(
      TORENIA_MODEL.surfaces.filter(
        (s) => s.cluster === c && s.name === "bilamellate torenia stigma",
      ).length,
      2,
    );
    assert.equal(
      TORENIA_MODEL.surfaces.filter(
        (s) => s.cluster === c && s.name === "five-winged fused torenia calyx",
      ).length,
      1,
    );
    const filaments = organs.filter(
      (o) => o.name === "didynamous torenia filament",
    );
    assert.ok(
      Math.max(...filaments.map((o) => o.points.at(-1)![2])) -
        Math.min(...filaments.map((o) => o.points.at(-1)![2])) >
        0.07,
    );
  }
  const lower = toreniaCorolla(0.75, 1, 1),
    upper = toreniaCorolla(0.25, 1, 1);
  assert.ok(
    Math.abs(lower[1]) > upper[1],
    "three-lobed landing lip projects below a broad upper hood",
  );
  const branches = TORENIA_STALKS.filter(
    (o) => o.name === "torenia flower pedicel",
  );
  assert.equal(branches.length, 5);
  branches.forEach((p, i) =>
    assert.deepEqual(p.points.at(-1), TORENIA_MODEL.clusters[i].position),
  );
});
verifySpecimen("torenia", TORENIA_MODEL);
test("torenia: complete pistils retain actual superior ovaries in the fixed renderer partition", () => {
  for (let c = 0; c < 5; c++) {
    const parts = specimenOrganParts(TORENIA_MODEL, c, "overview", false);
    try {
      assert.equal(
        parts.filter((p) => p.organ.name === "superior torenia ovary").length,
        1,
      );
    } finally {
      parts.forEach((p) => p.geometry.dispose());
    }
  }
});
test("torenia: all four generated filaments follow the actual included renderer partition", () => {
  for (let c = 0; c < 5; c++)
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(TORENIA_MODEL, c, quality, true);
      try {
        const filaments = parts.filter(
          (p) => p.organ.name === "didynamous torenia filament",
        );
        assert.equal(filaments.length, 4);
        for (const { organ, geometry } of filaments) {
          const full = geometry.getAttribute("position"),
            folded = geometry.morphAttributes.position![0],
            index = full.count - 1;
          assert.equal(geometry.morphAttributes.normal![0].count, full.count);
          for (const open of [0, 0.5, 1])
            for (let axis = 0; axis < 3; axis++) {
              const p =
                full.array[index * 3 + axis] * open +
                folded.array[index * 3 + axis] * (1 - open);
              const expected =
                organ.points.at(-1)![axis] * open +
                organ.foldedPoints!.at(-1)![axis] * (1 - open);
              assert.ok(Math.abs(p - expected) < 1e-7);
            }
        }
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
});
test("torenia: the upper lip is broad and genuinely notched between its two fused sectors", () => {
  const middle = toreniaCorolla(0.25, 1, 1);
  for (const angle of [1.18, Math.PI - 1.18])
    assert.ok(
      toreniaCorolla(angle / (Math.PI * 2), 1, 1)[1] > middle[1] + 0.02,
    );
});
test("torenia: actual terminal-bud reproductive buffers stay inside the closed lips", () => {
  for (const c of [3, 4])
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(TORENIA_MODEL, c, quality, true);
      try {
        for (const { geometry } of parts) {
          const p = geometry.getAttribute("position");
          for (let i = 0; i < p.count; i++) assert.ok(p.getZ(i) < 0.52);
        }
      } finally {
        parts.forEach(({ geometry }) => geometry.dispose());
      }
    }
});

test("torenia is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "torenia");
  assert.ok(type, "torenia catalog integration is missing");
  assert.equal(getFlower(type).latin, "Torenia fournieri");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
