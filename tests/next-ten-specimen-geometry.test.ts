import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { RANUNCULUS_MODEL } from "../components/flowers/ranunculus/ranunculusGeometry";
import {
  RANUNCULUS_LEAFLET,
  RANUNCULUS_LEAF_POSES,
} from "../components/flowers/ranunculus/ranunculusLeaf";

verifySpecimen("ranunculus", RANUNCULUS_MODEL);
verifySpecimen("ranunculus dissected foliage", {
  clusters: [],
  surfaces: [RANUNCULUS_LEAFLET],
  organs: [],
});
test("ranunculus divided leaflets meet one petiole and retain deep incisions", () => {
  assert.equal(RANUNCULUS_LEAF_POSES.length, 3);
  for (const pose of RANUNCULUS_LEAF_POSES)
    assert.deepEqual(pose.position, [0, 0.14, 0]);
  assert.ok(
    RANUNCULUS_LEAFLET.sample(1, 0.5, 1)[0] <
      RANUNCULUS_LEAFLET.sample(1, 0.375, 1)[0] * 0.5,
  );
});

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
