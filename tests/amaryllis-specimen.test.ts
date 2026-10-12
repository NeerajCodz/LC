import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import {
  AMARYLLIS_MODEL,
  AMARYLLIS_STALKS,
  AMARYLLIS_INSERTION,
  amaryllisTepal,
} from "../components/flowers/amaryllis/amaryllisGeometry";
import {
  AMARYLLIS_LEAF,
  AMARYLLIS_LEAF_POSES,
} from "../components/flowers/amaryllis/amaryllisLeaf";
import { specimenClusterPoint } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
import { specimenGeometry } from "../lib/three/specimenModel";

test("amaryllis: adaxial green faces upward on both sides of the composed basal fan", () => {
  const geometry = specimenGeometry(AMARYLLIS_LEAF, "low");
  for (const normal of [
    geometry.getAttribute("normal"),
    geometry.morphAttributes.normal![0],
  ])
    for (const [i, pose] of AMARYLLIS_LEAF_POSES.entries())
      for (const row of [4, 8, 12]) {
        const index = row * 13 + 6,
          upper = new Vector3(
            normal.getX(index),
            normal.getY(index),
            normal.getZ(index),
          )
            .applyEuler(new Euler(...pose.rotation))
            .applyEuler(new Euler(-0.06, 0, 0.1, "YXZ"));
        assert.ok(
          upper.y > 0.075,
          `leaf ${i} at ${row / 16}: upper pigment follows the upper face, y=${upper.y}`,
        );
      }
  geometry.dispose();
});

test("amaryllis: dedicated anatomy preserves its defining floral arrangement", () => {
  assert.equal(AMARYLLIS_MODEL.clusters.length, 3);
  assert.equal(
    AMARYLLIS_MODEL.surfaces.filter((s) => s.name === "trumpet tepal").length,
    18,
  );
  assert.equal(
    AMARYLLIS_MODEL.surfaces.filter((s) => s.name === "enclosing umbel spathe")
      .length,
    2,
  );
  assert.equal(
    AMARYLLIS_MODEL.surfaces.filter(
      (s) => s.name === "short fused basal perianth tube",
    ).length,
    3,
  );
  for (let i = 0; i < 3; i++) {
    const c = AMARYLLIS_MODEL.clusters[i],
      organs = AMARYLLIS_MODEL.organs.filter((o) => o.cluster === i);
    assert.equal(
      organs.filter((o) => o.name === "arched stamen filament").length,
      6,
    );
    assert.equal(
      organs.filter((o) => o.name === "dorsifixed anther chamber").length,
      12,
    );
    assert.equal(
      organs.filter((o) => o.name === "three-branched stigma tip").length,
      3,
    );
    assert.equal(
      organs.filter((o) => o.name === "declinate central style").length,
      1,
    );
    assert.deepEqual(AMARYLLIS_STALKS[i].points[0], AMARYLLIS_INSERTION);
    assert.deepEqual(
      AMARYLLIS_STALKS[i].points.at(-1),
      specimenClusterPoint(c, [0, -0.19, 0]),
    );
    if (i < 2) {
      const direction = new Vector3(0, 1, 0).applyEuler(
        new Euler(...c.rotation),
      );
      assert.ok(
        direction.y < 0.12 && direction.z > 0.7,
        "open trumpets are held nearly horizontally",
      );
      assert.ok(
        organs
          .filter((o) => o.name === "arched stamen filament")
          .every((o) => o.points[2][2] > o.points[3][2]),
        "declinate filaments curve back up at their anthers",
      );
    }
  }
});

test("amaryllis: broad unequal tepals form a trumpet around a short continuous basal tube", () => {
  const outer = amaryllisTepal(0),
    lowerInner = amaryllisTepal(3),
    width = (sample: ReturnType<typeof amaryllisTepal>) => {
      const l = sample(0, 0.55, 1),
        r = sample(1, 0.55, 1);
      return Math.hypot(l[0] - r[0], l[2] - r[2]);
    };
  assert.ok(width(outer) > width(lowerInner) * 1.25);
  const tip = outer(0.5, 1, 1),
    foldedTip = outer(0.5, 1, 0),
    budTip = amaryllisTepal(0, true)(0.5, 1, 1);
  assert.ok(Math.hypot(tip[0], tip[2]) > 0.75);
  assert.ok(Math.hypot(foldedTip[0], foldedTip[2]) < 0.025);
  assert.ok(Math.hypot(budTip[0], budTip[2]) < 0.082);
  assert.equal(AMARYLLIS_LEAF_POSES.length, 6);
  assert.ok(AMARYLLIS_LEAF.sample(0.5, 1, 1)[1] > 2.1);
});
verifySpecimen("amaryllis", AMARYLLIS_MODEL);
test("amaryllis: six imbricated younger-bud tips cross the axis at one closed apex", () => {
  const tips = AMARYLLIS_MODEL.surfaces.filter(
    (s) => s.cluster === 2 && s.name === "trumpet tepal",
  );
  tips.forEach((s, i) => {
    const a = (i * Math.PI) / 3,
      p = s.sample(0.5, 1, 1);
    assert.ok(
      p[0] * Math.sin(a) + p[2] * Math.cos(a) < 0,
      "all six real tepal tips overlap past the closed bud axis",
    );
    assert.ok(Math.hypot(p[0], p[2]) < 0.008);
    assert.ok(Math.abs(p[1] - 1.51) < 0.002);
  });
});
verifySpecimen("amaryllis foliage", {
  clusters: AMARYLLIS_MODEL.clusters.slice(0, 1),
  surfaces: [AMARYLLIS_LEAF],
  organs: [],
});
