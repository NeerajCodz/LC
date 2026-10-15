import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Vec3 } from "@/lib/flowers/types";

/** Broad, entire, leathery and almost sessile; the face turn preserves upper green tissue. */
export const IXORA_LEAF = leafBlade("entire leathery ixora blade", 0.96, 0.31, {
  cup: 0.043,
  twist: 0.065,
  thickness: 0.016,
});
export const IXORA_LEAF_FACE_ROTATION: Vec3 = [0, Math.PI, 0];
export const IXORA_LEAF_TILT = 0.82;
