import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const GERBERA_LEAF: SpecimenSurface = {
  name: "runcinate pinnatifid gerbera blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.013,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      terminal = Math.max(0, Math.min(1, (v - 0.76) / 0.13)),
      cut =
        1 -
        0.67 * (0.5 + 0.5 * Math.cos(v * Math.PI * 10)) ** 3 * (1 - terminal),
      x =
        w *
        (0.004 + 0.43 * Math.sin(Math.PI * v) ** 0.66 * cut) *
        (0.25 + 0.75 * open);
    return [
      x,
      1.42 * v,
      0.12 * v * v +
        0.085 * w * w * Math.sin(Math.PI * v) +
        0.008 * Math.sin(v * 57 + Math.abs(w) * 7) * Math.sin(Math.PI * v) +
        Math.abs(x) * 0.4 * (1 - open),
    ];
  },
};
