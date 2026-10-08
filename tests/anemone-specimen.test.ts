import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { ANEMONE_MODEL } from "../components/flowers/anemone/anemoneGeometry";
verifySpecimen("anemone", ANEMONE_MODEL);
test("anemone preserves petaloid sepals, dark stamens and the leafy involucre", async () => {
  const anatomy =
    await import("../components/flowers/anemone/anemoneGeometry").catch(
      () => null,
    );
  assert.ok(anatomy, "anemone anatomy is missing");
  const m = anatomy.ANEMONE_MODEL;
  assert.equal(m.surfaces.filter((s) => s.name === "petaloid sepal").length, 8);
  assert.equal(
    m.surfaces.filter((s) => s.name === "involucral leaf").length,
    3,
  );
  assert.equal(m.organs.filter((o) => o.name === "stamen filament").length, 56);
  assert.equal(m.instances![0].poses.length, 48);
});
