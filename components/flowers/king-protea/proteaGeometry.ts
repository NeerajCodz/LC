import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  radialTube,
  type SpecimenModel,
} from "@/lib/three/specimenModel";
import { radialFloretPoses } from "@/lib/three/floretInstances";
export function proteaBract(index: number) {
  const layer = Math.floor(index / 8),
    a = (index * Math.PI) / 4 + layer * 0.27,
    root = 0.18 + layer * 0.05,
    length = 0.87 + layer * 0.075;
  return (u: number, v: number, open: number): Vec3 => {
    const w =
      (u * 2 - 1) *
      (0.005 + (0.25 - layer * 0.014) * Math.sin(Math.PI * v) ** 0.65) *
      (0.3 + 0.7 * open);
    const r =
      root +
      (0.6 - layer * 0.09) * Math.sin(v * Math.PI * 0.56) * open -
      root * 0.78 * (1 - open) * v;
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      -0.1 +
        layer * 0.07 +
        length * v * (0.96 - 0.31 * open) +
        0.04 * (u * 2 - 1) ** 2 * Math.sin(Math.PI * v),
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const PROTEA_MODEL: SpecimenModel = {
  clusters: [{ ...SINGLE_CLUSTER, nod: 0.006 }],
  surfaces: Array.from({ length: 32 }, (_, i) => ({
    name: "imbricate involucral bract",
    cluster: 0,
    role: "bract" as const,
    sample: proteaBract(i),
    thickness: 0.018,
    flexible: true,
    pinMidrib: true,
    delay: Math.floor(i / 8) * 0.035,
    cage: [3, 5] as [number, number],
    mobileCage: [2, 3] as [number, number],
    compliance: 0.000013,
    shapeCompliance: 0.0002,
  })),
  organs: [
    {
      name: "thick floral receptacle",
      cluster: 0,
      points: [
        [0, -0.2, 0],
        [0, -0.09, 0],
        [0, 0.01, 0],
      ],
      radius: 0.18,
      endRadius: 0.23,
      color: "#a99778",
    },
  ],
  instances: [
    {
      name: "true central florets",
      cluster: 0,
      poses: radialFloretPoses(128, 0.49, 0.09, 901),
      surfaces: [
        {
          name: "fused perianth base",
          cluster: 0,
          role: "tube",
          thickness: 0.0025,
          periodic: true,
          sample: radialTube(0.009, 0.14, 4, 0.011),
        },
        ...Array.from({ length: 4 }, (_, i) => ({
          name: "perianth limb",
          cluster: 0,
          role: "petal" as const,
          thickness: 0.0025,
          sample: (u: number, v: number, open: number): Vec3 => {
            const a = (i * Math.PI) / 2,
              w = (u * 2 - 1) * (0.0015 + 0.009 * Math.sin(v * Math.PI)),
              r = 0.009 + 0.047 * open * Math.sin(v * Math.PI * 0.75);
            return [
              Math.sin(a) * r + Math.cos(a) * w,
              0.14 + v * (0.045 + 0.15 * open) - 0.055 * open * v * v,
              Math.cos(a) * r - Math.sin(a) * w,
            ];
          },
        })),
      ],
      organs: [
        {
          name: "pollen-presenting style",
          cluster: 0,
          points: [
            [0, 0.04, 0],
            [0.004, 0.22, 0],
            [0.01, 0.45, 0],
            [0.012, 0.5, 0],
          ],
          foldedPoints: [
            [0, 0.025, 0],
            [0.002, 0.065, 0],
            [0.004, 0.12, 0],
            [0.004, 0.15, 0],
          ],
          radius: 0.0028,
          endRadius: 0.005,
          color: "#e5e0c7",
        },
        ...Array.from({ length: 4 }, (_, i) => {
          const a = (i * Math.PI) / 2;
          return {
            name: "included anther",
            cluster: 0,
            points: [
              [Math.sin(a) * 0.021, 0.21, Math.cos(a) * 0.021],
              [Math.sin(a) * 0.027, 0.23, Math.cos(a) * 0.027],
              [Math.sin(a) * 0.03, 0.245, Math.cos(a) * 0.03],
            ] as Vec3[],
            foldedPoints: [
              [Math.sin(a) * 0.006, 0.14, Math.cos(a) * 0.006],
              [Math.sin(a) * 0.007, 0.16, Math.cos(a) * 0.007],
              [Math.sin(a) * 0.008, 0.17, Math.cos(a) * 0.008],
            ] as Vec3[],
            radius: 0.002,
            endRadius: 0.0035,
            color: "#d0c9a8",
          };
        }),
      ],
    },
  ],
};
