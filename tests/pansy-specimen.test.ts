import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { PANSY_MODEL } from "../components/flowers/pansy/pansyGeometry";
verifySpecimen("pansy", PANSY_MODEL);
test("pansy differentiates its paired upper blades and lower spurred blade", () => {
  for (let cluster = 0; cluster < 4; cluster++) {
    const petals = PANSY_MODEL.surfaces.filter(
      (s) => s.cluster === cluster && s.role === "petal",
    );
    assert.equal(petals.filter((s) => s.tissue === "inner").length, 2);
    assert.equal(petals.filter((s) => s.tissue === "guide").length, 1);
    const spur = PANSY_MODEL.surfaces.find(
      (s) => s.cluster === cluster && s.name === "lower petal nectar spur",
    )!;
    assert.ok(spur.periodic && spur.contactObstacle);
    assert.ok(spur.sample(0.5, 1, 1)[1] < -0.3);
    assert.equal(
      PANSY_MODEL.organs.filter(
        (o) => o.cluster === cluster && o.name === "stamen filament",
      ).length,
      5,
    );
  }
});

test("pansy: dedicated anatomy preserves its defining floral arrangement", async () => {
  const anatomy =
    await import("../components/flowers/pansy/pansyGeometry").catch(() => null);
  assert.ok(anatomy, "pansy anatomy is missing");
  const model = anatomy.PANSY_MODEL;
  assert.equal(model.clusters.length, 4);
  assert.equal(
    model.surfaces.filter((s) => s.name === "unequal petal").length,
    20,
  );
});
