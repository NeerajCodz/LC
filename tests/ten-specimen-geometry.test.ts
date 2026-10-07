import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { HELLEBORE_MODEL } from "../components/flowers/hellebore/helleboreGeometry";
import { PRIMROSE_MODEL } from "../components/flowers/primrose/primroseGeometry";
import { PETUNIA_MODEL } from "../components/flowers/petunia/petuniaGeometry";
import { LILY_OF_THE_VALLEY_MODEL } from "../components/flowers/lily-of-the-valley/lilyOfTheValleyGeometry";
import { SNOWDROP_MODEL } from "../components/flowers/snowdrop/snowdropGeometry";
import { GLADIOLUS_MODEL } from "../components/flowers/gladiolus/gladiolusGeometry";
import { DELPHINIUM_MODEL } from "../components/flowers/delphinium/delphiniumGeometry";
import { ALSTROEMERIA_MODEL } from "../components/flowers/alstroemeria/alstroemeriaGeometry";
import { GERBERA_MODEL } from "../components/flowers/gerbera/gerberaGeometry";
import { GERBERA_LEAF } from "../components/flowers/gerbera/gerberaLeaf";
import { ALSTROEMERIA_LEAF } from "../components/flowers/alstroemeria/alstroemeriaLeaf";
import { createDelphiniumLeaf } from "../components/flowers/delphinium/delphiniumLeaf";
import { GLADIOLUS_LEAF } from "../components/flowers/gladiolus/gladiolusLeaf";
import { SNOWDROP_LEAF } from "../components/flowers/snowdrop/snowdropLeaf";
import { LILY_OF_THE_VALLEY_LEAF } from "../components/flowers/lily-of-the-valley/lilyOfTheValleyLeaf";
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
verifySpecimen("snowdrop", SNOWDROP_MODEL);
verifySpecimen("gladiolus", GLADIOLUS_MODEL);
verifySpecimen("delphinium", DELPHINIUM_MODEL);
verifySpecimen("alstroemeria", ALSTROEMERIA_MODEL);
verifySpecimen("gerbera", GERBERA_MODEL);
verifySpecimen("gerbera pinnatifid blades", {
  clusters: [],
  surfaces: [GERBERA_LEAF],
  organs: [],
});
for (const group of GERBERA_MODEL.instances ?? [])
  verifySpecimen(`gerbera ${group.name} prototypes`, {
    clusters: [],
    surfaces: group.surfaces,
    organs: group.organs,
  });
test("gerbera retains true female rays and bilateral bisexual disk flowers", () => {
  const m = GERBERA_MODEL;
  assert.equal(
    m.surfaces.filter((s) => s.name === "outer ray ligule").length,
    32,
  );
  assert.equal(m.surfaces.filter((s) => s.name === "ray inner lip").length, 64);
  assert.equal(
    m.instances?.find((g) => g.name === "inner female rays")?.poses.length,
    24,
  );
  const disk = m.instances!.find(
    (g) => g.name === "bisexual bilateral disk florets",
  )!;
  assert.equal(disk.poses.length, 64);
  assert.equal(
    disk.surfaces.filter((s) => s.name === "paired inner limb").length,
    2,
  );
  assert.equal(disk.organs.filter((o) => o.name === "stamen anther").length, 5);
  assert.equal(
    disk.organs.filter((o) => o.name === "pistil style arm").length,
    2,
  );
});
verifySpecimen("alstroemeria resupinate leaf", {
  clusters: [],
  surfaces: [ALSTROEMERIA_LEAF],
  organs: [],
});
test("alstroemeria twists the continuous leaf over along its basal attachment", () => {
  assert.ok(ALSTROEMERIA_LEAF.sample(0.8, 0.02, 1)[0] > 0);
  assert.ok(ALSTROEMERIA_LEAF.sample(0.8, 0.55, 1)[0] < 0);
});
test("alstroemeria keeps six free tepals with only two marked upper inner segments", () => {
  const m = ALSTROEMERIA_MODEL;
  assert.equal(m.clusters.length, 5);
  assert.equal(m.surfaces.filter((s) => s.name === "free tepal").length, 30);
  assert.equal(m.surfaces.filter((s) => s.tissue === "inner").length, 10);
  for (let c = 0; c < 5; c++) {
    assert.equal(
      m.organs.filter((o) => o.cluster === c && o.name === "stamen filament")
        .length,
      6,
    );
    assert.equal(
      m.organs.filter((o) => o.cluster === c && o.name === "pistil style arm")
        .length,
      3,
    );
  }
});
test("delphinium leaves keep a continuous filled palmate blade at constrained quality", () => {
  const g = createDelphiniumLeaf("low");
  const folded = g.morphAttributes.position;
  assert.ok(folded);
  assert.ok(g.index && g.getAttribute("position").count > 1000);
  assert.equal(folded[0].count, g.getAttribute("position").count);
  assert.ok(g.getAttribute("tissueSide"));
  g.dispose();
});
test("delphinium keeps five sepals, a hollow dorsal spur and four distinct inner petals", () => {
  const m = DELPHINIUM_MODEL;
  assert.equal(m.clusters.length, 12);
  assert.equal(
    m.surfaces.filter((s) => s.name === "petaloid sepal").length,
    60,
  );
  const spurs = m.surfaces.filter((s) => s.name === "hollow dorsal spur");
  assert.equal(spurs.length, 12);
  assert.ok(spurs.every((s) => s.periodic));
  for (const spur of spurs) {
    const sepal = m.surfaces.find(
      (s) => s.cluster === spur.cluster && s.name === "petaloid sepal",
    )!;
    const a = spur.sample(0.5, 0, 0),
      b = sepal.sample(0.5, 0, 0);
    assert.ok(Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]) < 1e-6);
  }
  assert.equal(
    m.organs.filter((o) => o.name === "spur terminal cap").length,
    12,
  );
  assert.equal(m.surfaces.filter((s) => s.name === "inner petal").length, 48);
  assert.equal(
    m.organs.filter((o) => o.name === "upper nectar petal spur").length,
    24,
  );
  assert.ok(m.organs.some((o) => o.name === "lower petal beard hair"));
});
verifySpecimen("gladiolus sword blades", {
  clusters: [],
  surfaces: [GLADIOLUS_LEAF],
  organs: [],
});
test("gladiolus preserves unequal whorls, three guided outer tepals and unilateral stamens", () => {
  const m = GLADIOLUS_MODEL;
  assert.equal(m.clusters.length, 11);
  assert.equal(m.surfaces.filter((s) => s.name === "unequal tepal").length, 66);
  assert.equal(m.surfaces.filter((s) => s.tissue === "guide").length, 33);
  for (let c = 0; c < 11; c++) {
    const fil = m.organs.filter(
      (o) => o.cluster === c && o.name === "unilateral stamen filament",
    );
    assert.equal(fil.length, 3);
    assert.ok(fil.every((o) => o.points.at(-1)![2] > 0));
    assert.equal(
      m.organs.filter((o) => o.cluster === c && o.name === "pistil style arm")
        .length,
      3,
    );
  }
});
verifySpecimen("snowdrop strap blades", {
  clusters: [],
  surfaces: [SNOWDROP_LEAF],
  organs: [],
});
test("snowdrop keeps unequal tepal whorls and six included stamens on solitary scapes", () => {
  const m = SNOWDROP_MODEL;
  assert.equal(m.clusters.length, 3);
  assert.equal(m.surfaces.filter((s) => s.name === "outer tepal").length, 9);
  assert.equal(
    m.surfaces.filter((s) => s.name === "inner green-marked tepal").length,
    9,
  );
  for (let c = 0; c < 3; c++) {
    assert.equal(
      m.organs.filter((o) => o.cluster === c && o.name === "included anther")
        .length,
      6,
    );
    const out = m.surfaces.find(
        (s) => s.cluster === c && s.name === "outer tepal",
      )!,
      inn = m.surfaces.find(
        (s) => s.cluster === c && s.name === "inner green-marked tepal",
      )!;
    assert.ok(out.sample(0.5, 1, 0)[1] > inn.sample(0.5, 1, 0)[1] * 1.6);
    assert.equal(inn.tissue, "inner");
  }
});
verifySpecimen("lily of the valley basal blades", {
  clusters: [],
  surfaces: [LILY_OF_THE_VALLEY_LEAF],
  organs: [],
});
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
