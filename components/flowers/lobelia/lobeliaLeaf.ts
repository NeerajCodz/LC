import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenOrgan } from "@/lib/three/specimenModel";

const lower = leafBlade("toothed spathulate lower lobelia blade", 0.48, 0.19, {
  teeth: 7,
  depth: 0.08,
  cup: 0.038,
  thickness: 0.008,
});
export const LOBELIA_LOWER_LEAF = {
  ...lower,
  sample: (u: number, v: number, open: number): Vec3 => {
    const p = lower.sample(u, v, open);
    return [p[0] * (0.65 + 0.35 * v), p[1] + 0.055, p[2]];
  },
};
export const LOBELIA_UPPER_LEAF = leafBlade(
  "linear entire upper lobelia blade",
  0.36,
  0.063,
  { cup: 0.02, thickness: 0.006 },
);
export const LOBELIA_LOWER_PETIOLE: SpecimenOrgan = {
  name: "lower lobelia leaf petiole",
  cluster: 0,
  points: [
    [0, 0, 0],
    [0, 0.027, 0],
    [0, 0.055, 0],
  ],
  radius: 0.006,
  endRadius: 0.004,
  color: "#8ca471",
};
export const LOBELIA_LEAF_FACE_ROTATION: Vec3 = [0, Math.PI, 0];
export const LOBELIA_LEAF_TILT = 0.93;
