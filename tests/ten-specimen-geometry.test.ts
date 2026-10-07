import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { HELLEBORE_MODEL } from "../components/flowers/hellebore/helleboreGeometry";
import { PRIMROSE_MODEL } from "../components/flowers/primrose/primroseGeometry";
import { PETUNIA_MODEL } from "../components/flowers/petunia/petuniaGeometry";
import { LILY_OF_THE_VALLEY_MODEL } from "../components/flowers/lily-of-the-valley/lilyOfTheValleyGeometry";
import { PETUNIA_LEAF } from "../components/flowers/petunia/petuniaLeaf";
import { PRIMROSE_LEAF } from "../components/flowers/primrose/primroseLeaf";
import {
  HELLEBORE_LEAFLET,
  HELLEBORE_LEAF_POSES,
} from "../components/flowers/hellebore/helleboreLeaf";

verifySpecimen("hellebore", HELLEBORE_MODEL);
test("closed buds keep a swollen body around their preformed floral organs", () => {
  const hel = HELLEBORE_MODEL.surfaces
    .find((s) => s.name === "showy sepal")!
    .sample(0.5, 0.55, 0);
  assert.ok(Math.hypot(hel[0], hel[2]) > 0.12);
  const prim = PRIMROSE_MODEL.surfaces.find(
    (s) => s.name === "five-lobed fused corolla",
  )!;
  const crown = prim.sample(0.13, 0.78, 0),
    neck = prim.sample(0.13, 0.3, 0);
  assert.ok(
    Math.hypot(crown[0], crown[2]) > Math.hypot(neck[0], neck[2]) * 1.8,
  );
});
verifySpecimen("primrose", PRIMROSE_MODEL);
verifySpecimen("petunia", PETUNIA_MODEL);
verifySpecimen("lily of the valley", LILY_OF_THE_VALLEY_MODEL);
test("lily of the valley retains continuous six-toothed bells and six included stamens", () => {
  const m = LILY_OF_THE_VALLEY_MODEL;
  assert.equal(m.clusters.length, 11);
  assert.equal(
    m.surfaces.filter((s) => s.name === "six-toothed bell").length,
    11,
  );
  for (let c = 0; c < 11; c++)
    assert.equal(
      m.organs.filter((o) => o.cluster === c && o.name === "included anther")
        .length,
      6,
    );
  for (const s of m.surfaces.filter((s) => s.name === "six-toothed bell"))
    assert.ok(s.periodic);
});
verifySpecimen("petunia foliage", {
  clusters: [],
  surfaces: [PETUNIA_LEAF],
  organs: [],
});
test("white petunia retains its long fused tube and unequal included stamens", () => {
  const m = PETUNIA_MODEL;
  assert.equal(m.clusters.length, 5);
  assert.equal(
    m.surfaces.filter((s) => s.name === "long-tubed corolla").length,
    5,
  );
  for (let c = 0; c < 5; c++) {
    const fil = m.organs.filter(
      (o) => o.cluster === c && o.name === "included stamen filament",
    );
    assert.equal(fil.length, 5);
    const tips = fil.map((o) => o.points.at(-1)![1]);
    assert.ok(Math.max(...tips) - Math.min(...tips) > 0.08);
    const flower = m.surfaces.find(
      (s) => s.cluster === c && s.name === "long-tubed corolla",
    )!;
    const mouth = flower.sample(0.1, 1, 1);
    for (const o of m.organs.filter((o) => o.cluster === c))
      assert.ok(Math.max(...o.points.map((p) => p[1])) < mouth[1]);
  }
});
verifySpecimen("primrose rosette", {
  clusters: [],
  surfaces: [PRIMROSE_LEAF],
  organs: [],
});
test("primrose keeps continuous corollas and the stigma above its included pin-form anthers", () => {
  const m = PRIMROSE_MODEL;
  assert.equal(m.clusters.length, 7);
  assert.equal(
    m.surfaces.filter((s) => s.name === "five-lobed fused corolla").length,
    7,
  );
  for (let c = 0; c < 7; c++) {
    const anthers = m.organs.filter(
      (o) => o.cluster === c && o.name === "included anther",
    );
    assert.equal(anthers.length, 5);
    const style = m.organs.find(
      (o) => o.cluster === c && o.name === "pin style",
    )!;
    assert.ok(
      Math.max(...style.points.map((p) => p[1])) >
        Math.max(...anthers.flatMap((o) => o.points.map((p) => p[1]))) + 0.05,
    );
  }
});
verifySpecimen("hellebore leaflets", {
  clusters: [],
  surfaces: [HELLEBORE_LEAFLET],
  organs: [],
});
test("hellebore compound leaflets meet one petiole rather than becoming a pinnate shoot", () => {
  assert.equal(HELLEBORE_LEAF_POSES.length, 7);
  for (const p of HELLEBORE_LEAF_POSES)
    assert.deepEqual(p.position, [0, 0.14, 0]);
});
test("hellebore preserves sepals, tubular nectaries and numerous enclosed organs", () => {
  const m = HELLEBORE_MODEL;
  assert.equal(m.clusters.length, 4);
  assert.equal(m.surfaces.filter((s) => s.name === "showy sepal").length, 20);
  assert.equal(
    m.surfaces.filter((s) => s.name === "tubular nectary").length,
    40,
  );
  assert.equal(
    m.organs.filter((o) => o.name === "stamen filament").length,
    160,
  );
  assert.equal(m.organs.filter((o) => o.name === "carpel style").length, 20);
  for (const s of m.surfaces.filter((s) => s.name === "showy sepal")) {
    const p = s.sample(0.5, 1, 0);
    assert.ok(Math.hypot(p[0], p[2]) < 0.01);
  }
});
