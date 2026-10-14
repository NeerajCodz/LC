import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Matrix4, Vector3 } from "three";
import {
  HOLLYHOCK_MODEL,
  HOLLYHOCK_STALKS,
  hollyhockPetal,
} from "../components/flowers/hollyhock/hollyhockGeometry";
import { HOLLYHOCK_LEAF } from "../components/flowers/hollyhock/hollyhockLeaf";
import {
  specimenOrganParts,
  specimenOrganFollowsBloom,
  specimenGeometry,
  specimenOrganGeometry,
  specimenClusterPoint,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
test("hollyhock: the cheap head-carried axis uses an identity carrier and preserves every positive insertion under the head pose", () => {
  const model = HOLLYHOCK_MODEL,
    stalks = HOLLYHOCK_STALKS,
    axis = model.clusters[0],
    head = new Matrix4()
      .makeRotationFromEuler(new Euler(0.17, -0.12, 0.07))
      .setPosition(0.21, -0.06, -0.08);
  assert.deepEqual(axis.position, [0, 0, 0]);
  assert.deepEqual(axis.rotation, [0, 0, 0]);
  assert.equal(axis.scale, 1);
  assert.equal(axis.nod, 0);
  for (const stalk of stalks) {
    assert.equal(stalk.cluster, 0);
    assert.ok(stalk.points[0][1] >= 0);
    assert.equal(
      model.organs.filter((o) => o === stalk).length,
      1,
      "the complete render model contains each axis organ exactly once",
    );
    const geometry = specimenOrganGeometry(stalk, "overview"),
      positions = geometry.getAttribute("position");
    try {
      for (const end of [false, true]) {
        const vertex = new Vector3().fromBufferAttribute(
            positions,
            positions.count - (end ? 1 : 2),
          ),
          actual = new Vector3(
            ...specimenClusterPoint(axis, [vertex.x, vertex.y, vertex.z]),
          ).applyMatrix4(head),
          expected = new Vector3(
            ...(end ? stalk.points.at(-1)! : stalk.points[0]),
          ).applyMatrix4(head);
        assert.ok(actual.distanceTo(expected) < 1e-6, stalk.name);
      }
    } finally {
      geometry.dispose();
    }
  }
});
verifySpecimen("hollyhock", HOLLYHOCK_MODEL);
verifySpecimen("hollyhock leaf", {
  clusters: [],
  surfaces: [HOLLYHOCK_LEAF],
  organs: [],
});

test("hollyhock: single petals retain separate epicalyx/calyx and numerous upper-column anthers/styles", () => {
  assert.equal(HOLLYHOCK_MODEL.clusters.length, 8);
  for (let c = 1; c < 8; c++) {
    const surfaces = HOLLYHOCK_MODEL.surfaces.filter((s) => s.cluster === c),
      organs = HOLLYHOCK_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      surfaces.filter((s) => s.name === "notched single hollyhock petal")
        .length,
      5,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "seven-lobed epicalyx").length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "five-lobed calyx").length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "upper-column stamen filament").length,
      32,
    );
    assert.equal(
      organs.filter((o) => o.name === "compact hollyhock stamen anther").length,
      32,
    );
    assert.equal(
      organs.filter((o) => o.name === "filiform style branch").length,
      16,
    );
    assert.ok(
      organs
        .filter((o) => o.name === "upper-column stamen filament")
        .every((o) => o.points[0][1] >= 0.28 * (c > 5 ? 0.76 : 1)),
    );
    assert.ok(
      organs.every(
        (o) =>
          o.foldedPoints!.length === o.points.length &&
          specimenOrganFollowsBloom(o),
      ),
    );
  }
});
test("hollyhock: open petal apex has a real notch and its short pedicels reach all seven insertions", () => {
  const p = hollyhockPetal(0),
    notch = p(0.5, 1, 1),
    edge = p(0.75, 1, 1);
  assert.ok(
    Math.hypot(notch[0], notch[2]) < Math.hypot(edge[0], edge[2]) - 0.025,
  );
  const stalks = HOLLYHOCK_STALKS.filter(
    (o) => o.name === "short axillary hollyhock pedicel",
  );
  assert.equal(stalks.length, 7);
  stalks.forEach((o, i) =>
    assert.deepEqual(o.points.at(-1), HOLLYHOCK_MODEL.clusters[i + 1].position),
  );
  assert.ok(HOLLYHOCK_LEAF.sample(1, 0.5, 1)[0] > 0.4);
});
test("hollyhock: all sampled reproductive organs remain in both constrained renderer partitions", () => {
  for (const quality of ["overview", "low"] as const)
    for (let c = 1; c < 8; c++) {
      const parts = specimenOrganParts(HOLLYHOCK_MODEL, c, quality, true);
      try {
        assert.equal(parts.length, 82);
        for (const p of parts)
          assert.equal(
            p.geometry.morphAttributes.normal![0].count,
            p.geometry.getAttribute("normal").count,
          );
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
});
test("hollyhock: complete overview head remains within the indexed-input target", () => {
  let inputs = 0;
  for (const s of HOLLYHOCK_MODEL.surfaces) {
    const g = specimenGeometry(s, "overview");
    inputs += g.index!.count;
    g.dispose();
  }
  for (const o of HOLLYHOCK_MODEL.organs) {
    const g = specimenOrganGeometry(o, "overview");
    inputs += g.index!.count;
    g.dispose();
  }
  assert.ok(inputs < 100000, String(inputs));
});

test("hollyhock is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "hollyhock");
  assert.ok(type, "hollyhock catalog integration is missing");
  assert.equal(getFlower(type).latin, "Alcea rosea");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
