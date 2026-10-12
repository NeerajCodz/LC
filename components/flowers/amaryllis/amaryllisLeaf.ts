import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenSurface } from "@/lib/three/specimenModel";
import { Euler } from "three";

export const AMARYLLIS_LEAF: SpecimenSurface = {
  name: "long basal amaryllis strap",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.028,
  sample: (u, v, open): Vec3 => {
    // Keep the physical arch while assigning the inner upper face to front tissue.
    const w = 1 - 2 * u,
      x =
        w *
        (0.018 + 0.165 * Math.sin(Math.PI * v) ** 0.3) *
        (0.48 + 0.52 * open);
    return [
      x,
      2.35 * v - 0.18 * v ** 4,
      0.44 * v ** 3 +
        0.052 * w * w +
        0.007 * Math.cos(w * 22) * Math.sin(Math.PI * v),
    ];
  },
};
export const AMARYLLIS_LEAF_POSES = Array.from({ length: 6 }, (_, i) => {
  const orientation = new Euler(
    0.14,
    i % 2 ? 0.38 : Math.PI + 0.38,
    (i - 2.5) * 0.15,
    "YXZ",
  ).reorder("XYZ");
  return {
    position: [(i - 2.5) * 0.028, 0, (i % 2 ? 1 : -1) * 0.024] as Vec3,
    rotation: [orientation.x, orientation.y, orientation.z] as Vec3,
    scale: 0.87 + (i % 3) * 0.065,
  };
});
