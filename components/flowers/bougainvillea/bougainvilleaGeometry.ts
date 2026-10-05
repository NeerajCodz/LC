import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";
export const BOUGAINVILLEA_CYMES: Vec3[] = [
  [0.43, 0.26, 0],
  [-0.43, 0.57, 0.04],
  [0.15, 0.91, -0.13],
];
export function bougainvilleaBract(index: number) {
  const a = (index * Math.PI * 2) / 3;
  return (u: number, v: number, open: number): Vec3 => {
    const w = u * 2 - 1,
      width = 0.006 + 0.31 * Math.sin(v * Math.PI * 0.99) ** 0.7;
    const r = 0.032 + (0.56 * open + 0.09 * (1 - open)) * v,
      across = w * width * (0.3 + 0.7 * open);
    return [
      Math.sin(a) * r + Math.cos(a) * across,
      0.02 +
        0.58 * v * (1 - 0.55 * open) +
        open * (0.06 * w * w + 0.035 * Math.sin(v * 9 + w * 6) * Math.abs(w)),
      Math.cos(a) * r - Math.sin(a) * across,
    ];
  };
}
export function bougainvilleaTube(index: number) {
  const a = (index * Math.PI * 2) / 3;
  return (u: number, v: number, open: number): Vec3 => {
    const angle = u * Math.PI * 2,
      r =
        (0.021 + 0.004 * Math.cos(angle * 5)) * (1 - v * 0.25) +
        (0.006 + 0.034 * open) * v ** 9 * (1 + 0.14 * Math.cos(angle * 5));
    return [
      Math.sin(a) * (0.032 + 0.13 * v) + Math.cos(angle) * r,
      0.075 + 0.32 * v + 0.008 * Math.cos(angle * 5) * v ** 12,
      Math.cos(a) * (0.032 + 0.13 * v) + Math.sin(angle) * r,
    ];
  };
}
export const BOUGAINVILLEA_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...BOUGAINVILLEA_CYMES.map((position, i) => ({
      position,
      rotation: [0.2 + i * 0.05, i * 0.4, 0] as Vec3,
      scale: 1 - i * 0.06,
      nod: 0.025 + i * 0.01,
    })),
  ],
  surfaces: BOUGAINVILLEA_CYMES.flatMap((_, i) => [
    ...Array.from({ length: 3 }, (_, j) => ({
      name: "veined papery bract",
      cluster: i + 1,
      role: "bract" as const,
      sample: bougainvilleaBract(j),
      thickness: 0.0065,
      flexible: true,
      pinMidrib: true,
      delay: i * 0.08,
      cage: [6, 5] as [number, number],
      mobileCage: [2, 4] as [number, number],
      compliance: 0.00014,
    })),
    ...Array.from({ length: 3 }, (_, j) => ({
      name: "five-angled true floral tube",
      contactObstacle: true,
      cage: [6, 4] as [number, number],
      mobileCage: [6, 4] as [number, number],
      cluster: i + 1,
      role: "tube" as const,
      sample: bougainvilleaTube(j),
      thickness: 0.009,
      periodic: true,
      delay: 0.24 + i * 0.08,
    })),
  ]),
  organs: [
    {
      name: "woody flowering shoot axis",
      cluster: 0,
      points: [
        [0, -0.2, 0],
        [0, 0.35, 0],
        [0, 0.85, 0],
      ],
      radius: 0.025,
      endRadius: 0.011,
      color: "#817854",
    },
    ...BOUGAINVILLEA_CYMES.map((p) => ({
      name: "woody cyme branch",
      cluster: 0,
      points: [
        [0, p[1] - 0.38, 0],
        [p[0] * 0.5, p[1] - 0.14, p[2] * 0.5],
        p,
      ] as Vec3[],
      radius: 0.021,
      endRadius: 0.008,
      color: "#817854",
    })),
    ...BOUGAINVILLEA_CYMES.flatMap((_, i) =>
      Array.from({ length: 3 }, (_, j) => {
        const a = (j * Math.PI * 2) / 3;
        return Array.from({ length: 7 }, (_, k) => {
          const b = (k * Math.PI * 2) / 7;
          return {
            name: "included floral stamen",
            cluster: i + 1,
            points: [
              [
                Math.sin(a) * 0.08 + Math.cos(b) * 0.016,
                0.19,
                Math.cos(a) * 0.08 + Math.sin(b) * 0.016,
              ],
              [
                Math.sin(a) * 0.11 + Math.cos(b) * 0.013,
                0.28,
                Math.cos(a) * 0.11 + Math.sin(b) * 0.013,
              ],
              [
                Math.sin(a) * 0.15 + Math.cos(b) * 0.013,
                0.36,
                Math.cos(a) * 0.15 + Math.sin(b) * 0.013,
              ],
            ] as Vec3[],
            radius: 0.0025,
            endRadius: 0.004,
            color: "#ddcda0",
          };
        });
      }).flat(),
    ),
    ...BOUGAINVILLEA_CYMES.flatMap((_, i) =>
      Array.from({ length: 3 }, (_, j) => {
        const a = (j * Math.PI * 2) / 3;
        return {
          name: "included floral style",
          cluster: i + 1,
          points: [
            [Math.sin(a) * 0.08, 0.18, Math.cos(a) * 0.08],
            [Math.sin(a) * 0.13, 0.3, Math.cos(a) * 0.13],
            [Math.sin(a) * 0.16, 0.37, Math.cos(a) * 0.16],
          ] as Vec3[],
          radius: 0.003,
          endRadius: 0.005,
          color: "#d6c99b",
        };
      }),
    ),
  ],
};
