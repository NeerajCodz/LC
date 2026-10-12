import type { Quality } from "@/lib/flowers/types";
import {
  specimenGeometry,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";

export const CANNA_LEAF_TILT = 0.67;

export const CANNA_LEAF: SpecimenSurface = {
  name: "continuous ovate-oblong canna blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.021,
  sample: (u, v, open) => {
    const across = 2 * u - 1,
      x =
        across *
        (0.006 + 0.39 * Math.sin(v * Math.PI) ** 0.69) *
        (0.3 + 0.7 * open),
      ribs =
        0.0025 *
        Math.sin((v - Math.abs(across) * 0.31) * 70) *
        Math.sin(v * Math.PI),
      z = 0.065 * across * across + 0.17 * v * v + ribs;
    return [x, 0.23 + 1.66 * v, z + Math.abs(x) * 0.46 * (1 - open)];
  },
};
export const CANNA_SHEATH: SpecimenSurface = {
  name: "wrapping canna leaf sheath",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.018,
  sample: (u, v) => {
    const a = (u - 0.5) * 5.3,
      r = 0.072 - 0.006 * v;
    return [Math.sin(a) * r, 0.26 * v, Math.cos(a) * r];
  },
};

export const CANNA_BASAL_NECK: SpecimenSurface = {
  name: "continuous canna basal leaf neck",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.02,
  sample: (u, v, stage) => {
    const base = CANNA_LEAF.sample(u, 0, stage);
    if (v === 1) return base;
    const across = 2 * u - 1,
      x =
        across * (0.006 + 0.012 * Math.sin(v * Math.PI)) * (0.3 + 0.7 * stage);
    return [x, base[1] * v, base[2] * v - 0.035 * Math.sin(v * Math.PI)];
  },
};

export function createCannaLeafNeckGeometry(quality: Quality) {
  const geometry = specimenGeometry(CANNA_BASAL_NECK, quality),
    side = geometry.getAttribute("tissueSide");
  for (let i = 0; i < side.count; i++) side.setX(i, -side.getX(i));
  return geometry;
}

/** The authored pitched blade's adaxial tissue is its negative shell side. */
export function createCannaLeafGeometry(quality: Quality) {
  const geometry = specimenGeometry(CANNA_LEAF, quality),
    side = geometry.getAttribute("tissueSide");
  for (let i = 0; i < side.count; i++) side.setX(i, -side.getX(i));
  return geometry;
}
