import test from "node:test";
import assert from "node:assert/strict";
import {
  IXORA_MODEL,
  IXORA_STALKS,
  ixoraCorolla,
} from "../components/flowers/ixora/ixoraGeometry";
import { verifySpecimen } from "./specimen-checks";
import {
  specimenGeometry,
  specimenOrganGeometry,
  specimenOrganParts,
} from "../lib/three/specimenModel";

test("ixora: four-lobed long tubes keep four throat stamens and a bifid exserted style", () => {
  assert.equal(IXORA_MODEL.clusters.length, 22);
  const tubes = IXORA_MODEL.surfaces.filter(
    (s) => s.name === "four-lobed slender ixora corolla",
  );
  assert.equal(tubes.length, 22);
  for (let c = 0; c < 22; c++) {
    const organs = IXORA_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      organs.filter((o) => o.name === "throat stamen filament").length,
      4,
    );
    assert.equal(
      organs.filter((o) => o.name === "throat anther chamber").length,
      8,
    );
    const style = organs.find((o) => o.name === "exserted ixora style")!;
    if (c < 19) assert.ok(style.points.at(-1)![1] > ixoraCorolla(0, 1, 1)[1]);
    assert.equal(
      organs.filter((o) => o.name === "bifid ixora stigma").length,
      2,
    );
    assert.equal(
      IXORA_MODEL.surfaces.filter(
        (s) => s.cluster === c && s.name === "contorted terminal lobe tissue",
      ).length,
      4,
    );
  }
  for (let i = 0; i < 4; i++) {
    const apex = ixoraCorolla(i / 4, 1, 1),
      notch = ixoraCorolla((i + 0.5) / 4, 1, 1);
    assert.ok(
      Math.hypot(apex[0], apex[2]) > Math.hypot(notch[0], notch[2]) + 0.15,
    );
  }
  assert.ok(ixoraCorolla(0, 0.65, 1)[1] > 0.8);
  assert.ok(
    Math.hypot(...[ixoraCorolla(0, 0.65, 1)[0], ixoraCorolla(0, 0.65, 1)[2]]) <
      0.035,
  );
});
test("ixora: branched cyme attachments meet every sessile floral base and retain closed buds", () => {
  const branches = IXORA_STALKS.filter(
    (o) => o.name === "cyme terminal branch",
  );
  assert.equal(branches.length, 22);
  branches.forEach((o, i) =>
    assert.deepEqual(o.points.at(-1), IXORA_MODEL.clusters[i].position),
  );
  assert.equal(IXORA_MODEL.clusters.filter((c) => c.scale < 0.48).length, 3);
  for (const o of IXORA_MODEL.organs) {
    const g = specimenOrganGeometry(o, "overview");
    assert.ok(
      Array.from(g.getAttribute("position").array).every(Number.isFinite),
    );
    g.dispose();
  }
  let indices = 0;
  for (const s of IXORA_MODEL.surfaces) {
    const g = specimenGeometry(s, "overview");
    indices += g.index!.count;
    g.dispose();
  }
  assert.ok(indices < 100000, String(indices));
});
verifySpecimen("ixora", IXORA_MODEL);
test("ixora: complete pistils retain actual inferior ovaries in the fixed renderer partition", () => {
  for (let c = 0; c < 22; c++) {
    const parts = specimenOrganParts(IXORA_MODEL, c, "overview", false);
    try {
      assert.equal(
        parts.filter((p) => p.organ.name === "inferior ixora ovary").length,
        1,
      );
    } finally {
      parts.forEach((p) => p.geometry.dispose());
    }
  }
});
test("ixora: renderer buffers retain complete reproductive tissue below each young bud cap", () => {
  for (const c of [19, 20, 21])
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(IXORA_MODEL, c, quality, true);
      try {
        assert.equal(parts.length, 15);
        for (const { geometry } of parts) {
          const p = geometry.getAttribute("position");
          for (let i = 0; i < p.count; i++) assert.ok(p.getY(i) < 1.24);
        }
      } finally {
        parts.forEach(({ geometry }) => geometry.dispose());
      }
    }
});
test("ixora: complete overview reproductive organs and branches fit the head budget", () => {
  let indices = 0;
  for (const s of IXORA_MODEL.surfaces) {
    const g = specimenGeometry(s, "overview");
    indices += g.index!.count;
    g.dispose();
  }
  for (let c = 0; c < 22; c++)
    for (const included of [false, true])
      for (const { geometry: g } of specimenOrganParts(
        IXORA_MODEL,
        c,
        "overview",
        included,
      )) {
        indices += g.index!.count;
        g.dispose();
      }
  for (const o of IXORA_STALKS) {
    const g = specimenOrganGeometry(o, "overview");
    indices += g.index!.count;
    g.dispose();
  }
  assert.ok(indices <= 100000, String(indices));
});

test("ixora is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "ixora");
  assert.ok(type, "ixora catalog integration is missing");
  assert.equal(getFlower(type).latin, "Ixora coccinea");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
