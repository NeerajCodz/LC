import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";
export const SWEET_PEA_POSITIONS: Vec3[] = [
  [0.35, 0.12, 0],
  [-0.22, 0.48, 0.05],
  [0.17, 0.87, -0.06],
];
export function sweetPeaBanner(u: number, v: number, open: number): Vec3 {
  const w = u * 2 - 1,
    width = 0.008 + 0.48 * Math.sin(v * Math.PI * 0.98) ** 0.65;
  const radius = 0.008 + 0.075 * Math.sin(v * Math.PI);
  return [
    open * w * width + (1 - open) * Math.sin(w * 2.8) * radius,
    0.05 + (0.36 * (1 - open) + 0.65 * open) * v,
    open *
      (0.03 + 0.18 * w * w - 0.13 * Math.sin(v * Math.PI) + 0.08 * v ** 7) +
      (1 - open) * (0.04 + 0.3 * v - Math.cos(w * 2.8) * radius),
  ];
}
export function sweetPeaWing(sign: number) {
  return (u: number, v: number, open: number): Vec3 => {
    const w = u * 2 - 1,
      width = 0.005 + 0.17 * Math.sin(Math.PI * v * 0.99) ** 0.65;
    return [
      sign *
        (0.04 + 0.28 * open * v + 0.06 * (1 - open) * v + width * w * 0.34),
      -0.035 + width * w + open * 0.025 * Math.sin(v * Math.PI),
      0.04 +
        (0.54 * open + 0.28 * (1 - open)) * v +
        0.08 * open * Math.sin(v * Math.PI),
    ];
  };
}
export function sweetPeaKeel(sign: number) {
  return (u: number, v: number, open: number): Vec3 => {
    const r = 0.005 + 0.125 * Math.sin(v * Math.PI * 0.99) ** 0.7,
      a = u * Math.PI;
    return [
      sign * (0.003 + r * Math.sin(a) * (0.45 + 0.55 * open)),
      -0.08 - r * Math.cos(a) + 0.08 * v ** 4 * open,
      0.025 + (0.56 * open + 0.3 * (1 - open)) * v,
    ];
  };
}
export const SWEET_PEA_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...SWEET_PEA_POSITIONS.map((position, i) => ({
      position,
      rotation: [0.08, -0.2 + i * 0.18, 0] as Vec3,
      scale: 1 - i * 0.09,
      nod: 0.022 + i * 0.01,
    })),
  ],
  surfaces: SWEET_PEA_POSITIONS.flatMap((_, i) => [
    {
      name: "standard banner",
      cluster: i + 1,
      role: "banner" as const,
      sample: sweetPeaBanner,
      thickness: 0.011,
      flexible: true,
      delay: i * 0.14,
      cage: [6, 6] as [number, number],
      mobileCage: [3, 4] as [number, number],
    },
    ...[-1, 1].map((sign) => ({
      name: "lateral wing",
      cluster: i + 1,
      role: "wing" as const,
      sample: sweetPeaWing(sign),
      thickness: 0.012,
      flexible: true,
      delay: i * 0.14 + 0.035,
      cage: [4, 5] as [number, number],
      mobileCage: [2, 4] as [number, number],
      compliance: 0.000035,
    })),
    ...[-1, 1].map((sign) => ({
      name: "paired enclosing keel",
      cluster: i + 1,
      role: "keel" as const,
      sample: sweetPeaKeel(sign),
      thickness: 0.013,
      flexible: true,
      delay: i * 0.14 + 0.05,
      cage: [4, 5] as [number, number],
      mobileCage: [2, 4] as [number, number],
      compliance: 0.000025,
    })),
    ...Array.from({ length: 5 }, (_, j) => ({
      name: "calyx tooth",
      cluster: i + 1,
      role: "calyx" as const,
      thickness: 0.008,
      sample: (u: number, v: number): Vec3 => {
        const a = (j * Math.PI * 2) / 5,
          w = (u * 2 - 1) * (0.03 * Math.sin(v * Math.PI) + 0.003),
          r = 0.037 + 0.06 * v;
        return [
          Math.cos(a) * r - Math.sin(a) * w,
          Math.sin(a) * r + Math.cos(a) * w,
          -0.1 + 0.22 * v,
        ];
      },
    })),
  ]),
  organs: [
    ...SWEET_PEA_POSITIONS.map((p) => ({
      name: "flower stalk",
      cluster: 0,
      points: [
        [0, p[1] - 0.27, 0],
        [p[0] * 0.6, p[1] - 0.04, -0.1],
        p,
      ] as Vec3[],
      radius: 0.012,
      endRadius: 0.007,
      color: "#729451",
    })),
    ...SWEET_PEA_POSITIONS.flatMap((_, i) =>
      Array.from({ length: 10 }, (_, j) => {
        const a = (j * Math.PI * 2) / 10;
        return {
          name: j === 9 ? "free tenth stamen" : "united stamen",
          cluster: i + 1,
          points: [
            [Math.sin(a) * 0.03, -0.065, 0],
            [Math.sin(a) * 0.03, -0.09, 0.22],
            [Math.sin(a) * 0.04, -0.055, 0.43],
          ] as Vec3[],
          radius: 0.004,
          endRadius: 0.008,
          color: "#dcc588",
        };
      }),
    ),
    ...SWEET_PEA_POSITIONS.map((_, i) => ({
      name: "curved pollen-presenting style",
      cluster: i + 1,
      points: [
        [0, -0.13, 0.03],
        [0, -0.09, 0.24],
        [0, 0.015, 0.46],
      ] as Vec3[],
      radius: 0.007,
      endRadius: 0.01,
      color: "#c8cda1",
    })),
  ],
};
