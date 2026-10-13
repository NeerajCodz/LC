import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";

export const SCABIOSA_LEAF_TILT = 0.86;
export const SCABIOSA_BASAL_LEAF_POSES = [-1, 1].map((side) => ({
  position: [side * 0.012, 0, 0] as Vec3,
  rotation: [1.1, 0, side * 0.8] as Vec3,
  scale: 0.94,
}));
export function createScabiosaUpperLeaf(quality: Quality) {
  const geometry = specimenGeometry(SCABIOSA_UPPER_LEAF, quality),
    side = geometry.getAttribute("tissueSide");
  for (let i = 0; i < side.count; i++) side.setX(i, -side.getX(i));
  return geometry;
}
export function createScabiosaBasalLeaf(quality: Quality) {
  const geometry = specimenGeometry(SCABIOSA_BASAL_LEAF, quality),
    side = geometry.getAttribute("tissueSide");
  // Both the opposite shoot leaves and the spreading basal blades face local -Z upward.
  for (let i = 0; i < side.count; i++) side.setX(i, -side.getX(i));
  return geometry;
}

/** Continuous pinnatifid upper leaf; deep cuts retain a narrow connected midrib. */
export const SCABIOSA_UPPER_LEAF = leafBlade(
  "deeply divided opposite scabiosa leaf",
  0.84,
  0.19,
  {
    teeth: 5,
    depth: 0.86,
    thickness: 0.009,
    cup: 0.035,
  },
);
export const SCABIOSA_BASAL_LEAF = leafBlade(
  "wider toothed basal scabiosa blade",
  0.68,
  0.17,
  {
    teeth: 8,
    depth: 0.16,
    thickness: 0.011,
    cup: 0.04,
  },
);
