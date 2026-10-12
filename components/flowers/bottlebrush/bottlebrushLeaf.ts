import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { CatmullRomCurve3, Euler, Quaternion, Vector3 } from "three";
import { BOTTLEBRUSH_SHOOT_POINTS } from "./bottlebrushGeometry";

export const BOTTLEBRUSH_LEAF_TILT = 0.69;
export const BOTTLEBRUSH_STEM_LEAF_NODES = [0.3, 0.46, 0.64, 0.79].map(
  (t, i) => ({ t, angle: i * 2.3999632297, scale: 0.87 }),
);
const shoot = new CatmullRomCurve3(
  BOTTLEBRUSH_SHOOT_POINTS.map((p) => new Vector3(...p)),
);
/** These roots use the head-owned shoot's exact centerline and inherit its pose. */
export const BOTTLEBRUSH_UPPER_LEAF_POSES = [0.91, 0.98].map((t, i) => {
  const root = shoot.getPointAt(t),
    quaternion = new Quaternion().setFromEuler(
      new Euler(BOTTLEBRUSH_LEAF_TILT, (i + 4) * 2.3999632297, 0.1, "YXZ"),
    ),
    rotation = new Euler().setFromQuaternion(quaternion);
  return {
    position: [root.x, root.y, root.z] as Vec3,
    rotation: [rotation.x, rotation.y, rotation.z] as Vec3,
    scale: 0.61,
  };
});
export function createBottlebrushLeaf(quality: Quality) {
  const geometry = specimenGeometry(BOTTLEBRUSH_LEAF, quality),
    side = geometry.getAttribute("tissueSide");
  // Preserve the stiff blade's insertion and curvature while labeling its upper face.
  for (let i = 0; i < side.count; i++) side.setX(i, -side.getX(i));
  return geometry;
}
/** Stiff, narrow-elliptic blade with a short, pungent tip. */
export const BOTTLEBRUSH_LEAF = leafBlade(
  "narrow stiff bottlebrush blade",
  0.79,
  0.07,
  {
    thickness: 0.017,
    cup: 0.014,
    twist: 0.045,
  },
);
