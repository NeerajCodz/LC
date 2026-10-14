import test from "node:test";
import assert from "node:assert/strict";
import {
  IMPATIENS_MODEL,
  IMPATIENS_STALKS,
  impatiensSpurredSepal,
} from "../components/flowers/impatiens/impatiensGeometry";
import { verifySpecimen } from "./specimen-checks";
import { IMPATIENS_LEAF } from "../components/flowers/impatiens/impatiensLeaf";
import { Matrix4, Vector3 } from "three";
import {
  createSurfaceBatch,
  surfaceBatchGroups,
  type SurfaceBatchUniforms,
} from "../lib/three/surfaceBatch";
import {
  createSurfaceBatchPoses,
  writeSurfaceBatchPose,
  surfaceBatchVertex,
} from "../lib/three/surfaceBatchPose";

test("impatiens: a pulse preserves each joined lateral pair insertion in the actual overview vertex path", () => {
  const poses = createSurfaceBatchPoses(IMPATIENS_MODEL.clusters),
    matrix = new Matrix4();
  try {
    for (const group of surfaceBatchGroups(IMPATIENS_MODEL))
      for (const entry of group.entries.filter(
        (e) => e.surface.name === "joined deeply bilobed lateral pair",
      )) {
        const geometry = createSurfaceBatch([entry], IMPATIENS_MODEL.clusters),
          uniforms: SurfaceBatchUniforms = {
            uBatchBloom: { value: 1 },
            uBatchPressure: { value: 0 },
            uBatchPoses: { value: poses.texture },
            uBatchPoseRows: { value: IMPATIENS_MODEL.clusters.length },
            uBatchHinge: {
              value: group.role === "wing" || group.role === "keel" ? 1 : 0,
            },
          };
        try {
          assert.ok(
            entry.surface.flexible,
            "the lateral pair still has a pinned contact cage",
          );
          for (const bloom of [0, 0.5, 1]) {
            uniforms.uBatchBloom.value = bloom;
            writeSurfaceBatchPose(poses, entry.surface.cluster, matrix, 0);
            const resting = surfaceBatchVertex(
              geometry,
              0,
              uniforms,
              new Vector3(),
              matrix,
            );
            writeSurfaceBatchPose(poses, entry.surface.cluster, matrix, 0.3);
            const pulsed = surfaceBatchVertex(
              geometry,
              0,
              uniforms,
              new Vector3(),
              matrix,
            );
            assert.ok(
              resting.distanceTo(pulsed) < 1e-9,
              `cluster ${entry.surface.cluster}, bloom ${bloom}: lateral root moved under pulse`,
            );
          }
        } finally {
          geometry.dispose();
        }
      }
  } finally {
    poses.texture.dispose();
  }
});

verifySpecimen("impatiens", IMPATIENS_MODEL);
verifySpecimen("impatiens foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  surfaces: [IMPATIENS_LEAF],
  organs: [],
});
test("impatiens: toothed simple leaf preserves a continuous midrib", () => {
  const widths = [0.4, 0.45, 0.5].map((v) => IMPATIENS_LEAF.sample(1, v, 1)[0]);
  assert.ok(Math.max(...widths) - Math.min(...widths) > 0.01);
  for (const v of [0, 0.25, 0.5, 0.75, 1])
    assert.ok(Math.abs(IMPATIENS_LEAF.sample(0.5, v, 1)[0]) < 1e-10);
});
test("impatiens: joined lateral pairs and sepal spur retain the bilateral flower", () => {
  assert.equal(IMPATIENS_MODEL.clusters.length, 5);
  for (let c = 0; c < 5; c++) {
    const surfaces = IMPATIENS_MODEL.surfaces.filter((s) => s.cluster === c);
    assert.equal(
      surfaces.filter((s) => s.name === "dorsal crested petal").length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "joined deeply bilobed lateral pair")
        .length,
      2,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "boat sepal and continuous hollow spur")
        .length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "small lateral sepal").length,
      2,
    );
    const organs = IMPATIENS_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      organs.filter((o) => o.name === "connate anther cap segment").length,
      5,
    );
    assert.equal(organs.filter((o) => o.name === "superior ovary").length, 1);
    assert.ok(
      organs
        .filter((o) => o.name === "connate anther cap segment")
        .every((o) => Math.max(...o.points.map((p) => p[1])) < 0.24),
    );
    for (const pair of surfaces.filter(
      (s) => s.name === "joined deeply bilobed lateral pair",
    )) {
      const notch = pair.sample(0.5, 1, 1),
        upper = pair.sample(0.15, 1, 1),
        lower = pair.sample(0.85, 1, 1);
      assert.ok(Math.abs(notch[0]) < Math.abs(upper[0]) * 0.78);
      assert.ok(upper[2] * lower[2] < 0);
      assert.ok(pair.sample(0.5, 0.15, 1).every(Number.isFinite));
    }
  }
});
test("impatiens: hollow sepal lumen extends into a long recurved spur", () => {
  const mouth = impatiensSpurredSepal(0, 0, 1),
    back = impatiensSpurredSepal(0, 0.7, 1),
    tip = impatiensSpurredSepal(0, 1, 1);
  assert.ok(mouth[0] > 0.1);
  assert.ok(tip[1] < -0.6);
  assert.ok(back[2] < -0.12);
  assert.ok(tip[2] > back[2]);
  const stalks = IMPATIENS_STALKS.filter(
    (s) => s.name === "axillary flower pedicel",
  );
  assert.equal(stalks.length, 5);
  stalks.forEach((s, i) =>
    assert.deepEqual(s.points.at(-1), IMPATIENS_MODEL.clusters[i].position),
  );
});
