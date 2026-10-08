import test from "node:test";
import assert from "node:assert/strict";
import { FREESIA_MODEL } from "../components/flowers/freesia/freesiaGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("freesia", FREESIA_MODEL);
test("freesia retains a unilateral spike, fused six-lobed funnels and bifid styles", async () => {
  const anatomy =
    await import("../components/flowers/freesia/freesiaGeometry").catch(
      () => null,
    );
  assert.ok(anatomy, "freesia anatomy is missing");
  const m = anatomy.FREESIA_MODEL;
  assert.equal(m.clusters.length, 7);
  assert.equal(
    m.surfaces.filter((s) => s.name === "six-lobed fused funnel").length,
    7,
  );
  assert.equal(m.surfaces.filter((s) => s.name === "spathe valve").length, 14);
  assert.equal(m.organs.filter((o) => o.name === "stamen filament").length, 21);
  assert.equal(m.organs.filter((o) => o.name === "bifid style tip").length, 42);
});
