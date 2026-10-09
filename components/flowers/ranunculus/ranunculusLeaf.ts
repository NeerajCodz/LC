import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Vec3 } from "@/lib/flowers/types";
export const RANUNCULUS_LEAFLET = leafBlade(
  "deeply dissected ranunculus leaflet",
  0.65,
  0.25,
  { teeth: 4, depth: 0.75, cup: 0.07, wrinkle: 0.006, thickness: 0.009 },
);
export const RANUNCULUS_LEAF_POSES = [-1.03, 0, 1.03].map((angle, i) => ({
  position: [0, 0.14, 0] as Vec3,
  rotation: [0, 0, angle] as Vec3,
  scale: i === 1 ? 1 : 0.85,
}));
