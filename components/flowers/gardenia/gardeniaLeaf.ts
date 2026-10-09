import { leafBlade } from "@/lib/three/botanicalBlades";
import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const GARDENIA_LEAF = leafBlade(
  "glossy opposite gardenia leaf",
  0.85,
  0.3,
  { cup: 0.06, thickness: 0.02 },
);
export const GARDENIA_STIPULE: SpecimenSurface = {
  name: "pointed interpetiolar stipule",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.006,
  sample: (u, v, stage) => [
    (2 * u - 1) * (0.003 + 0.05 * (1 - v)) * (0.5 + 0.5 * stage),
    0.14 * v,
    0.012 * (2 * u - 1) ** 2,
  ],
};
