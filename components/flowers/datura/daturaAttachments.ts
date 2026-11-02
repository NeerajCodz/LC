import type { Vector3 } from "three";
import { bendWeight, bendSlope, type PlantMotion } from "@/lib/flowers/wind";
import { DATURA_STEM_LENGTH } from "./daturaLeaf";
/** Caller-owned scratch vectors; lateral fork growth matches the rendered leaf-node offset. */
export function writeDaturaBranchVertex(
  position: Vector3,
  normal: Vector3,
  growth: number,
  motion: Pick<PlantMotion, "x" | "z" | "drop">,
) {
  const g = Math.max(0.03, growth),
    t = Math.max(
      0,
      Math.min(1, (position.y + DATURA_STEM_LENGTH) / DATURA_STEM_LENGTH),
    ),
    w = bendWeight(t),
    s = bendSlope(t) / DATURA_STEM_LENGTH,
    axis = 0.025 * Math.sin(t * Math.PI),
    a =
      ((0.025 * Math.PI) / DATURA_STEM_LENGTH) *
        Math.cos(t * Math.PI) *
        (1 - g) +
      motion.x * s,
    b = motion.z * s,
    d = Math.max(0.02, g - motion.drop * s),
    nx = normal.x / g,
    nz = normal.z / g;
  position.set(
    axis + (position.x - axis) * g + motion.x * w,
    -DATURA_STEM_LENGTH +
      (position.y + DATURA_STEM_LENGTH) * g -
      motion.drop * w,
    position.z * g + motion.z * w,
  );
  normal.set(nx, (normal.y - a * nx - b * nz) / d, nz).normalize();
}
