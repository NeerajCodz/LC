import type { Vec3 } from "@/lib/flowers/types";
import { leafBlade } from "@/lib/three/botanicalBlades";
import type { SpecimenOrgan } from "@/lib/three/specimenModel";
const blade = leafBlade("serrate ovate salvia blade", 0.72, 0.255, {
  teeth: 11,
  depth: 0.16,
  cup: 0.045,
  thickness: 0.01,
});
export const SALVIA_LEAF = {
  ...blade,
  minimumRows: 44,
  overviewRows: 44,
  sample: (u: number, v: number, o: number): Vec3 => {
    const p = blade.sample(u, v, o);
    return [p[0], p[1] + 0.14, p[2]];
  },
};
export const SALVIA_PETIOLE: SpecimenOrgan = {
  name: "salvia leaf petiole",
  cluster: 0,
  points: [
    [0, 0, 0],
    [0, 0.065, 0],
    [0, 0.14, 0],
  ],
  radius: 0.009,
  endRadius: 0.0055,
  color: "#8b9f5e",
};
export const SALVIA_FOLIAGE_NODES = [0.18, 0.43, 0.69, 0.88].flatMap((t, i) =>
  [0, Math.PI].map((side) => ({
    t,
    angle: side + ((i % 2) * Math.PI) / 2,
    scale: 1 - i * 0.16,
  })),
);
export const SALVIA_LEAF_TILT = 1.02;
