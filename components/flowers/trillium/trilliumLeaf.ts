import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const TRILLIUM_STEM_LENGTH = 1.4;
export const TRILLIUM_LEAF_TILT = 1.8;
export const TRILLIUM_FOLIAGE_NODES = Array.from({ length: 3 }, (_, i) => ({
  t: 0.88,
  angle: (i * Math.PI * 2) / 3,
  scale: 1,
}));
/** Broad, sessile terminal bract with a continuous blade and three relief veins. */
export const TRILLIUM_LEAF: SpecimenSurface = {
  name: "broad three-veined trillium bract",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.012,
  overviewColumns: 6,
  overviewRows: 8,
  sample: (u, v, open): Vec3 => {
    const w = 2 * u - 1,
      envelope = Math.sin(Math.PI * v),
      x = w * (0.004 + 0.51 * envelope ** 0.68) * (0.3 + 0.7 * open),
      veins = [-0.5, 0, 0.5].reduce(
        (n, c) => n + Math.exp(-(((w - c) / 0.11) ** 2)),
        0,
      );
    return [
      x,
      1.45 * v,
      0.035 * w * w * envelope + 0.025 * v * v + 0.004 * veins * envelope,
    ];
  },
};
