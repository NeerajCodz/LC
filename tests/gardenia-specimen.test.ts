import test from "node:test";
import assert from "node:assert/strict";
import { GARDENIA_MODEL } from "../components/flowers/gardenia/gardeniaGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("gardenia", GARDENIA_MODEL);
test("gardenia retains long fused tubes, overlapping limbs and included anthers", async () => {
  const a =
    await import("../components/flowers/gardenia/gardeniaGeometry").catch(
      () => null,
    );
  assert.ok(a, "gardenia anatomy is missing");
  const m = a.GARDENIA_MODEL;
  assert.equal(m.clusters.length, 3);
  assert.equal(
    m.surfaces.filter((s) => s.name === "long fused corolla tube").length,
    3,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "pinwheel corolla lobe").length,
    18,
  );
  assert.equal(m.surfaces.filter((s) => s.name === "inferior ovary").length, 3);
  assert.equal(m.organs.filter((o) => o.name === "stamen filament").length, 18);
});
