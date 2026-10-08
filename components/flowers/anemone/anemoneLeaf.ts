import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Vec3 } from "@/lib/flowers/types";
export const ANEMONE_LEAF = leafBlade("dissected anemone leaflet", 0.72, 0.22, {
  teeth: 5,
  depth: 0.7,
  cup: 0.065,
  wrinkle: 0.008,
  thickness: 0.009,
});
export const ANEMONE_LEAF_POSES = [-0.9, 0, 0.9].map((angle, i) => ({
  position: [0, 0.14, 0] as Vec3,
  rotation: [0, 0, angle] as Vec3,
  scale: i === 1 ? 1 : 0.85,
}));
