import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const GLADIOLUS_LEAF: SpecimenSurface = {
  name: "keeled equitant sword blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.015,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      x =
        w *
        (0.003 + 0.19 * Math.sin(Math.PI * v) ** 0.32 * (1 - 0.38 * v)) *
        (0.25 + 0.75 * open);
    return [
      x,
      1.95 * v,
      0.12 * v * v +
        0.035 * Math.abs(w) +
        0.035 * Math.exp(-Math.abs(w) * 6) * Math.sin(Math.PI * v) +
        Math.abs(x) * 0.32 * (1 - open),
    ];
  },
};
