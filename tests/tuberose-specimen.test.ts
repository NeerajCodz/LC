import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Matrix4, Vector3 } from "three";
import {
  TUBEROSE_MODEL,
  TUBEROSE_STALKS,
  TUBEROSE_PAIR_NODES,
  tuberosePerianth,
  tuberoseCenter,
} from "../components/flowers/tuberose/tuberoseGeometry";
import {
  TUBEROSE_LEAF,
  TUBEROSE_FOLIAGE_NODES,
} from "../components/flowers/tuberose/tuberoseLeaf";
import {
  specimenOrganParts,
  specimenGeometry,
  specimenOrganGeometry,
  specimenClusterPoint,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
test("tuberose: the cheap head-carried axis uses an identity carrier and preserves every positive insertion under the head pose", () => {
  const model = TUBEROSE_MODEL,
    stalks = TUBEROSE_STALKS,
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
verifySpecimen("tuberose", TUBEROSE_MODEL);
verifySpecimen("tuberose leaf", {
  clusters: [],
  surfaces: [TUBEROSE_LEAF],
  organs: [],
});
test("tuberose: every paired flower has one continuous tube, six included stamens, three stigma divisions and an inferior ovary", () => {
  assert.equal(TUBEROSE_MODEL.clusters.length, 15);
  for (let c = 1; c < 15; c++) {
    const surfaces = TUBEROSE_MODEL.surfaces.filter((s) => s.cluster === c),
      organs = TUBEROSE_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(surfaces.length, 1);
    assert.ok(surfaces[0].periodic);
    assert.equal(
      organs.filter((o) => o.name === "upper-tube tuberose stamen filament")
        .length,
      6,
    );
    assert.equal(
      organs.filter((o) => o.name === "tuberose stamen anther chamber").length,
      12,
    );
    assert.equal(
      organs.filter((o) => o.name === "three-part tuberose stigma").length,
      3,
    );
    assert.ok(
      organs
        .find((o) => o.name === "inferior tuberose ovary")!
        .points.every((p) => p[1] <= 0.02),
    );
    assert.ok(
      organs
        .filter((o) => o.name === "upper-tube tuberose stamen filament")
        .every((o) => o.points[0][1] > 0.29),
    );
  }
});
test("tuberose: the six true lobes, near-base bend and shared paired attachments survive the authored geometry", () => {
  const center = tuberoseCenter(1, 1);
  for (let i = 0; i < 6; i++) {
    const peak = tuberosePerianth(i / 6, 1, 1),
      notch = tuberosePerianth((i + 0.5) / 6, 1, 1);
    assert.ok(
      Math.hypot(peak[0], peak[2] - center[2]) >
        Math.hypot(notch[0], notch[2] - center[2]) * 2,
    );
  }
  for (const open of [0, 0.5, 1])
    for (const v of [0, 0.25, 0.7, 1]) {
      const a = tuberosePerianth(0, v, open),
        b = tuberosePerianth(1, v, open);
      assert.ok(Math.hypot(...a.map((x, i) => x - b[i])) < 1e-10);
    }
  assert.ok(tuberoseCenter(0.1, 1)[2] > tuberoseCenter(1, 1)[2] * 0.6);
  const stalks = TUBEROSE_STALKS.filter(
    (o) => o.name === "paired tuberose flower attachment",
  );
  assert.equal(stalks.length, 14);
  stalks.forEach((o, i) => {
    assert.deepEqual(o.points[0], TUBEROSE_PAIR_NODES[Math.floor(i / 2)]);
    assert.deepEqual(o.points.at(-1), TUBEROSE_MODEL.clusters[i + 1].position);
  });
  assert.equal(
    TUBEROSE_MODEL.surfaces.filter(
      (s) => s.name === "shared two-flowered tuberose bract",
    ).length,
    7,
  );
});
test("tuberose: complete reproductive geometry is retained in constrained renderer partitions and the foliage stays basal", () => {
  for (const quality of ["overview", "low"] as const)
    for (let c = 1; c < 15; c++) {
      const parts = specimenOrganParts(TUBEROSE_MODEL, c, quality, true);
      try {
        assert.equal(parts.length, 23);
        for (const p of parts)
          assert.equal(
            p.geometry.morphAttributes.normal![0].count,
            p.geometry.getAttribute("normal").count,
          );
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
  assert.equal(TUBEROSE_FOLIAGE_NODES.length, 5);
  assert.ok(TUBEROSE_FOLIAGE_NODES.every((n) => n.t < 0.05));
  assert.ok(TUBEROSE_LEAF.sample(1, 0.5, 1)[0] < 0.05);
});
test("tuberose: complete overview head remains below the indexed-input target", () => {
  let inputs = 0;
  for (const s of TUBEROSE_MODEL.surfaces) {
    const g = specimenGeometry(s, "overview");
    inputs += g.index!.count;
    g.dispose();
  }
  for (const o of TUBEROSE_MODEL.organs) {
    const g = specimenOrganGeometry(o, "overview");
    inputs += g.index!.count;
    g.dispose();
  }
  assert.ok(inputs < 100000, String(inputs));
});

test("tuberose is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "tuberose");
  assert.ok(type, "tuberose catalog integration is missing");
  assert.equal(getFlower(type).latin, "Agave amica");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
