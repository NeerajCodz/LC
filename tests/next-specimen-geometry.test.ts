import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { CYCLAMEN_MODEL } from "../components/flowers/cyclamen/cyclamenGeometry";
import { CYCLAMEN_LEAF } from "../components/flowers/cyclamen/cyclamenLeaf";
import { BEGONIA_MODEL } from "../components/flowers/hardy-begonia/begoniaGeometry";
import { BEGONIA_LEAF } from "../components/flowers/hardy-begonia/begoniaLeaf";
import { HYDRANGEA_MODEL } from "../components/flowers/hydrangea/hydrangeaGeometry";
verifySpecimen("hydrangea", HYDRANGEA_MODEL);
test("lacecap hydrangea keeps marginal four-sepalled flowers distinct from the fertile center", () => {
  assert.equal(
    HYDRANGEA_MODEL.surfaces.filter((s) => s.name === "showy petaloid sepal")
      .length,
    40,
  );
  const fertile = HYDRANGEA_MODEL.instances![0];
  assert.equal(fertile.poses.length, 48);
  assert.equal(fertile.surfaces.filter((s) => s.role === "petal").length, 5);
  assert.equal(
    fertile.organs.filter((o) => o.name === "fertile stamen").length,
    10,
  );
  assert.equal(
    fertile.organs.filter((o) => o.name === "fertile style").length,
    3,
  );
  assert.equal(
    HYDRANGEA_MODEL.organs.filter((o) => o.name === "fertile pedicel").length,
    48,
  );
});
verifySpecimen("begonia asymmetric leaf", {
  clusters: [],
  surfaces: [BEGONIA_LEAF],
  organs: [],
});
test("begonia leaf remains one asymmetric blade", () => {
  assert.ok(
    Math.abs(BEGONIA_LEAF.sample(1, 0.4, 1)[0]) >
      Math.abs(BEGONIA_LEAF.sample(0, 0.4, 1)[0]) * 1.5,
  );
});
verifySpecimen("hardy begonia", BEGONIA_MODEL);
test("Begonia grandis preserves sex-specific tepals, stamens and unequal ovary wings", () => {
  for (const k of [1, 2]) {
    assert.equal(
      BEGONIA_MODEL.surfaces.filter(
        (s) => s.cluster === k && s.name === "male tepal",
      ).length,
      4,
    );
    assert.equal(
      BEGONIA_MODEL.organs.filter(
        (o) => o.cluster === k && o.name === "male stamen",
      ).length,
      40,
    );
  }
  for (const k of [3, 4]) {
    assert.equal(
      BEGONIA_MODEL.organs.filter(
        (o) => o.cluster === k && o.name === "U-shaped stigma",
      ).length,
      6,
    );
    assert.equal(
      BEGONIA_MODEL.surfaces.filter(
        (s) => s.cluster === k && s.name === "female tepal",
      ).length,
      3,
    );
    assert.equal(
      BEGONIA_MODEL.surfaces.filter(
        (s) => s.cluster === k && s.name === "ovary wing",
      ).length,
      3,
    );
    assert.equal(
      BEGONIA_MODEL.organs.filter(
        (o) => o.cluster === k && o.name === "male stamen",
      ).length,
      0,
    );
  }
});
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
