import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import {
  HYACINTH_MODEL,
  HYACINTH_STALKS,
  hyacinthPerianth,
} from "../components/flowers/hyacinth/hyacinthGeometry";
import {
  HYACINTH_LEAF,
  HYACINTH_LEAF_POSES,
} from "../components/flowers/hyacinth/hyacinthLeaf";
import { verifySpecimen } from "./specimen-checks";
import { specimenGeometry } from "../lib/three/specimenModel";

test("hyacinth: adaxial green faces upward on each composed fleshy basal blade", () => {
  const geometry = specimenGeometry(HYACINTH_LEAF, "low");
  for (const normal of [
    geometry.getAttribute("normal"),
    geometry.morphAttributes.normal![0],
  ])
    for (const [i, pose] of HYACINTH_LEAF_POSES.entries())
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

test("hyacinth: dedicated anatomy preserves its defining floral arrangement", () => {
  assert.equal(HYACINTH_MODEL.clusters.length, 21);
  assert.equal(
    HYACINTH_MODEL.surfaces.filter((s) => s.name === "waxy reflexed perianth")
      .length,
    21,
  );
  const quadrants = new Set<number>();
  for (let i = 0; i < 21; i++) {
    const c = HYACINTH_MODEL.clusters[i],
      organs = HYACINTH_MODEL.organs.filter((o) => o.cluster === i);
    assert.equal(organs.filter((o) => o.name === "stamen filament").length, 6);
    assert.equal(
      organs.filter((o) => o.name === "stamen anther chamber").length,
      12,
    );
    assert.equal(
      organs.filter((o) => o.name === "included hyacinth style").length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "three-lobed hyacinth stigma").length,
      3,
    );
    if (i < 18) {
      quadrants.add(
        (c.position[0] >= 0 ? 1 : 0) + (c.position[2] >= 0 ? 2 : 0),
      );
      const direction = new Vector3(0, 1, 0).applyEuler(
        new Euler(...c.rotation),
      );
      assert.ok(
        direction.x * c.position[0] + direction.z * c.position[2] > 0.12,
        "raceme flowers face outward from the central axis",
      );
    }
  }
  assert.equal(quadrants.size, 4);
  HYACINTH_STALKS.filter((o) => o.name === "short fleshy pedicel").forEach(
    (p, i) => {
      assert.equal(p.points[0][0], 0);
      assert.equal(p.points[0][2], 0);
      assert.deepEqual(p.points.at(-1), HYACINTH_MODEL.clusters[i].position);
    },
  );
});

test("hyacinth: six fleshy reflexed limbs remain fused and terminal buds stay enclosed", () => {
  const r = (u: number, young = false) => {
    const p = hyacinthPerianth(u, 1, 1, young);
    return Math.hypot(p[0], p[2]);
  };
  for (let i = 0; i < 6; i++) {
    assert.ok(r(i / 6) - r((i + 0.5) / 6) > 0.16);
    assert.ok(
      hyacinthPerianth(i / 6, 1, 1)[1] <
        hyacinthPerianth((i + 0.5) / 6, 1, 1)[1] - 0.16,
    );
  }
  assert.ok(r(0, true) < r(0) * 0.16);
  assert.equal(HYACINTH_LEAF_POSES.length, 5);
  assert.ok(
    HYACINTH_LEAF.sample(0, 0.5, 1)[2] >
      HYACINTH_LEAF.sample(0.5, 0.5, 1)[2] + 0.075,
    "fleshy leaf edges turn up above the keel",
  );
  assert.ok(HYACINTH_LEAF.thickness >= 0.03);
});
verifySpecimen("hyacinth", HYACINTH_MODEL);
test("hyacinth: three terminal buds close with six overlapping waxy tips each", () => {
  for (const cluster of [18, 19, 20]) {
    const tips = HYACINTH_MODEL.surfaces.filter(
      (s) =>
        s.cluster === cluster && s.name === "imbricated closed-bud tepal tip",
    );
    assert.equal(
      tips.length,
      6,
      "young fused tubes must have a closed perianth apex",
    );
    tips.forEach((s, i) => {
      const a = (i * Math.PI) / 3,
        p = s.sample(0.5, 1, 1);
      assert.ok(p[0] * Math.cos(a) + p[2] * Math.sin(a) < 0);
      assert.ok(s.thickness >= 0.018);
    });
  }
});
verifySpecimen("hyacinth foliage", {
  clusters: HYACINTH_MODEL.clusters.slice(0, 1),
  surfaces: [HYACINTH_LEAF],
  organs: [],
});

test("hyacinth is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types");
  const { getFlower } = await import("../lib/flowers/catalog");
  const { FLOWER_STRUCTURES } = await import("../lib/flowers/structures");
  const { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "hyacinth");
  assert.ok(type, "hyacinth catalog integration is missing");
  assert.equal(getFlower(type).latin, "Hyacinthus orientalis");
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.ok(FLOWER_STRUCTURES[type].leafCount > 0);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
