import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const BEGONIA_LEAF: SpecimenSurface = {
  name: "asymmetric serrated begonia leaf",
  cluster: 0,
  role: "bract",
  thickness: 0.011,
  sample: (u, v, open) => {
    const w = u * 2 - 1,
      width =
        (0.008 + 0.62 * Math.sin(Math.PI * v) ** 0.7) *
        (1 + 0.36 * w) *
        (1 + 0.021 * Math.sin(v * Math.PI * 38));
    return [
      w * width + 0.12 * v,
      1.16 * v -
        0.23 * Math.abs(w) ** 1.8 * Math.exp(-(((v - 0.16) / 0.16) ** 2)),
      (0.11 * v * v + 0.08 * w * w) * (0.4 + 0.6 * open),
    ];
  },
};
