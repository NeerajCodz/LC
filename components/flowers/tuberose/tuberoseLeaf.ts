import type { Quality } from "@/lib/flowers/types";
import { leafBlade } from "@/lib/three/botanicalBlades";
import { specimenGeometry } from "@/lib/three/specimenModel";
export const TUBEROSE_LEAF_TILT = -0.25;
export const TUBEROSE_LEAF = leafBlade(
  "smooth succulent tuberose strap leaf",
  1.52,
  0.038,
  {
    thickness: 0.014,
    cup: 0.048,
    twist: 0.035,
  },
);
export const TUBEROSE_FOLIAGE_NODES = Array.from({ length: 5 }, (_, i) => ({
  t: 0.035 + (i % 2) * 0.014,
  angle: i * 2.399963229728653,
  scale: 0.89 + (i % 3) * 0.08,
}));
export function createTuberoseLeaf(quality: Quality) {
  return specimenGeometry(TUBEROSE_LEAF, quality);
}
