import test from "node:test";
import assert from "node:assert/strict";
import {
  GREVILLEA_MODEL,
  GREVILLEA_PAIRS,
  grevilleaPerianth,
  GREVILLEA_STALKS,
} from "../components/flowers/grevillea/grevilleaGeometry";
import { specimenOrganGeometry } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("Grevillea paired spider flowers", GREVILLEA_MODEL);
test("Grevillea: condensed paired flowers retain four tepals, four sessile anthers and one curved style each", () => {
  assert.equal(GREVILLEA_PAIRS.length, 6);
  assert.equal(GREVILLEA_MODEL.clusters.length, 13);
  for (let c = 1; c < GREVILLEA_MODEL.clusters.length; c++) {
    assert.equal(
      GREVILLEA_MODEL.surfaces.filter(
        (s) =>
          s.cluster === c && s.name === "separate recurved perianth segment",
      ).length,
      4,
    );
    assert.equal(
      GREVILLEA_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "sessile perianth anther",
      ).length,
      4,
    );
    assert.equal(
      GREVILLEA_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "curved pollen-presenting style",
      ).length,
      1,
    );
    assert.equal(
      GREVILLEA_MODEL.organs.filter(
        (o) =>
          o.cluster === c && o.name === "flattened lateral pollen presenter",
      ).length,
      1,
    );
  }
  for (const pair of GREVILLEA_PAIRS) {
    const a = GREVILLEA_MODEL.clusters[pair[0]].position,
      b = GREVILLEA_MODEL.clusters[pair[1]].position;
    assert.ok(Math.hypot(...a.map((x, i) => x - b[i])) < 0.26);
  }
  const p = GREVILLEA_MODEL.clusters.slice(1).map((c) => c.position);
  const width =
    Math.max(...p.map((a) => a[0])) - Math.min(...p.map((a) => a[0]));
  const height =
    Math.max(...p.map((a) => a[1])) - Math.min(...p.map((a) => a[1]));
  assert.ok(
    height < width * 1.6,
    "compact spider cluster rather than elongated toothbrush",
  );
});
test("Grevillea: every anther remains attached to its own perianth at both morph endpoints", () => {
  for (let c = 1; c < GREVILLEA_MODEL.clusters.length; c++) {
    const anthers = GREVILLEA_MODEL.organs.filter(
      (o) => o.cluster === c && o.name === "sessile perianth anther",
    );
    for (let i = 0; i < 4; i++)
      for (const open of [0, 1]) {
        const root = open ? anthers[i].points[0] : anthers[i].foldedPoints![0],
          surface = grevilleaPerianth(i, 0.5, 0.965, open);
        assert.ok(Math.hypot(...root.map((n, a) => n - surface[a])) < 1e-9);
      }
  }
  for (const organ of GREVILLEA_MODEL.organs.filter((o) => o.foldedPoints)) {
    const g = specimenOrganGeometry(organ, "overview");
    assert.equal(g.morphAttributes.normal!.length, 1);
    assert.ok(
      Array.from(g.morphAttributes.normal![0].array).every(Number.isFinite),
    );
    g.dispose();
  }
});
test("Grevillea: styles release from the bud into lateral flattened presenters", () => {
  for (let c = 1; c < GREVILLEA_MODEL.clusters.length; c++) {
    const style = GREVILLEA_MODEL.organs.find(
      (o) => o.cluster === c && o.name === "curved pollen-presenting style",
    )!;
    const presenter = GREVILLEA_MODEL.organs.find(
      (o) => o.cluster === c && o.name === "flattened lateral pollen presenter",
    )!;
    assert.ok(style.points.at(-1)![1] > style.foldedPoints!.at(-1)![1] + 0.2);
    assert.ok(presenter.flatten! < 0.4);
    assert.deepEqual(presenter.points[0], style.points.at(-1));
    assert.deepEqual(presenter.foldedPoints![0], style.foldedPoints!.at(-1));
  }
  assert.equal(
    GREVILLEA_STALKS.filter((o) => o.name === "paired flower pedicel").length,
    12,
  );
});
