import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const ZINNIA_LEAF: SpecimenSurface = {
  name: "rough sessile clasping zinnia blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.014,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      x =
        w *
        (0.048 * (1 - v) ** 4 + 0.35 * Math.sin(Math.PI * v) ** 0.72) *
        (0.35 + 0.65 * open),
      base = 0.048 * Math.abs(w) ** 0.8 * Math.exp(-(((v - 0.05) / 0.09) ** 2));
    return [
      x,
      0.84 * v - base,
      0.11 * v * v +
        0.065 * w * w * Math.sin(Math.PI * v) +
        0.012 * (1 - w * w) * (1 - v) ** 5 +
        0.005 * Math.sin(v * 57 + Math.abs(w) * 17) * Math.sin(Math.PI * v) +
        Math.abs(x) * 0.35 * (1 - open),
    ];
  },
};
