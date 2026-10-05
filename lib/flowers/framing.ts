import type { FlowerStructure, Vec3 } from "./types";
/** Shared portrait, garden and inspection macro target from anatomical coordinates. */
export function flowerHeadTarget(
  structure: FlowerStructure,
  root: Vec3,
  scale = 1,
): Vec3 {
  const center = structure.headCenter ?? [0, 0, 0],
    c = Math.cos(structure.headTilt),
    s = Math.sin(structure.headTilt);
  return [
    root[0] + center[0] * scale,
    root[1] + (structure.stemLength + center[1] * c - center[2] * s) * scale,
    root[2] + (center[1] * s + center[2] * c) * scale,
  ];
}
