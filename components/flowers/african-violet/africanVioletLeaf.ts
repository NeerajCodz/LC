import type { Quality } from "@/lib/flowers/types";
import { leafBlade } from "@/lib/three/botanicalBlades";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { createPubescence } from "@/lib/three/pubescence";
export const AFRICAN_VIOLET_LEAF = leafBlade(
  "scalloped succulent african violet blade",
  0.65,
  0.31,
  { teeth: 10, depth: 0.065, cup: 0.085, wrinkle: 0.003, thickness: 0.023 },
);
export function createAfricanVioletHairs(quality: Quality) {
  const surface = specimenGeometry(AFRICAN_VIOLET_LEAF, quality);
  const hairs = createPubescence(surface, quality, 0.017, 2719);
  surface.dispose();
  return hairs;
}
