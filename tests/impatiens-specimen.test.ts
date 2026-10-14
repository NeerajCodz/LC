import test from "node:test";
import assert from "node:assert/strict";
import {
  IMPATIENS_MODEL,
  IMPATIENS_STALKS,
  impatiensSpurredSepal,
} from "../components/flowers/impatiens/impatiensGeometry";
import { verifySpecimen } from "./specimen-checks";
import { IMPATIENS_LEAF } from "../components/flowers/impatiens/impatiensLeaf";
import { Matrix4, Object3D, Vector3 } from "three";
import { specimenGeometry } from "../lib/three/specimenModel";
import { petalOpenness } from "../lib/three/easing";
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

for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
  test(`impatiens: the ${quality} dorsal petal rises above its spurred lower sepal after assembly`, () => {
    const parent = new Object3D(),
      carrier = new Object3D(),
      poses = createSurfaceBatchPoses(IMPATIENS_MODEL.clusters),
      scratchMatrix = new Matrix4();
    parent.position.set(-0.31, 0.24, 0.18);
    parent.rotation.set(0.17, 0.43, -0.11);
    parent.scale.set(1.1, 0.91, 1.17);
    parent.updateMatrix();
    const up = new Vector3(0, 1, 0).transformDirection(parent.matrix);
    try {
      for (let cluster = 0; cluster < 3; cluster++) {
        const parts = [
          "dorsal crested petal",
          "boat sepal and continuous hollow spur",
        ].map((name) => {
          const index = IMPATIENS_MODEL.surfaces.findIndex(
            (surface) => surface.cluster === cluster && surface.name === name,
          );
          assert.ok(index >= 0);
          const surface = IMPATIENS_MODEL.surfaces[index];
          return {
            surface,
            index,
            geometry:
              quality === "overview"
                ? createSurfaceBatch(
                    [{ surface, index }],
                    IMPATIENS_MODEL.clusters,
                  )
                : specimenGeometry(surface, quality),
          };
        });
        const pose = IMPATIENS_MODEL.clusters[cluster];
        carrier.position.set(...pose.position);
        carrier.rotation.set(...pose.rotation);
        carrier.scale.setScalar(pose.scale);
        carrier.updateMatrix();
        const world = new Matrix4().multiplyMatrices(
            parent.matrix,
            carrier.matrix,
          ),
          uniforms: SurfaceBatchUniforms = {
            uBatchBloom: { value: 1 },
            uBatchPressure: { value: 0 },
            uBatchPoses: { value: poses.texture },
            uBatchPoseRows: { value: IMPATIENS_MODEL.clusters.length },
            uBatchHinge: { value: 0 },
          };
        try {
          for (const bloom of [0.5, 1]) {
            uniforms.uBatchBloom.value = bloom;
            const centroid = (
              part: (typeof parts)[number],
              select: (u: number, v: number) => boolean,
            ) => {
              const { geometry, surface, index } = part,
                uv = geometry.getAttribute("uv"),
                position = geometry.getAttribute("position"),
                folded = geometry.morphAttributes.position?.[0],
                open = petalOpenness(bloom, surface.delay ?? 0, index * 0.31),
                mean = new Vector3(),
                point = new Vector3();
              let count = 0;
              // Average both real shell faces, so thickness cannot fake orientation.
              for (let vertex = 0; vertex < position.count; vertex++) {
                if (!select(uv.getX(vertex), uv.getY(vertex))) continue;
                if (quality === "overview") {
                  surfaceBatchVertex(
                    geometry,
                    vertex,
                    uniforms,
                    point,
                    scratchMatrix,
                  ).applyMatrix4(parent.matrix);
                } else {
                  point.fromBufferAttribute(position, vertex);
                  point.lerp(
                    new Vector3().fromBufferAttribute(folded!, vertex),
                    1 - open,
                  );
                  point.applyMatrix4(world);
                }
                mean.add(point);
                count++;
              }
              assert.ok(count > 0);
              return mean.divideScalar(count);
            };
            const dorsal = centroid(
                parts[0],
                (u, v) => u >= 0.25 && u <= 0.75 && v >= 0.6,
              ),
              mouth = centroid(parts[1], (_u, v) => v === 0),
              tip = centroid(parts[1], (_u, v) => v === 1),
              height = dorsal.clone().sub(mouth).dot(up);
            assert.ok(
              height > 0.1,
              `cluster ${cluster}, bloom ${bloom}: dorsal height ${height} must be above the lower sepal`,
            );
            assert.ok(
              tip.sub(mouth).dot(up) < -0.12,
              "the existing long spur remains below its mouth after assembly",
            );
          }
          // Correcting the dorsal direction must retain the authored insertion.
          for (const bloom of [0, 0.5, 1])
            assert.deepEqual(
              parts[0].surface.sample(0.5, 0, bloom),
              [0, 0.16, 0.035],
            );
        } finally {
          parts.forEach(({ geometry }) => geometry.dispose());
        }
      }
    } finally {
      poses.texture.dispose();
    }
  });

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

test("impatiens is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "impatiens");
  assert.ok(type, "impatiens catalog integration is missing");
  assert.equal(getFlower(type).latin, "Impatiens walleriana");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
