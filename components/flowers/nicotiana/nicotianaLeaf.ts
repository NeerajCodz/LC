import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const NICOTIANA_LEAF: SpecimenSurface = {
  name: "undulating decurrent nicotiana blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.012,
  overviewRows: 16,
  sample: (u, v, o): Vec3 => {
    const w = 2 * u - 1,
      width =
        0.028 * (1 - v) +
        0.29 * Math.sin(Math.PI * v) ** 0.72 * (1 + 0.035 * Math.sin(v * 28)),
      x = w * width * (0.3 + 0.7 * o);
    return [
      x,
      0.94 * v,
      0.045 * w * w + 0.035 * v * v + 0.004 * Math.sin(v * 32) * (1 - w * w),
    ];
  },
};
export const NICOTIANA_DECURRENT_WINGS: SpecimenSurface[] = [-1, 1].map(
  (side) => ({
    name: "nicotiana decurrent stem wing",
    cluster: 0,
    role: "bract",
    tissue: "leaf",
    thickness: 0.007,
    overviewColumns: 4,
    overviewRows: 8,
    sample: (u: number, v: number): Vec3 => [
      side * (0.025 + u * (0.006 + 0.025 * Math.sin(Math.PI * v) ** 2)),
      -0.25 + 0.32 * v,
      0.006 * Math.sin(Math.PI * v) * (2 * u - 1),
    ],
  }),
);
export const NICOTIANA_FOLIAGE_NODES = [0.12, 0.29, 0.48, 0.67, 0.84].map(
  (t, i) => ({ t, angle: i * 2.399963229728653, scale: 1.17 - i * 0.14 }),
);
export const NICOTIANA_LEAF_TILT = 1.1;
