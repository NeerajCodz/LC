import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";
const heads: Vec3[] = [
  [-0.52, 0.05, 0.18],
  [0.3, 0.3, 0.12],
  [0.47, -0.25, 0.32],
  [-0.13, -0.45, 0.4],
  [-0.45, 0.4, -0.08],
  [0.48, 0.5, -0.08],
];
export function begoniaTepal(index: number, female: boolean, bud = false) {
  const a = (index * Math.PI * 2) / (female ? 3 : 4),
    large = female || index % 2 === 0;
  return (u: number, v: number, bloom: number): Vec3 => {
    const open = bloom * (bud ? 0.1 : 1),
      w =
        (u * 2 - 1) *
        (0.004 + (large ? 0.25 : 0.14) * Math.sin(Math.PI * v) ** 0.8) *
        (0.2 + 0.8 * open);
    const r = 0.027 + (large ? 0.57 : 0.41) * v * open;
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      Math.cos(a) * r - Math.sin(a) * w,
      0.03 + 0.32 * (1 - open) * v + 0.08 * open * (v * v + (u * 2 - 1) ** 2),
    ];
  };
}
export const BEGONIA_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...heads.map((position, i) => ({
      position,
      rotation: [
        0.2 + i * 0.025,
        i % 2 ? 0.28 : -0.24,
        i % 2 ? 0.15 : -0.1,
      ] as Vec3,
      scale: i < 4 ? 1 : 0.62,
      nod: 0.038,
    })),
  ],
  surfaces: heads.flatMap((_, k) => {
    const female = k === 2 || k === 3 || k === 5,
      bud = k >= 4;
    return [
      ...Array.from({ length: female ? 3 : 4 }, (_, i) => ({
        name: bud ? "bud tepal" : female ? "female tepal" : "male tepal",
        cluster: k + 1,
        role: "petal" as const,
        sample: begoniaTepal(i, female, bud),
        thickness: 0.009,
        flexible: !bud,
        delay: k * 0.045,
        cage: [3, 5] as [number, number],
        mobileCage: [2, 3] as [number, number],
      })),
      ...(female
        ? [
            {
              name: "inferior ovary",
              cluster: k + 1,
              role: "calyx" as const,
              periodic: true,
              thickness: 0.009,
              sample: (u: number, v: number): Vec3 => {
                const a = u * Math.PI * 2,
                  r = 0.03 + 0.025 * Math.sin(Math.PI * v);
                return [Math.cos(a) * r, Math.sin(a) * r, -0.03 - 0.22 * v];
              },
            },
            ...[0.24, 0.13, 0.09].map((size, i) => ({
              name: "ovary wing",
              cluster: k + 1,
              role: "calyx" as const,
              thickness: 0.008,
              sample: (u: number, v: number): Vec3 => {
                const a = (i * Math.PI * 2) / 3,
                  r = 0.035 + (0.003 + size * Math.sin(Math.PI * v)) * u;
                return [Math.cos(a) * r, Math.sin(a) * r, -0.04 - 0.2 * v];
              },
            })),
          ]
        : []),
    ];
  }),
  organs: [
    {
      name: "forked cyme axis",
      cluster: 0,
      points: [
        [0, -0.2, 0],
        [0, 0.24, 0],
        [0, 0.59, -0.05],
      ],
      radius: 0.019,
      endRadius: 0.009,
      color: "#a46458",
    },
    ...heads.map((p) => ({
      name: "pendant flower stalk",
      cluster: 0,
      points: [
        [0, 0.28, 0],
        [p[0] * 0.65, p[1] + 0.18, p[2] * 0.6],
        [p[0], p[1] + 0.08, p[2]],
        [...p],
      ] as Vec3[],
      radius: 0.012,
      endRadius: 0.006,
      color: "#b37164",
    })),
    ...[1, 2].flatMap((cluster) =>
      Array.from({ length: 40 }, (_, i) => {
        const a = i * 2.399,
          r = 0.025 + 0.083 * Math.sqrt((i + 0.5) / 40),
          points: Vec3[] = [
            [Math.sin(a) * r * 0.2, Math.cos(a) * r * 0.2, 0.025],
            [Math.sin(a) * r * 0.7, Math.cos(a) * r * 0.7, 0.1],
            [Math.sin(a) * r, Math.cos(a) * r, 0.14 + (i % 4) * 0.013],
          ];
        return {
          name: "male stamen",
          cluster,
          points,
          foldedPoints: points.map(
            ([x, y, z]) => [x * 0.28, y * 0.28, z * 0.7] as Vec3,
          ),
          radius: 0.003,
          endRadius: 0.009,
          color: "#d9af3d",
        };
      }),
    ),
    ...[3, 4, 6].flatMap((cluster) =>
      Array.from({ length: 3 }, (_, i) =>
        [-1, 1].map((sign) => {
          const a = (i * Math.PI * 2) / 3,
            r = 0.025;
          return {
            name: "U-shaped stigma",
            cluster,
            points: [
              [0, 0, 0.01],
              [Math.sin(a) * r, Math.cos(a) * r, 0.07],
              [
                Math.sin(a) * r + Math.cos(a) * sign * 0.026,
                Math.cos(a) * r - Math.sin(a) * sign * 0.026,
                0.1,
              ],
              [
                Math.sin(a) * r + Math.cos(a) * sign * 0.02,
                Math.cos(a) * r - Math.sin(a) * sign * 0.02,
                0.075,
              ],
            ] as Vec3[],
            radius: 0.005,
            color: "#d7b548",
          };
        }),
      ).flat(),
    ),
  ],
};
