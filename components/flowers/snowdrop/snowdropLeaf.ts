import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const SNOWDROP_LEAF: SpecimenSurface = {
  name: "blue-green linear snowdrop blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.012,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      x =
        w *
        (0.004 + 0.062 * Math.sin(Math.PI * v) ** 0.18) *
        (0.25 + 0.75 * open);
    return [
      x,
      1.22 * v,
      0.075 * v * v + 0.018 * w * w + Math.abs(x) * 0.3 * (1 - open),
    ];
  },
};
