import type { Quality } from "@/lib/flowers/types";
import {
  specimenGeometry,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";
export const GAZANIA_LEAF_TILT = -1.08;
/** One continuous, leathery pinnatifid blade; the midrib remains green below. */
export const GAZANIA_LEAF: SpecimenSurface = {
  name: "pinnatifid white-backed gazania blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.012,
  overviewRows: 32,
  minimumRows: 32,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      terminal = Math.max(0, Math.min(1, (v - 0.7) / 0.1));
    const notch =
      1 - 0.72 * (0.5 + 0.5 * Math.cos(v * Math.PI * 6)) ** 6 * (1 - terminal);
    const width = 0.004 + 0.21 * Math.sin(v * Math.PI) ** 0.75 * notch;
    return [
      w * width * (0.25 + 0.75 * open),
      1.32 * v,
      0.085 * v * v -
        0.065 * Math.abs(w) ** 6 * Math.sin(v * Math.PI) +
        0.008 * Math.exp(-Math.abs(w) * 24) * Math.sin(v * Math.PI) +
        Math.abs(w) * width * 0.45 * (1 - open),
    ];
  },
};
export function createGazaniaLeaf(quality: Quality) {
  return specimenGeometry(GAZANIA_LEAF, quality);
}
