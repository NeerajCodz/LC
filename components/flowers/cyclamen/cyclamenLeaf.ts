import type { SpecimenSurface } from "@/lib/three/specimenModel";
/** Continuous cordate blade with fleshy thickness; pigmentation is independent. */
export const CYCLAMEN_LEAF: SpecimenSurface = {
  name: "cordate fleshy cyclamen leaf",
  cluster: 0,
  role: "bract",
  thickness: 0.016,
  sample: (u, v, open) => {
    const w = u * 2 - 1,
      width = 0.008 + 0.48 * Math.sin(v * Math.PI) ** 0.72;
    return [
      w * width,
      0.93 * v -
        0.18 * Math.abs(w) ** 1.8 * Math.exp(-(((v - 0.17) / 0.17) ** 2)),
      (0.055 * w * w + 0.11 * v * v) * (0.3 + 0.7 * open),
    ];
  },
};
