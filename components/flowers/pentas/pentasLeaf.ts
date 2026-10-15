import { leafBlade } from "@/lib/three/botanicalBlades";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import type { SpecimenOrgan } from "@/lib/three/specimenModel";
import { seededRandom } from "@/lib/three/noise";

const blade = leafBlade("hairy petiolate pentas blade", 0.91, 0.28, {
  cup: 0.065,
  wrinkle: 0.0045,
  thickness: 0.011,
});
export const PENTAS_LEAF = {
  ...blade,
  sample: (u: number, v: number, open: number): Vec3 => {
    const p = blade.sample(u, v, open);
    return [p[0], p[1] + 0.13, p[2]];
  },
};
export const PENTAS_PETIOLE: SpecimenOrgan = {
  name: "pentas leaf petiole",
  cluster: 0,
  points: [
    [0, 0, 0],
    [0.003, 0.064, 0],
    [0, 0.13, 0],
  ],
  radius: 0.012,
  endRadius: 0.008,
  color: "#819961",
};
export const PENTAS_LEAF_FACE_ROTATION: Vec3 = [0, Math.PI, 0];
export const PENTAS_LEAF_TILT = 0.91;
/** Authored underside density changes with quality; every hair starts on the same real blade. */
export function pentasLeafHairs(quality: Quality): SpecimenOrgan[] {
  const random = seededRandom(1927),
    count =
      quality === "overview"
        ? 8
        : quality === "low"
          ? 14
          : quality === "medium"
            ? 24
            : 36;
  return Array.from({ length: count }, () => {
    const u = 0.2 + random() * 0.6,
      v = 0.14 + random() * 0.72,
      full = PENTAS_LEAF.sample(u, v, 1),
      folded = PENTAS_LEAF.sample(u, v, 0),
      length = 0.014 + random() * 0.011;
    const points = (p: Vec3): Vec3[] => [
      [p[0], p[1], p[2] - 0.005],
      [p[0] + 0.004, p[1] + 0.003, p[2] - 0.005 - length],
    ];
    return {
      name: "pentas abaxial leaf hair",
      cluster: 0,
      points: points(full),
      foldedPoints: points(folded),
      radius: 0.00085,
      endRadius: 0.00022,
      color: "#c3ccab",
    };
  });
}
