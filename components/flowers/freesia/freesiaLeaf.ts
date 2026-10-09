import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Vec3 } from "@/lib/flowers/types";
export const FREESIA_LEAF = leafBlade(
  "stiff sword-shaped freesia blade",
  1.42,
  0.075,
  { cup: 0.032, thickness: 0.013 },
);
export const FREESIA_LEAF_POSES = Array.from({ length: 5 }, (_, i) => ({
  position: [(i - 2) * 0.017, 0, 0] as Vec3,
  rotation: [0, 0, (i - 2) * 0.24] as Vec3,
  scale: 1 - Math.abs(i - 2) * 0.07,
}));
