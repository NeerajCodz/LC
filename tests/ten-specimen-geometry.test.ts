import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { HELLEBORE_MODEL } from "../components/flowers/hellebore/helleboreGeometry";

verifySpecimen("hellebore", HELLEBORE_MODEL);
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
