import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import {
  BLUEBELL_MODEL,
  BLUEBELL_STALKS,
  bluebellAxis,
  bluebellPerianth,
} from "../components/flowers/bluebell/bluebellGeometry";
import {
  BLUEBELL_LEAF,
  BLUEBELL_LEAF_POSES,
} from "../components/flowers/bluebell/bluebellLeaf";
import { verifySpecimen } from "./specimen-checks";

test("bluebell: dedicated anatomy preserves its defining floral arrangement", () => {
  assert.equal(BLUEBELL_MODEL.clusters.length, 10);
  assert.equal(
    BLUEBELL_MODEL.surfaces.filter((s) => s.name === "nodding six-lobed bell")
      .length,
    10,
  );
  for (let i = 0; i < 10; i++) {
    const c = BLUEBELL_MODEL.clusters[i];
    assert.ok(
      c.position[0] > bluebellAxis(i / 9)[0],
      "flowers must all sit on one side of the raceme",
    );
    const axis = new Vector3(0, 1, 0).applyEuler(new Euler(...c.rotation));
    assert.ok(axis.y < -0.5, "English bluebell mouths must nod downwards");
    const organs = BLUEBELL_MODEL.organs.filter((o) => o.cluster === i);
    const filaments = organs.filter((o) => o.name === "stamen filament");
    assert.equal(filaments.length, 6);
    assert.equal(
      organs.filter((o) => o.name === "stamen anther chamber").length,
      12,
    );
    assert.ok(
      Math.max(...filaments.map((o) => o.points[2][1])) -
        Math.min(...filaments.map((o) => o.points[2][1])) >
        0.075,
    );
    assert.ok(
      organs
        .filter((o) => o.name === "stamen anther chamber")
        .every((o) => o.color === "#f1efe0"),
    );
    assert.equal(
      organs.filter((o) => o.name === "included central style").length,
      1,
    );
  }
  const pedicels = BLUEBELL_STALKS.filter(
    (o) => o.name === "nodding bell pedicel",
  );
  pedicels.forEach((p, i) => {
    assert.deepEqual(p.points[0], bluebellAxis(i / 9));
    assert.deepEqual(p.points.at(-1), BLUEBELL_MODEL.clusters[i].position);
  });
});

test("bluebell: continuous perianth keeps six recurved tips and tightly enclosed terminal buds", () => {
  const radial = (u: number, young = false) => {
    const p = bluebellPerianth(u, 1, 1, young);
    return Math.hypot(p[0], p[2]);
  };
  for (let i = 0; i < 6; i++) {
    assert.ok(radial(i / 6) > radial((i + 0.5) / 6) + 0.09);
    assert.ok(
      bluebellPerianth(i / 6, 1, 1)[1] <
        bluebellPerianth((i + 0.5) / 6, 1, 1)[1] - 0.1,
    );
  }
  assert.ok(radial(0, true) < radial(0) * 0.25);
  assert.deepEqual(
    bluebellPerianth(0, 0.52, 0.5),
    bluebellPerianth(1, 0.52, 0.5).map((n, i) => (i === 2 ? 0 : n)),
  );
  assert.equal(BLUEBELL_LEAF_POSES.length, 5);
});

verifySpecimen("bluebell", BLUEBELL_MODEL);
verifySpecimen("bluebell foliage", {
  clusters: BLUEBELL_MODEL.clusters.slice(0, 1),
  surfaces: [BLUEBELL_LEAF],
  organs: [],
});
