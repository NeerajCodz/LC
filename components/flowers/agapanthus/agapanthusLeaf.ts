import type { Quality, Vec3 } from "@/lib/flowers/types";
import {
  specimenGeometry,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";

export const AGAPANTHUS_LEAF_TILT = 0.02;

export const AGAPANTHUS_LEAF: SpecimenSurface = {
  name: "arching entire agapanthus strap blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.019,
  sample: (u, v, open) => {
    const across = 2 * u - 1,
      x =
        across *
        (0.005 + 0.094 * Math.sin(v * Math.PI) ** 0.43) *
        (0.36 + 0.64 * open),
      y = 1.36 * Math.sin(v * 1.94),
      z =
        0.98 * v * v +
        0.045 * across * across +
        Math.abs(x) * 0.32 * (1 - open);
    return [x, y, z];
  },
};
export const AGAPANTHUS_LEAF_POSES = Array.from({ length: 8 }, (_, i) => ({
  position: [
    Math.sin(i * 2.399963) * 0.04,
    0,
    Math.cos(i * 2.399963) * 0.04,
  ] as Vec3,
  rotation: [0.025 * (i % 3), i * 2.399963, (i % 2 ? 1 : -1) * 0.06] as Vec3,
  scale: 0.82 + (i % 4) * 0.065,
}));

/** Label the arch's exposed upper side without reflecting its bow or basal pose. */
export function createAgapanthusLeafGeometry(quality: Quality) {
  const geometry = specimenGeometry(AGAPANTHUS_LEAF, quality),
    side = geometry.getAttribute("tissueSide");
  for (let i = 0; i < side.count; i++) side.setX(i, -side.getX(i));
  return geometry;
}
