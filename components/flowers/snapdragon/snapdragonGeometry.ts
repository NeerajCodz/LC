import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";
/** Dorsal pair, lateral pair and ventral lobe share one sealed floral tube. */
export function snapdragonCorolla(
  u: number,
  v: number,
  open: number,
  press = 0,
): Vec3 {
  const a = u * Math.PI * 2,
    lower = Math.max(0, -Math.sin(a)),
    upper = Math.max(0, Math.sin(a));
  const bud = 0.009 + 0.045 * (1 - v) + 0.035 * Math.sin(v * Math.PI),
    r = bud * (1 - open) + (0.04 + 0.18 * v) * open;
  const palate =
    0.19 * Math.exp(-(((v - 0.79) / 0.17) ** 2)) * lower ** 2 * open;
  const lobes = 0.022 * Math.cos(a * 5) * v ** 9 * open;
  return [
    Math.cos(a) * r * (1 + 0.12 * upper * v ** 6),
    Math.sin(a) * r * 0.67 +
      palate -
      0.22 * press * lower ** 2 * v ** 2 * open +
      0.015 * upper * v ** 6 * open,
    v * (0.29 + 0.27 * open) + lobes + 0.065 * lower ** 4 * v ** 8 * open,
  ];
}
export const SNAPDRAGON_POSITIONS: Vec3[] = Array.from(
  { length: 8 },
  (_, i) => [Math.sin(i * 2.2) * 0.07, -0.86 + i * 0.19, 0.055],
);
function folded(points: Vec3[]): Vec3[] {
  return points.map(([x, y, z]) => [x * 0.2, y * 0.2, z * 0.52]);
}
export const SNAPDRAGON_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...SNAPDRAGON_POSITIONS.map((position, i) => ({
      position,
      rotation: [0.05, i % 2 ? 0.5 : -0.4, 0] as Vec3,
      scale: 1 - i * 0.025,
      nod: 0.014,
    })),
    { position: [0, 0.82, 0], rotation: [0, 0, 0], scale: 1, nod: 0.008 },
  ],
  surfaces: [
    ...SNAPDRAGON_POSITIONS.map((_, i) => ({
      name: "bilateral closed-mouth corolla",
      cluster: i + 1,
      role: "tube" as const,
      periodic: true,
      thickness: 0.014,
      flexible: true,
      sample: snapdragonCorolla,
      delay: i * 0.04,
      cage: [12, 7] as [number, number],
      mobileCage: [6, 4] as [number, number],
      compliance: 0.00002,
      shapeCompliance: 0.0003,
    })),
    ...SNAPDRAGON_POSITIONS.flatMap((_, i) =>
      Array.from({ length: 5 }, (_, j) => ({
        name: "calyx tooth",
        cluster: i + 1,
        role: "calyx" as const,
        thickness: 0.008,
        sample: (u: number, v: number): Vec3 => {
          const a = (j * Math.PI * 2) / 5,
            w = (u * 2 - 1) * (0.003 + 0.022 * Math.sin(v * Math.PI)),
            r = 0.041 + 0.025 * v;
          return [
            Math.cos(a) * r - Math.sin(a) * w,
            Math.sin(a) * r + Math.cos(a) * w,
            0.17 * v,
          ];
        },
      })),
    ),
    ...Array.from({ length: 4 }, (_, i) => ({
      name: "terminal bud",
      cluster: 9,
      role: "tube" as const,
      periodic: true,
      thickness: 0.012,
      sample: (u: number, v: number): Vec3 => {
        const a = u * Math.PI * 2,
          r = 0.008 + 0.042 * Math.sin(v * Math.PI) ** 0.8;
        return [
          Math.cos(a) * r + (i % 2 ? -0.04 : 0.04),
          i * 0.065 + v * 0.2,
          Math.sin(a) * r,
        ];
      },
    })),
  ],
  organs: [
    {
      name: "raceme axis",
      cluster: 0,
      points: [
        [0, -0.93, 0],
        [0, 0, 0],
        [0, 1.15, 0],
      ],
      radius: 0.02,
      endRadius: 0.009,
      color: "#66814a",
    },
    ...SNAPDRAGON_POSITIONS.map((p) => ({
      name: "short pedicel",
      cluster: 0,
      points: [
        [0, p[1] - 0.04, 0],
        [p[0] * 0.5, p[1] - 0.015, 0.03],
        p,
      ] as Vec3[],
      radius: 0.011,
      endRadius: 0.006,
      color: "#718f52",
    })),
    ...SNAPDRAGON_POSITIONS.flatMap((_, i) => [
      ...Array.from({ length: 4 }, (_, j) => {
        const x = (j % 2 ? 1 : -1) * 0.028,
          y = 0.02 + (j > 1 ? 0.025 : 0),
          points: Vec3[] = [
            [x * 0.5, 0, 0.04],
            [x, y, 0.17],
            [x, y, j > 1 ? 0.36 : 0.29],
          ];
        return {
          name: "included didynamous stamen",
          cluster: i + 1,
          points,
          foldedPoints: folded(points),
          foldedRadius: 0.002,
          radius: 0.004,
          endRadius: 0.008,
          color: "#d4ae62",
        };
      }),
      {
        name: "included style",
        cluster: i + 1,
        points: [
          [0, 0, 0.04],
          [0, 0.025, 0.2],
          [0, 0.028, 0.35],
        ] as Vec3[],
        foldedPoints: [
          [0, 0, 0.02],
          [0, 0.005, 0.1],
          [0, 0.006, 0.18],
        ] as Vec3[],
        radius: 0.003,
        color: "#e3d3a7",
      },
    ]),
  ],
};
