import type { Quality } from "@/lib/flowers/types";
import { createPalmateBlade } from "@/lib/three/botanicalBlades";
/** Delphinium's five deep divisions belong to one continuous simple leaf. */
export function createDelphiniumLeaf(quality: Quality) {
  return createPalmateBlade(quality, 5);
}
