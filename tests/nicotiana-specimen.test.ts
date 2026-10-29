import test from "node:test";
import assert from "node:assert/strict";
import {
  NICOTIANA_MODEL,
  NICOTIANA_STALKS,
  nicotianaCorolla,
} from "../components/flowers/nicotiana/nicotianaGeometry";
import {
  specimenGeometry,
  specimenClusterPoint,
  SINGLE_CLUSTER,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";

verifySpecimen("nicotiana", NICOTIANA_MODEL);
test("nicotiana: authored near-horizontal tube elevation survives every azimuth and keeps the limb upright", () => {
  const rises = NICOTIANA_MODEL.clusters.slice(1).map((c) => {
    const tip = specimenClusterPoint(c, [0, 0, 1]),
      up = specimenClusterPoint(c, [0, 1, 0]),
      rise = (tip[1] - c.position[1]) / c.scale;
    assert.ok(rise > 0.06, "azimuth cancelled or reversed corolla pitch");
    assert.ok(
      up[1] > c.position[1] + c.scale * 0.85,
      "limb lost its upright pose",
    );
    return rise;
  });
  assert.ok(
    Math.max(...rises) - Math.min(...rises) > 0.08,
    "all tubes have identical elevation",
  );
});
test("nicotiana: few-flowered raceme retains continuous five-lobed tubes and five included unequal stamens", () => {
  assert.deepEqual(NICOTIANA_MODEL.clusters[0], SINGLE_CLUSTER);
  for (let c = 1; c < NICOTIANA_MODEL.clusters.length; c++) {
    assert.ok(
      NICOTIANA_STALKS.some(
        (s) => s.points.at(-1) === NICOTIANA_MODEL.clusters[c].position,
      ),
    );
    assert.equal(
      NICOTIANA_MODEL.surfaces.filter(
        (s) => s.cluster === c && s.role === "tube",
      ).length,
      1,
    );
    const filaments = NICOTIANA_MODEL.organs.filter(
      (o) => o.cluster === c && o.name === "included nicotiana filament",
    );
    assert.equal(filaments.length, 5);
    assert.ok(filaments[4].points.at(-1)![2] < filaments[0].points.at(-1)![2]);
    assert.equal(
      NICOTIANA_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "purple nicotiana anther",
      ).length,
      5,
    );
  }
  let peaks = 0;
  const radius = (u: number) =>
    Math.hypot(...nicotianaCorolla(u, 1, 1).slice(0, 2));
  for (let i = 0; i < 100; i++)
    if (
      radius(i / 100) > radius((i - 0.5) / 100) &&
      radius(i / 100) > radius((i + 0.5) / 100)
    )
      peaks++;
  assert.equal(peaks, 5);
  assert.ok(
    radius(0) > Math.hypot(...nicotianaCorolla(0, 0.6, 1).slice(0, 2)) * 5,
  );
});
test("nicotiana: actual folded and open salver skins preserve wall thickness and matching normals at macro quality", () => {
  const s = NICOTIANA_MODEL.surfaces.find((s) => s.role === "tube")!,
    g = specimenGeometry(s, "ultra"),
    p = g.getAttribute("position"),
    f = g.morphAttributes.position![0],
    half = p.count / 2;
  for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
    for (let i = 0; i < a.count; i++)
      assert.ok(
        Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
      );
  for (const a of [p, f])
    for (let i = 0; i < half; i++)
      assert.ok(
        Math.hypot(
          a.getX(i) - a.getX(i + half),
          a.getY(i) - a.getY(i + half),
          a.getZ(i) - a.getZ(i + half),
        ) >
          s.thickness * 0.79,
      );
  g.dispose();
});
