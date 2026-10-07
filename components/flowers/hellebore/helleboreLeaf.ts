import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Vec3 } from "@/lib/flowers/types";
export const HELLEBORE_LEAFLET = leafBlade(
  "leathery serrate hellebore leaflet",
  0.72,
  0.18,
  { teeth: 17, depth: 0.055, thickness: 0.012, cup: 0.055 },
);
export const HELLEBORE_LEAF_POSES = Array.from({ length: 7 }, (_, i) => ({
  position: [0, 0.14, 0] as Vec3,
  rotation: [0, 0, (i - 3) * 0.49] as Vec3,
  scale: 1 - Math.abs(i - 3) * 0.08,
}));
