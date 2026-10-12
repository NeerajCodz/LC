import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
verifySpecimen("african violet", AFRICAN_VIOLET_MODEL);
test("african violet retains joined paired anthers and a lateral style", () => {
  for (let c = 0; c < 6; c++) {
    assert.equal(
      AFRICAN_VIOLET_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "connivent stamen filament",
      ).length,
      2,
    );
    assert.equal(
      AFRICAN_VIOLET_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "joined yellow anther chamber",
      ).length,
      4,
    );
    assert.equal(
      AFRICAN_VIOLET_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "staminodial peg",
      ).length,
      2,
    );
    assert.ok(
      AFRICAN_VIOLET_MODEL.organs
        .find((o) => o.cluster === c && o.name === "laterally exserted style")!
        .points.at(-1)![0] > 0.07,
    );
  }
});

test("african-violet: dedicated anatomy preserves its defining floral arrangement", async () => {
  const anatomy =
    await import("../components/flowers/african-violet/africanVioletGeometry").catch(
      () => null,
    );
  assert.ok(anatomy, "african-violet anatomy is missing");
  const model = anatomy.AFRICAN_VIOLET_MODEL;
  assert.equal(model.clusters.length, 6);
  assert.equal(
    model.surfaces.filter((s) => s.name === "bilateral fused corolla").length,
    6,
  );
});
