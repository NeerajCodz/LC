import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { CYCLAMEN_MODEL } from "../components/flowers/cyclamen/cyclamenGeometry";
import { CYCLAMEN_LEAF } from "../components/flowers/cyclamen/cyclamenLeaf";
import {
  SNAPDRAGON_MODEL,
  snapdragonCorolla,
} from "../components/flowers/snapdragon/snapdragonGeometry";
verifySpecimen("snapdragon", SNAPDRAGON_MODEL);
test("snapdragon has a bilateral continuous corolla, four included stamens and a yielding lower palate", () => {
  assert.equal(
    SNAPDRAGON_MODEL.surfaces.filter(
      (s) => s.name === "bilateral closed-mouth corolla",
    ).length,
    8,
  );
  assert.equal(
    SNAPDRAGON_MODEL.surfaces.filter((s) => s.name === "terminal bud").length,
    4,
  );
  assert.equal(
    SNAPDRAGON_MODEL.organs.filter(
      (o) => o.name === "included didynamous stamen",
    ).length,
    32,
  );
  const resting = snapdragonCorolla(0.75, 0.8, 1, 0),
    pressed = snapdragonCorolla(0.75, 0.8, 1, 1);
  assert.ok(pressed[1] < resting[1] - 0.13);
  assert.deepEqual(
    snapdragonCorolla(0.25, 0.8, 1, 0),
    snapdragonCorolla(0.25, 0.8, 1, 1),
  );
});
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
