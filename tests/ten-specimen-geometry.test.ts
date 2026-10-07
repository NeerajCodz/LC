import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { HELLEBORE_MODEL } from "../components/flowers/hellebore/helleboreGeometry";
import { PRIMROSE_MODEL } from "../components/flowers/primrose/primroseGeometry";
import { PRIMROSE_LEAF } from "../components/flowers/primrose/primroseLeaf";
import {
  HELLEBORE_LEAFLET,
  HELLEBORE_LEAF_POSES,
} from "../components/flowers/hellebore/helleboreLeaf";

verifySpecimen("hellebore", HELLEBORE_MODEL);
verifySpecimen("primrose", PRIMROSE_MODEL);
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
