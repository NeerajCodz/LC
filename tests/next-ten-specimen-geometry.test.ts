import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { RANUNCULUS_MODEL } from "../components/flowers/ranunculus/ranunculusGeometry";

verifySpecimen("ranunculus", RANUNCULUS_MODEL);

test("ranunculus retains forty-eight cupped petals and five protective sepals", async () => {
  const anatomy =
    await import("../components/flowers/ranunculus/ranunculusGeometry").catch(
      () => null,
    );
  assert.ok(anatomy, "dedicated ranunculus anatomy is missing");
  const model = anatomy.RANUNCULUS_MODEL;
  assert.equal(
    model.surfaces.filter((s) => s.name === "cupped petal").length,
    48,
  );
  assert.equal(
    model.surfaces.filter((s) => s.name === "protective sepal").length,
    5,
  );
});
