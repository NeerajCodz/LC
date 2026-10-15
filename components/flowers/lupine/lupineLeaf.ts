import type { Quality, Vec3 } from "@/lib/flowers/types";
import { leafBlade } from "@/lib/three/botanicalBlades";
import { specimenGeometry } from "@/lib/three/specimenModel";
export const LUPINE_LEAF_TILT = -1.08;
export const LUPINE_LEAFLET = leafBlade(
  "narrow acute lupine leaflet",
  0.64,
  0.081,
  { thickness: 0.009, cup: 0.029, twist: 0.025 },
);
/** All eleven blades radiate from one shared palmate junction. */
export const LUPINE_LEAF_POSES = Array.from({ length: 11 }, (_, i) => ({
  position: [0, 0.46, 0] as Vec3,
  rotation: [
    0.016 * Math.sin(i * 1.7),
    0.018 * Math.cos(i * 1.3),
    (i * Math.PI * 2) / 11,
  ] as Vec3,
  scale: 0.9 + 0.08 * Math.sin(i * 0.8),
}));
export function createLupineLeaflet(quality: Quality) {
  return specimenGeometry(LUPINE_LEAFLET, quality);
}
