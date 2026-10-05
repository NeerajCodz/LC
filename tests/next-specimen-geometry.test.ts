import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { CYCLAMEN_MODEL } from "../components/flowers/cyclamen/cyclamenGeometry";
import { CYCLAMEN_LEAF } from "../components/flowers/cyclamen/cyclamenLeaf";
verifySpecimen("cyclamen fleshy leaf", {
  clusters: [],
  surfaces: [CYCLAMEN_LEAF],
  organs: [],
});
verifySpecimen("cyclamen", CYCLAMEN_MODEL);
test("cyclamen has five reflexed twisted lobes per mature flower and individually curved basal stalks", () => {
  for (let k = 1; k <= 3; k++) {
    const lobes = CYCLAMEN_MODEL.surfaces.filter(
      (s) => s.cluster === k && s.role === "petal",
    );
    assert.equal(lobes.length, 5);
    for (const lobe of lobes) {
      assert.ok(lobe.sample(0.5, 1, 1)[1] > 0.5);
      assert.ok(lobe.sample(0.5, 1, 0)[1] < -0.3);
    }
  }
  assert.equal(
    CYCLAMEN_MODEL.organs.filter((o) => o.name === "curved flower stalk")
      .length,
    5,
  );
  assert.ok(
    CYCLAMEN_MODEL.organs
      .filter((o) => /stamen|style/.test(o.name))
      .every((o) => o.points.every((p) => p[1] < 0)),
  );
});
