import type { Vec3 } from "@/lib/flowers/types";
import { leafBlade } from "@/lib/three/botanicalBlades";
import type { SpecimenOrgan } from "@/lib/three/specimenModel";
export const DATURA_STEM_LENGTH = 1.65;
export const DATURA_LEAF_TILT = 1.04;
const blade = leafBlade("irregularly toothed ovate datura blade", 0.91, 0.35, {
  teeth: 5,
  depth: 0.38,
  cup: 0.055,
  thickness: 0.012,
});
export const DATURA_LEAF = {
  ...blade,
  overviewRows: 32,
  minimumRows: 32,
  sample: (u: number, v: number, open: number): Vec3 => {
    const p = blade.sample(u, v, open);
    return [
      p[0] * (1 + 0.14 * (2 * u - 1) * Math.sin(Math.PI * v)),
      p[1] + 0.14,
      p[2],
    ];
  },
};
export const DATURA_PETIOLE: SpecimenOrgan = {
  name: "datura leaf petiole",
  cluster: 0,
  points: [
    [0, 0, 0],
    [0, 0.075, 0],
    [0, 0.14, 0],
  ],
  radius: 0.012,
  endRadius: 0.007,
  color: "#7b925c",
};
export const DATURA_FOLIAGE_NODES: {
  t: number;
  angle: number;
  scale: number;
  offset?: Vec3;
}[] = [
  { t: 0.25, angle: 0.4, scale: 1.05 },
  { t: 0.5, angle: 3.4, scale: 0.9 },
  { t: 0.79, angle: 1.3, scale: 0.68, offset: [-0.32, 0, 0.04] },
  { t: 0.81, angle: 4.1, scale: 0.64, offset: [0.32, 0, 0.04] },
];
export const DATURA_FORKS: SpecimenOrgan[] = DATURA_FOLIAGE_NODES.slice(-2).map(
  (n) => ({
    name: "datura forked branch",
    cluster: 0,
    points: [
      [0, -0.58, 0],
      [n.offset![0] * 0.55, -0.45, 0.02],
      [
        0.025 * Math.sin(n.t * Math.PI) + n.offset![0],
        -DATURA_STEM_LENGTH * (1 - n.t),
        n.offset![2],
      ],
    ],
    radius: 0.023,
    endRadius: 0.012,
    color: "#819660",
  }),
);
