import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  radialTube,
  type SpecimenModel,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";
import { radialFloretPoses } from "@/lib/three/floretInstances";
const heads: Vec3[] = Array.from({ length: 10 }, (_, i) => {
  const a = (i * Math.PI) / 5,
    r = 0.87 + 0.045 * Math.sin(i * 3.1);
  return [Math.sin(a) * r, 0.03 + 0.035 * Math.sin(i * 1.6), Math.cos(a) * r];
});
const fertile = radialFloretPoses(48, 0.63, 0.09, 712);
function hydrangeaSepal(index: number): SpecimenSurface["sample"] {
  const a = (index * Math.PI) / 2;
  return (u, v, open) => {
    const w =
        (u * 2 - 1) *
        (0.006 + 0.19 * Math.sin(v * Math.PI) ** 0.68) *
        (0.22 + 0.78 * open),
      r = 0.027 + v * (0.015 + 0.36 * open);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      0.032 +
        0.035 * Math.sin(v * Math.PI) +
        0.27 * (1 - open) * v +
        0.02 * open * (u * 2 - 1) ** 2,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const HYDRANGEA_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0.005 },
    ...heads.map((position, i) => ({
      position,
      rotation: [0.09 * Math.sin(i), i * 0.3, 0.07 * Math.cos(i)] as Vec3,
      scale: 0.96 + 0.04 * Math.sin(i * 3),
      nod: 0.018,
    })),
  ],
  surfaces: heads.flatMap((_, k) =>
    Array.from({ length: 4 }, (_, i) => ({
      name: "showy petaloid sepal",
      cluster: k + 1,
      role: "bract" as const,
      sample: hydrangeaSepal(i),
      thickness: 0.012,
      flexible: true,
      delay: 0.1 + (k % 3) * 0.025,
      pinMidrib: true,
      cage: [2, 4] as [number, number],
      mobileCage: [2, 3] as [number, number],
      compliance: 0.00007,
    })),
  ),
  organs: [
    {
      name: "branched lacecap axis",
      cluster: 0,
      points: [
        [0, -0.29, 0],
        [0, -0.14, 0],
        [0, 0.02, 0],
      ],
      radius: 0.027,
      endRadius: 0.019,
      color: "#839a60",
    },
    ...heads.map((p) => ({
      name: "showy flower pedicel",
      cluster: 0,
      points: [[0, -0.22, 0], [p[0] * 0.55, -0.1, p[2] * 0.55], p] as Vec3[],
      radius: 0.013,
      endRadius: 0.007,
      color: "#899d65",
    })),
    ...fertile.map((p) => ({
      name: "fertile pedicel",
      cluster: 0,
      points: [
        [0, -0.23, 0],
        [p.position[0] * 0.6, -0.08, p.position[2] * 0.6],
        p.position,
      ] as Vec3[],
      radius: 0.006,
      endRadius: 0.003,
      color: "#99a778",
    })),
    ...heads.map((_, i) => ({
      name: "reduced flower center",
      cluster: i + 1,
      points: [
        [0, 0, 0],
        [0, 0.042, 0],
        [0, 0.06, 0],
      ] as Vec3[],
      radius: 0.018,
      endRadius: 0.011,
      color: "#adb4d3",
    })),
  ],
  instances: [
    {
      name: "central fertile flowers",
      cluster: 0,
      poses: fertile,
      surfaces: [
        ...Array.from({ length: 5 }, (_, i) => ({
          name: "fertile petal",
          cluster: 0,
          role: "petal" as const,
          thickness: 0.003,
          sample: (u: number, v: number, open: number): Vec3 => {
            const a = (i * Math.PI * 2) / 5,
              w =
                (u * 2 - 1) *
                (0.002 + 0.022 * Math.sin(Math.PI * v)) *
                (0.3 + 0.7 * open),
              r = 0.008 + (0.008 + 0.055 * open) * v;
            return [
              Math.sin(a) * r + Math.cos(a) * w,
              0.015 + 0.055 * (1 - open) * v + 0.015 * v,
              Math.cos(a) * r - Math.sin(a) * w,
            ];
          },
        })),
        {
          name: "fertile calyx",
          cluster: 0,
          role: "calyx",
          thickness: 0.003,
          periodic: true,
          sample: radialTube(0.013, 0.025, 5, 0.018),
        },
      ],
      organs: [
        ...Array.from({ length: 10 }, (_, i) => {
          const a = (i * Math.PI) / 5,
            points: Vec3[] = [
              [Math.sin(a) * 0.009, 0.018, Math.cos(a) * 0.009],
              [Math.sin(a) * 0.025, 0.06, Math.cos(a) * 0.025],
              [Math.sin(a) * 0.035, 0.095, Math.cos(a) * 0.035],
            ];
          return {
            name: "fertile stamen",
            cluster: 0,
            points,
            foldedPoints: points.map(
              ([x, y, z]) => [x * 0.3, y * 0.65, z * 0.3] as Vec3,
            ),
            radius: 0.0018,
            endRadius: 0.004,
            color: "#cbd1e6",
          };
        }),
        ...[0, 1, 2].map((i) => ({
          name: "fertile style",
          cluster: 0,
          points: [
            [0, 0.018, 0],
            [Math.sin(i * 2.094) * 0.008, 0.06, Math.cos(i * 2.094) * 0.008],
            [Math.sin(i * 2.094) * 0.012, 0.078, Math.cos(i * 2.094) * 0.012],
          ] as Vec3[],
          radius: 0.002,
          color: "#b8bfdc",
        })),
      ],
    },
  ],
};
