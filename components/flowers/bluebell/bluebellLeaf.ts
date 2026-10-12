import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenSurface } from "@/lib/three/specimenModel";

export const BLUEBELL_LEAF: SpecimenSurface = {
  name: "drooping basal bluebell strap",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.016,
  sample: (u, v, open): Vec3 => {
    const w = 2 * u - 1,
      width = 0.007 + 0.105 * Math.sin(Math.PI * v) ** 0.42,
      x = w * width * (0.38 + 0.62 * open);
    return [
      x,
      1.58 * v - 0.27 * v ** 4,
      0.44 * v ** 2 +
        0.042 * w * w +
        0.004 * Math.cos(w * 19) * Math.sin(Math.PI * v),
    ];
  },
};
export const BLUEBELL_LEAF_POSES = Array.from({ length: 5 }, (_, i) => ({
  position: [(i - 2) * 0.022, 0, (i % 2) * 0.025] as Vec3,
  rotation: [-0.12, i * 1.42, (i - 2) * 0.12] as Vec3,
  scale: 0.9 + (i % 3) * 0.08,
}));
