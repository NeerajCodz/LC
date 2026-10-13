import test from "node:test";
import assert from "node:assert/strict";
import { Box3, Matrix4, Object3D, PerspectiveCamera, Vector3 } from "three";
import { bottlebrushStructure } from "../components/flowers/bottlebrush/Bottlebrush";
import { BOTTLEBRUSH_MODEL } from "../components/flowers/bottlebrush/bottlebrushGeometry";
import {
  BOTTLEBRUSH_UPPER_LEAF_POSES,
  createBottlebrushLeaf,
} from "../components/flowers/bottlebrush/bottlebrushLeaf";
import {
  specimenGeometry,
  specimenOrganGeometry,
} from "../lib/three/specimenModel";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import type { FlowerStructure, Vec3 } from "../lib/flowers/types";

test("public bottlebrush portraits contain the real flowers, continuing shoot, upper leaves and root", async () => {
  const framing = await import("../lib/flowers/framing");
  const fit = (
    framing as typeof framing & {
      flowerPortraitPose?: (
        s: FlowerStructure,
        root: Vec3,
        aspect: number,
        fov: number,
        angle: number,
        desktop: boolean,
      ) => { position: Vec3; target: Vec3 } | undefined;
    }
  ).flowerPortraitPose;
  assert.equal(
    typeof fit,
    "function",
    "public portrait bounds fitting is missing",
  );
  const bounds = new Box3(),
    dummy = new Object3D();
  const include = (
    geometry: ReturnType<typeof specimenGeometry>,
    pose = new Matrix4(),
  ) => {
    geometry.computeBoundingBox();
    bounds.union(geometry.boundingBox!.clone().applyMatrix4(pose));
    geometry.dispose();
  };
  BOTTLEBRUSH_MODEL.surfaces.forEach((s) =>
    include(specimenGeometry(s, "high")),
  );
  BOTTLEBRUSH_MODEL.organs.forEach((o) =>
    include(specimenOrganGeometry(o, "high")),
  );
  for (const group of BOTTLEBRUSH_MODEL.instances ?? []) {
    const parts = specimenInstanceGeometry(group, "high");
    for (const geometry of [...parts.surfaces, ...parts.organs]) {
      geometry.computeBoundingBox();
      for (const pose of group.poses) {
        dummy.position.set(...pose.position);
        dummy.rotation.set(...pose.rotation);
        dummy.scale.setScalar(pose.scale);
        dummy.updateMatrix();
        bounds.union(geometry.boundingBox!.clone().applyMatrix4(dummy.matrix));
      }
      geometry.dispose();
    }
  }
  for (const pose of BOTTLEBRUSH_UPPER_LEAF_POSES) {
    dummy.position.set(...pose.position);
    dummy.rotation.set(...pose.rotation);
    dummy.scale.setScalar(pose.scale);
    dummy.updateMatrix();
    include(createBottlebrushLeaf("high"), dummy.matrix);
  }
  bounds.expandByPoint(new Vector3(0, -bottlebrushStructure.stemLength, 0));
  assert.ok(
    bottlebrushStructure.portraitBounds,
    "the tall specimen needs explicit portrait bounds",
  );
  const declared = new Box3(
    new Vector3(...bottlebrushStructure.portraitBounds.min),
    new Vector3(...bottlebrushStructure.portraitBounds.max),
  );
  assert.ok(
    declared.containsBox(bounds),
    "framing bounds exclude real anatomy",
  );
  bounds.translate(new Vector3(0, bottlebrushStructure.stemLength - 1.78, 0));
  for (const [width, height] of [
    [1280, 800],
    [390, 844],
    [844, 390],
  ])
    for (const angle of [0, Math.PI / 4, Math.PI / 2]) {
      const pose = fit!(
        bottlebrushStructure,
        [0, -1.78, 0],
        width / height,
        38,
        angle,
        width >= 700,
      );
      assert.ok(pose);
      const camera = new PerspectiveCamera(38, width / height, 0.1, 45);
      camera.position.set(...pose.position);
      camera.lookAt(...pose.target);
      camera.updateMatrixWorld();
      for (let i = 0; i < 8; i++) {
        const point = new Vector3(
          i & 1 ? bounds.max.x : bounds.min.x,
          i & 2 ? bounds.max.y : bounds.min.y,
          i & 4 ? bounds.max.z : bounds.min.z,
        ).project(camera);
        assert.ok(
          Math.abs(point.x) < 0.79 && Math.abs(point.y) < 0.79,
          `portrait clips at ${width}x${height}: ${point.toArray()}`,
        );
      }
    }
});
