import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenOrgan } from "@/lib/three/specimenModel";

const blade = leafBlade("coarsely serrate torenia blade", 0.66, 0.245, {
  teeth: 12,
  depth: 0.13,
  cup: 0.049,
  thickness: 0.01,
});
export const TORENIA_LEAF = {
  ...blade,
  minimumRows: 36,
  sample: (u: number, v: number, open: number): Vec3 => {
    const p = blade.sample(u, v, open);
    return [p[0], p[1] + 0.105, p[2]];
  },
};
export const TORENIA_PETIOLE: SpecimenOrgan = {
  name: "torenia leaf petiole",
  cluster: 0,
  points: [
    [0, 0, 0],
    [0, 0.05, 0],
    [0, 0.105, 0],
  ],
  radius: 0.009,
  endRadius: 0.006,
  color: "#96ad71",
};
export const TORENIA_LEAF_FACE_ROTATION: Vec3 = [0, Math.PI, 0];
export const TORENIA_LEAF_TILT = 0.87;
