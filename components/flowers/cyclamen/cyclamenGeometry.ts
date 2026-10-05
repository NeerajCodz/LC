import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";

export function cyclamenLobe(index: number, bud = false) {
  const a = (index * Math.PI * 2) / 5;
  return (u: number, v: number, bloom: number): Vec3 => {
    const open = bloom * (bud ? 0.12 : 1),
      w =
        (u * 2 - 1) *
        (0.006 + 0.14 * Math.sin(Math.PI * v) ** 0.8) *
        (0.22 + 0.78 * open);
    const twist = open * 0.95 * v,
      r = 0.065 + 0.3 * open * Math.sin(v * Math.PI * 0.8) + 0.02 * v;
    const y = -0.22 + v * (-0.34 + 1.2 * open) + w * Math.sin(twist);
    const across = w * Math.cos(twist);
    return [
      Math.sin(a) * r + Math.cos(a) * across,
      y,
      Math.cos(a) * r - Math.sin(a) * across,
    ];
  };
}
const heads: Vec3[] = [
  [-0.43, 0.08, 0.06],
  [0.3, 0.26, -0.22],
  [0.3, -0.1, 0.4],
  [-0.3, -0.18, 0.36],
  [0.1, -0.28, -0.38],
];
export const CYCLAMEN_MODEL: SpecimenModel = {
  clusters: [
    SINGLE_CLUSTER,
    ...heads.map((position, i) => ({
      position,
      rotation: [0, i * 0.7, i % 2 ? 0.12 : -0.12] as Vec3,
      scale: i < 3 ? 1 : 0.65,
      nod: 0.028,
    })),
  ],
  surfaces: heads.flatMap((_, k) => [
    ...Array.from({ length: 5 }, (_, i) => ({
      name: `${k < 3 ? "reflexed twisted lobe" : "furled bud lobe"} ${i + 1}`,
      cluster: k + 1,
      role: "petal" as const,
      sample: cyclamenLobe(i, k >= 3),
      thickness: 0.01,
      flexible: true,
      delay: k * 0.045,
      cage: [3, 5] as [number, number],
      mobileCage: [2, 3] as [number, number],
    })),
    {
      name: "downward fused corolla cup",
      cluster: k + 1,
      role: "tube" as const,
      periodic: true,
      thickness: 0.012,
      sample: (u: number, v: number, open: number): Vec3 => {
        const a = u * Math.PI * 2,
          r = 0.035 + (0.016 + 0.016 * open) * v;
        return [Math.cos(a) * r, -0.22 * v, Math.sin(a) * r];
      },
    },
    ...Array.from({ length: 5 }, (_, i) => ({
      name: "calyx tooth",
      cluster: k + 1,
      role: "calyx" as const,
      thickness: 0.008,
      sample: (u: number, v: number): Vec3 => {
        const a = (i * Math.PI * 2) / 5,
          w = (u * 2 - 1) * (0.004 + 0.025 * Math.sin(Math.PI * v)),
          r = 0.036 + 0.035 * v;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          -0.07 * v,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    })),
  ]),
  organs: [
    ...heads.map((position) => ({
      name: "curved flower stalk",
      cluster: 0,
      points: [
        [0, -1.8, 0],
        [position[0] * 0.7, -0.9, position[2] * 0.7],
        [position[0] * 1.13, position[1] + 0.12, position[2]],
        [...position],
      ] as Vec3[],
      radius: 0.019,
      endRadius: 0.013,
      color: "#906c65",
    })),
    ...heads.flatMap((_, k) => [
      ...Array.from({ length: 5 }, (_, i) => {
        const a = (i * Math.PI * 2) / 5;
        return {
          name: "included stamen",
          cluster: k + 1,
          points: [
            [Math.sin(a) * 0.018, -0.03, Math.cos(a) * 0.018],
            [Math.sin(a) * 0.022, -0.11, Math.cos(a) * 0.022],
            [Math.sin(a) * 0.022, -0.15, Math.cos(a) * 0.022],
          ] as Vec3[],
          radius: 0.004,
          endRadius: 0.009,
          color: "#d4b16c",
        };
      }),
      {
        name: "included style",
        cluster: k + 1,
        points: [
          [0, -0.03, 0],
          [0, -0.11, 0],
          [0, -0.17, 0],
        ] as Vec3[],
        radius: 0.004,
        color: "#dbceb5",
      },
    ]),
  ],
};
