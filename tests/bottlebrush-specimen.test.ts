import test from "node:test";
import assert from "node:assert/strict";
import { FLOWERS } from "../lib/flowers/catalog";
import { FLOWER_TYPES } from "../lib/flowers/types";
test("bottlebrush: typed catalog preserves its scientific study", () => {
  assert.ok((FLOWER_TYPES as readonly string[]).includes("bottlebrush"));
  assert.equal(
    FLOWERS.find((f) => (f.type as string) === "bottlebrush")?.latin,
    "Melaleuca citrina",
  );
});
import {
  BOTTLEBRUSH_MODEL,
  BOTTLEBRUSH_FLOWER_POSES,
  BOTTLEBRUSH_SHOOT_POINTS,
  BOTTLEBRUSH_STEM_LENGTH,
} from "../components/flowers/bottlebrush/bottlebrushGeometry";
import {
  BOTTLEBRUSH_LEAF,
  BOTTLEBRUSH_LEAF_TILT,
  createBottlebrushLeaf,
  BOTTLEBRUSH_STEM_LEAF_NODES,
  BOTTLEBRUSH_UPPER_LEAF_POSES,
} from "../components/flowers/bottlebrush/bottlebrushLeaf";
import {
  specimenInstanceGeometry,
  updateFloretInstances,
} from "../lib/three/floretInstances";
import { specimenCages } from "../lib/three/specimenModel";
import {
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Matrix4,
  Euler,
  Vector3,
  CatmullRomCurve3,
} from "three";
import { verifySpecimen } from "./specimen-checks";
import { supportedBendWeight } from "../lib/flowers/wind";

verifySpecimen("bottlebrush", BOTTLEBRUSH_MODEL);
verifySpecimen("bottlebrush leaf", {
  clusters: BOTTLEBRUSH_MODEL.clusters,
  surfaces: [BOTTLEBRUSH_LEAF],
  organs: [],
});

test("bottlebrush: the stiff leaf's upper pigment faces upward at each alternate shoot angle", () => {
  const geometry = createBottlebrushLeaf("low"),
    side = geometry.getAttribute("tissueSide"),
    normal = geometry.getAttribute("normal"),
    position = geometry.getAttribute("position"),
    half = position.count / 2,
    upper = side.getX(110) > 0 ? 110 : 110 + half,
    lower = upper < half ? upper + half : upper - half;
  for (const angle of [0, 2.4, 4.8]) {
    const rotation = new Euler(BOTTLEBRUSH_LEAF_TILT, angle, 0.1, "YXZ"),
      n = new Vector3().fromBufferAttribute(normal, upper).applyEuler(rotation),
      p = new Vector3()
        .fromBufferAttribute(position, upper)
        .applyEuler(rotation),
      below = new Vector3()
        .fromBufferAttribute(position, lower)
        .applyEuler(rotation);
    assert.ok(n.y > 0.6, "the upper pigment faces the sky, not the ground");
    assert.ok(p.y > below.y);
  }
  geometry.dispose();
});
for (const group of BOTTLEBRUSH_MODEL.instances!)
  verifySpecimen(`bottlebrush ${group.name}`, {
    clusters: BOTTLEBRUSH_MODEL.clusters,
    surfaces: group.surfaces,
    organs: group.organs,
  });

test("bottlebrush: twenty-four true flowers each keep five tiny petals and twenty-four red stamens with paired dark anthers", () => {
  assert.equal(BOTTLEBRUSH_MODEL.clusters.length, 1);
  assert.equal(
    BOTTLEBRUSH_MODEL.surfaces.filter(
      (s) => s.name === "brush flower contact shell",
    ).length,
    24,
  );
  const flowers = BOTTLEBRUSH_MODEL.instances![0],
    stamens = BOTTLEBRUSH_MODEL.instances![1];
  assert.equal(flowers.poses.length, 24);
  assert.equal(flowers.surfaces.length, 5);
  assert.equal(stamens.poses.length, 576);
  assert.equal(
    stamens.organs.filter((o) => o.name === "red stamen filament").length,
    1,
  );
  assert.equal(
    stamens.organs.filter((o) => o.name === "dark stamen anther chamber")
      .length,
    2,
  );
  assert.equal(
    BOTTLEBRUSH_MODEL.organs.filter(
      (o) => o.name === "sessile flower insertion",
    ).length,
    24,
  );
  const shoot = BOTTLEBRUSH_MODEL.organs.find(
    (o) => o.name === "continuing woody flowering shoot",
  )!;
  assert.ok(shoot.points.at(-1)![1] > 1.9);
});

test("bottlebrush: flowers encircle the cylinder and contact shells attach exactly to their continuing shoot", () => {
  BOTTLEBRUSH_FLOWER_POSES.forEach((pose, i) => {
    assert.ok(
      Math.abs(Math.hypot(pose.position[0], pose.position[2]) - 0.065) < 1e-9,
    );
    const p = BOTTLEBRUSH_MODEL.surfaces[i].sample(0, 0, 1);
    assert.ok(
      Math.hypot(
        p[0] - pose.position[0],
        p[1] - pose.position[1],
        p[2] - pose.position[2],
      ) < 0.03,
    );
    const filamentPoses = BOTTLEBRUSH_MODEL.instances![1].poses.slice(
      i * 24,
      (i + 1) * 24,
    );
    assert.equal(filamentPoses.length, 24);
    assert.ok(
      filamentPoses.every(
        (p) => Math.abs(p.position[1] - pose.position[1]) < 0.034,
      ),
    );
  });
  const desktop = specimenCages(BOTTLEBRUSH_MODEL, false).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  const mobile = specimenCages(BOTTLEBRUSH_MODEL, true).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  assert.equal(desktop, 768);
  assert.equal(mobile, 288);
});

test("bottlebrush: all six leaf attachments stay on their owning shoot during head pitch, contact, and growth", () => {
  assert.equal(
    BOTTLEBRUSH_STEM_LEAF_NODES.length + BOTTLEBRUSH_UPPER_LEAF_POSES.length,
    6,
  );
  const curve = new CatmullRomCurve3(
      BOTTLEBRUSH_SHOOT_POINTS.map((p) => new Vector3(...p)),
    ),
    cluster = BOTTLEBRUSH_MODEL.clusters[0],
    stemCurve = new CatmullRomCurve3([
      new Vector3(0, -BOTTLEBRUSH_STEM_LENGTH, 0),
      new Vector3(0.025, -BOTTLEBRUSH_STEM_LENGTH * 0.55, 0),
      new Vector3(0, 0, 0),
    ]);
  for (const growth of [0.35, 1]) {
    const head = new Matrix4()
        .makeRotationFromEuler(new Euler(0.17, 0, -0.13))
        .setPosition(
          0.12,
          -(1 - growth) * BOTTLEBRUSH_STEM_LENGTH - 0.025,
          -0.08,
        ),
      clusterPose = new Matrix4()
        .makeRotationFromEuler(
          new Euler(
            cluster.rotation[0] + cluster.nod * 0.4,
            cluster.rotation[1],
            cluster.rotation[2] + cluster.nod,
          ),
        )
        .setPosition(...cluster.position),
      shoot = new Matrix4().multiplyMatrices(head, clusterPose),
      roots = [
        ...BOTTLEBRUSH_STEM_LEAF_NODES.filter((n) => n.t > 1).map((n) => {
          const weight = supportedBendWeight(n.t, 0);
          return new Vector3(
            0.025 * Math.sin(n.t * Math.PI) + 0.12 * weight,
            -BOTTLEBRUSH_STEM_LENGTH +
              BOTTLEBRUSH_STEM_LENGTH * n.t * growth -
              0.025 * weight,
            -0.08 * weight,
          );
        }),
        ...BOTTLEBRUSH_UPPER_LEAF_POSES.map((p) =>
          new Vector3(...p.position).applyMatrix4(head),
        ),
      ];
    assert.equal(roots.length, 2);
    for (const root of roots) {
      let nearest = Infinity;
      for (let i = 0; i <= 1000; i++)
        nearest = Math.min(
          nearest,
          curve
            .getPointAt(i / 1000)
            .applyMatrix4(shoot)
            .distanceTo(root),
        );
      assert.ok(
        nearest < 0.008,
        `the upper leaf root separated ${nearest.toFixed(3)} from the continuing shoot at growth ${growth}`,
      );
    }
    for (const node of BOTTLEBRUSH_STEM_LEAF_NODES) {
      const weight = supportedBendWeight(node.t, 0),
        root = new Vector3(
          0.025 * Math.sin(node.t * Math.PI) + 0.12 * weight,
          -BOTTLEBRUSH_STEM_LENGTH +
            BOTTLEBRUSH_STEM_LENGTH * node.t * growth -
            0.025 * weight,
          -0.08 * weight,
        );
      let nearest = Infinity;
      for (let i = 0; i <= 1000; i++) {
        const p = stemCurve.getPointAt(i / 1000),
          t = (p.y + BOTTLEBRUSH_STEM_LENGTH) / BOTTLEBRUSH_STEM_LENGTH,
          w = supportedBendWeight(t, 0);
        p.set(
          p.x + 0.12 * w,
          -BOTTLEBRUSH_STEM_LENGTH +
            (p.y + BOTTLEBRUSH_STEM_LENGTH) * growth -
            0.025 * w,
          p.z - 0.08 * w,
        );
        nearest = Math.min(nearest, p.distanceTo(root));
      }
      assert.ok(
        nearest < 0.008,
        `the lower leaf root separated ${nearest.toFixed(3)} from the anchored stem at growth ${growth}`,
      );
    }
  }
});

test("bottlebrush: low quality retains every filament and chamber with matched folded normals and reverses bloom in place", () => {
  const group = BOTTLEBRUSH_MODEL.instances![1];
  for (const quality of ["overview", "low", "high"] as const) {
    const geometries = specimenInstanceGeometry(group, quality);
    assert.equal(geometries.organs.length, 3);
    for (const geometry of geometries.organs) {
      assert.equal(
        geometry.morphAttributes.position![0].count,
        geometry.getAttribute("position").count,
      );
      for (const normal of [
        geometry.getAttribute("normal"),
        geometry.morphAttributes.normal![0],
      ])
        for (let i = 0; i < normal.count; i++)
          assert.ok(
            Math.abs(
              Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)) - 1,
            ) < 0.002,
          );
    }
    const material = new MeshStandardMaterial(),
      geometry = geometries.organs[0],
      mesh = new InstancedMesh(geometry, material, group.poses.length),
      target = new Mesh(geometry, material),
      scratch = new Object3D(),
      matrix = new Matrix4();
    updateFloretInstances(mesh, target, group.poses, 0, 0, 0, true, scratch);
    const texture = mesh.morphTexture!;
    assert.equal(texture.image.height, 576);
    for (const bloom of [1, 0.5, 0]) {
      updateFloretInstances(
        mesh,
        target,
        group.poses,
        bloom,
        4,
        1,
        true,
        scratch,
      );
      mesh.getMatrixAt(575, matrix);
      assert.ok(matrix.determinant() > 0.49);
      assert.equal(mesh.morphTexture, texture);
    }
    mesh.getMorphAt(575, target);
    assert.equal(target.morphTargetInfluences![0], 1);
    texture.dispose();
    mesh.dispose();
    material.dispose();
    geometries.organs.forEach((g) => g.dispose());
  }
});
