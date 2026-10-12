import test from "node:test";
import assert from "node:assert/strict";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import type { FlowerStructure, Vec3 } from "../lib/flowers/types";
import * as framing from "../lib/flowers/framing";

test("fitted portraits keep complete anatomy before fog and the far plane at tall aspects and maximum orbit distance", () => {
  const visibility = (
    framing as typeof framing & {
      flowerPortraitVisibility?: (
        structure: FlowerStructure,
        pose: { position: Vec3; target: Vec3 },
        root: Vec3,
      ) => {
        maxDistance: number;
        fogNear: number;
        fogFar: number;
        cameraFar: number;
      };
    }
  ).flowerPortraitVisibility;
  assert.equal(
    typeof visibility,
    "function",
    "responsive portrait visibility limits are missing",
  );
  for (const [slug, structure] of Object.entries(FLOWER_STRUCTURES)) {
    if (!structure.portraitBounds) continue;
    for (const [width, height] of [
      [1280, 800],
      [390, 844],
      [320, 1000],
      [700, 2000],
      [320, 1600],
      [320, 4000],
    ]) {
      for (const angle of [0, Math.PI / 4, Math.PI / 2]) {
        const root: Vec3 = [0, -1.78, 0];
        const pose = framing.flowerPortraitPose(
          structure,
          root,
          width / height,
          38,
          angle,
          width >= 700,
        )!;
        const limits = visibility!(structure, pose, root);
        const fittedDistance = Math.hypot(
          ...pose.position.map((v, i) => v - pose.target[i]),
        );
        assert.ok(limits.maxDistance >= fittedDistance * 1.8);
        for (let corner = 0; corner < 8; corner++) {
          const radius = Math.hypot(
            ...root.map(
              (v, i) =>
                v +
                (i === 1 ? structure.stemLength : 0) +
                (corner & (1 << i)
                  ? structure.portraitBounds!.max[i]
                  : structure.portraitBounds!.min[i]) -
                pose.target[i],
            ),
          );
          // For any permitted manual orbit, the farthest point is bounded by distance + radius.
          const farthestDepth = limits.maxDistance + radius;
          assert.ok(
            farthestDepth < limits.fogNear,
            `${slug} ${width}x${height}: anatomy fades into fog`,
          );
          assert.ok(
            farthestDepth < limits.cameraFar,
            `${slug} ${width}x${height}: anatomy clips at far plane`,
          );
        }
        assert.ok(limits.fogFar > limits.fogNear);
        assert.ok(limits.cameraFar > limits.fogFar);
      }
    }
  }
});
