import test from "node:test";
import assert from "node:assert/strict";
import { FLOWERS } from "../lib/flowers/catalog";
import { FLOWER_TYPES } from "../lib/flowers/types";
test("bluebell is registered with its English bluebell taxon", () => {
  assert.ok((FLOWER_TYPES as readonly string[]).includes("bluebell"));
  assert.equal(
    FLOWERS.find((f) => (f.type as string) === "bluebell")?.latin,
    "Hyacinthoides non-scripta",
  );
});
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
import { specimenGeometry } from "../lib/three/specimenModel";

test("bluebell: adaxial green faces upward on the composed drooping basal blades", () => {
  const geometry = specimenGeometry(BLUEBELL_LEAF, "low");
  for (const normal of [
    geometry.getAttribute("normal"),
    geometry.morphAttributes.normal![0],
  ])
    for (const [i, pose] of BLUEBELL_LEAF_POSES.entries())
      for (const row of [4, 8, 12]) {
        const index = row * 13 + 6,
          upper = new Vector3(
            normal.getX(index),
            normal.getY(index),
            normal.getZ(index),
          )
            .applyEuler(new Euler(...pose.rotation))
            .applyEuler(new Euler(-0.1, 0, 0.1, "YXZ"));
        assert.ok(
          upper.y > 0.075,
          `leaf ${i} at ${row / 16}: upper pigment follows the upper face, y=${upper.y}`,
        );
      }
  geometry.dispose();
});

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
test("bluebell: terminal buds close with six overlapping thick tepal tips each", () => {
  for (const cluster of [8, 9]) {
    const tips = BLUEBELL_MODEL.surfaces.filter(
      (s) =>
        s.cluster === cluster && s.name === "imbricated closed-bud tepal tip",
    );
    assert.equal(
      tips.length,
      6,
      "a continuous bell wall needs overlapping terminal tepal tissue to close its bud",
    );
    tips.forEach((s, i) => {
      const a = (i * Math.PI) / 3,
        p = s.sample(0.5, 1, 1);
      assert.ok(
        p[0] * Math.cos(a) + p[2] * Math.sin(a) < 0,
        "each pointed tepal crosses the bud axis without collapsing its width",
      );
      assert.ok(s.thickness >= 0.012);
    });
  }
});
verifySpecimen("bluebell foliage", {
  clusters: BLUEBELL_MODEL.clusters.slice(0, 1),
  surfaces: [BLUEBELL_LEAF],
  organs: [],
});
