import type { Quality } from "@/lib/flowers/types";
import { leafBlade } from "@/lib/three/botanicalBlades";
import { specimenGeometry } from "@/lib/three/specimenModel";
export const FRITILLARIA_LEAF_TILT = -0.94;
export const FRITILLARIA_LEAF = leafBlade(
  "glossy undulate crown imperial leaf",
  0.78,
  0.12,
  {
    thickness: 0.013,
    cup: 0.029,
    twist: 0.025,
    teeth: 5,
    depth: 0.035,
  },
);
export const FRITILLARIA_FOLIAGE_NODES = [0.14, 0.25, 0.36].flatMap(
  (t, whorl) =>
    Array.from({ length: 6 }, (_, i) => ({
      t,
      angle: (i * Math.PI) / 3 + whorl * 0.12,
      scale: 1 - whorl * 0.07,
    })),
);
export function createFritillariaLeaf(quality: Quality) {
  return specimenGeometry(FRITILLARIA_LEAF, quality);
}
