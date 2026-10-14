import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Matrix4, Vector3 } from "three";
import {
  specimenGeometry,
  specimenOrganGeometry,
  specimenClusterPoint,
  specimenOrganParts,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
test("lupine: the cheap head-carried axis uses an identity carrier and preserves every positive insertion under the head pose", () => {
  const model = anatomy.LUPINE_MODEL,
    stalks = anatomy.LUPINE_STALKS,
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

import * as anatomy from "../components/flowers/lupine/lupineGeometry";
import * as foliage from "../components/flowers/lupine/lupineLeaf";

test("lupine: every whorled flower retains its bilateral enclosing petals and ten joined stamens", () => {
  assert.ok(anatomy, "Lupine's anatomical model is absent");
  const { LUPINE_MODEL: model, LUPINE_FLOWER_POSITIONS: positions } = anatomy;
  assert.equal(positions.length, 24);
  assert.equal(new Set(positions.slice(0, 21).map((p) => p[1])).size, 3);
  for (let c = 1; c <= positions.length; c++) {
    const surfaces = model.surfaces.filter((s) => s.cluster === c);
    assert.equal(surfaces.filter((s) => s.role === "banner").length, 1);
    assert.equal(surfaces.filter((s) => s.role === "wing").length, 2);
    assert.equal(surfaces.filter((s) => s.role === "keel").length, 2);
    assert.equal(surfaces.filter((s) => s.role === "calyx").length, 2);
    const organs = model.organs.filter((o) => o.cluster === c);
    assert.equal(
      organs.filter((o) => o.name === "monadelphous stamen filament").length,
      10,
    );
    assert.equal(
      organs.filter((o) => o.name === "dimorphic stamen anther").length,
      10,
    );
    assert.equal(
      organs.filter((o) => o.name === "joined stamen column").length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "brushy curved style").length,
      1,
    );
    assert.ok(organs.every((o) => !/free tenth|nectar/.test(o.name)));
    for (const organ of organs) {
      assert.equal(organ.foldedPoints?.length, organ.points.length, organ.name);
      assert.ok(organ.points.every((p) => p.every(Number.isFinite)));
    }
  }
});

test("lupine: all short pedicels meet the actual flower insertion and the upper buds remain young", () => {
  assert.ok(anatomy, "Lupine's anatomical model is absent");
  const {
    LUPINE_MODEL: model,
    LUPINE_STALKS: stalks,
    LUPINE_FLOWER_POSITIONS: positions,
  } = anatomy;
  const pedicels = stalks.filter((o) => o.name === "short lupine pedicel");
  assert.equal(pedicels.length, 24);
  pedicels.forEach((o, i) => {
    assert.deepEqual(o.points.at(-1), positions[i]);
    assert.deepEqual(
      specimenClusterPoint(model.clusters[i + 1], [0, 0, 0]),
      positions[i],
    );
    assert.ok(
      o.points[0][1] >= 0,
      "raceme attachments are carried above the stem insertion",
    );
  });
  const banner = model.surfaces.find(
    (s) => s.cluster === 1 && s.role === "banner",
  )!;
  const bud = model.surfaces.find(
    (s) => s.cluster === 24 && s.role === "banner",
  )!;
  assert.ok(
    Math.abs(banner.sample(0.85, 0.5, 1)[0]) >
      Math.abs(bud.sample(0.85, 0.5, 1)[0]) * 2,
  );
});

test("lupine: palmate leaflets share one petiole junction without a pinnate rachis", () => {
  assert.ok(foliage, "Lupine's palmately compound foliage is absent");
  assert.equal(foliage.LUPINE_LEAF_POSES.length, 11);
  for (const pose of foliage.LUPINE_LEAF_POSES)
    assert.deepEqual(pose.position, [0, 0.46, 0]);
  assert.equal(
    new Set(foliage.LUPINE_LEAF_POSES.map((p) => p.rotation[2])).size,
    11,
  );
});

test("lupine: overview retains all anatomy within the authored head input ceiling", () => {
  assert.ok(anatomy, "Lupine's anatomical model is absent");
  let inputs = 0;
  for (const s of anatomy.LUPINE_MODEL.surfaces) {
    const geometry = specimenGeometry(s, "overview");
    inputs += geometry.index!.count;
    geometry.dispose();
  }
  for (
    let cluster = 0;
    cluster < anatomy.LUPINE_MODEL.clusters.length;
    cluster++
  )
    for (const included of [false, true]) {
      const parts = specimenOrganParts(
        anatomy.LUPINE_MODEL,
        cluster,
        "overview",
        included,
      );
      for (const { geometry } of parts) {
        inputs += geometry.index!.count;
        geometry.dispose();
      }
    }
  assert.ok(inputs < 100_000, String(inputs));
});

verifySpecimen("lupine", anatomy.LUPINE_MODEL);
verifySpecimen("lupine leaflet", {
  clusters: [],
  surfaces: [foliage.LUPINE_LEAFLET],
  organs: [],
});
