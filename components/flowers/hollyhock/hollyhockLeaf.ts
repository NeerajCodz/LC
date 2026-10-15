import type { Quality } from "@/lib/flowers/types";
import {
  specimenGeometry,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";
export const HOLLYHOCK_LEAF: SpecimenSurface = {
  name: "continuous shallowly lobed hollyhock leaf",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.011,
  overviewColumns: 12,
  overviewRows: 16,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      a = Math.atan2(w * 0.53, v - 0.5),
      lobes = 1 - 0.16 * (0.5 + 0.5 * Math.cos(a * 7)) ** 2,
      teeth = 1 - 0.025 * (0.5 + 0.5 * Math.cos(a * 48)) ** 3,
      width = 0.005 + 0.55 * Math.sin(Math.PI * v) ** 0.64 * lobes * teeth;
    return [
      w * width * (0.35 + 0.65 * open),
      1.05 * v,
      0.054 * w * w +
        0.035 * Math.sin(Math.PI * v) +
        0.009 * Math.sin(a * 7) * Math.abs(w),
    ];
  },
};
export function createHollyhockLeaf(quality: Quality) {
  return specimenGeometry(HOLLYHOCK_LEAF, quality);
}
