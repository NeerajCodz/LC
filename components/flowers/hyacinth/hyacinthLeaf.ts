import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenSurface } from "@/lib/three/specimenModel";
import { Euler } from "three";

export const HYACINTH_LEAF: SpecimenSurface = {
  name: "fleshy keeled hyacinth strap",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.031,
  sample: (u, v, open): Vec3 => {
    // The raised-margin blade's concave adaxial side carries the green pigment.
    const w = 1 - 2 * u,
      x =
        w *
        (0.02 + 0.18 * Math.sin(Math.PI * v) ** 0.35) *
        (0.48 + 0.52 * open),
      keel = 0.086 * Math.abs(w) ** 1.65 * (0.2 + 0.8 * Math.sin(Math.PI * v));
    return [x, 1.45 * v - 0.09 * v ** 4, keel + 0.2 * v ** 3 - 0.025];
  },
};
export const HYACINTH_LEAF_POSES = Array.from({ length: 5 }, (_, i) => {
  const orientation = new Euler(
    0.11 + (i % 2) * 0.1,
    i * 1.257,
    (i - 2) * 0.11,
    "YXZ",
  ).reorder("XYZ");
  return {
    position: [
      Math.sin(i * 1.257) * 0.045,
      0,
      Math.cos(i * 1.257) * 0.045,
    ] as Vec3,
    rotation: [orientation.x, orientation.y, orientation.z] as Vec3,
    scale: 0.92 + (i % 3) * 0.07,
  };
});
