import type { Quality, Vec3 } from "@/lib/flowers/types";
import { leafBlade } from "@/lib/three/botanicalBlades";
import { specimenGeometry } from "@/lib/three/specimenModel";

export const WISTERIA_LEAF_TILT = 1.01;
export function createWisteriaLeaflet(quality: Quality) {
  const geometry = specimenGeometry(WISTERIA_LEAFLET, quality),
    side = geometry.getAttribute("tissueSide");
  // This shoot pitch places local -Z above +Z; retain the authored arch and petiolule.
  for (let i = 0; i < side.count; i++) side.setX(i, -side.getX(i));
  return geometry;
}

export const WISTERIA_LEAFLET = leafBlade(
  "acuminate wisteria leaflet",
  0.39,
  0.095,
  {
    thickness: 0.01,
    cup: 0.035,
    twist: 0.07,
  },
);
/** Five opposite pairs and a terminal leaflet; this is a pinnate compound leaf. */
export const WISTERIA_LEAF_POSES = [
  ...Array.from({ length: 5 }, (_, i) =>
    [-1, 1].map((side) => ({
      position: [side * 0.008, 0.14 + i * 0.13, 0.003 * i] as Vec3,
      rotation: [0.05 * side, 0.08 * side, -side * (0.97 - i * 0.075)] as Vec3,
      scale: 0.86 + 0.13 * Math.sin(((i + 1) / 6) * Math.PI),
    })),
  ).flat(),
  {
    position: [0, 0.78, 0.018] as Vec3,
    rotation: [0.02, 0, 0] as Vec3,
    scale: 0.91,
  },
];
