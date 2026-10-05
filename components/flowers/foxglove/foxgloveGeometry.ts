import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";
export const FOXGLOVE_BELLS = 12;
function foldedOrganPoints(points: Vec3[]): Vec3[] {
  return points.map(([x, y, z]) => {
    const v = z / 0.73,
      center = -0.12 * v * v;
    return [x * 0.2, center + (y - center) * 0.2, (z * 0.42) / 0.73];
  });
}
export function foxgloveBell(u: number, v: number, open: number): Vec3 {
  const a = u * Math.PI * 2,
    lower = Math.max(0, -Math.sin(a));
  const matureRadius = 0.04 + 0.24 * Math.sin(v * Math.PI * 0.55) ** 0.8;
  const budRadius =
    0.009 + 0.04 * (1 - v) + 0.055 * Math.sin(v * Math.PI) ** 0.8;
  const r = budRadius * (1 - open) + matureRadius * open;
  const rim = 1 + 0.045 * Math.cos(a * 4) * v ** 8;
  return [
    Math.cos(a) * r * rim,
    Math.sin(a) * r * 0.95 - 0.12 * v * v,
    (0.42 + 0.31 * open) * v + open * 0.14 * lower ** 5 * v ** 9,
  ];
}
export const FOXGLOVE_POSITIONS: Vec3[] = Array.from(
  { length: FOXGLOVE_BELLS },
  (_, i) => [0.11 * Math.sin(i * 2.3), -1.35 + i * 0.18, 0.07],
);
export const FOXGLOVE_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...FOXGLOVE_POSITIONS.map((position, i) => ({
      position,
      rotation: [0.23 + 0.025 * i, -0.4 + 0.8 * (i % 2), 0] as Vec3,
      scale: 1 - i * 0.035,
      nod: 0.022 + i * 0.001,
    })),
    { position: [0, 0.92, 0], rotation: [0, 0, 0], scale: 1, nod: 0.009 },
  ],
  surfaces: [
    ...FOXGLOVE_POSITIONS.map((_, i) => ({
      name: `asymmetric hollow bell ${i + 1}`,
      cluster: i + 1,
      role: "tube" as const,
      sample: foxgloveBell,
      thickness: 0.012,
      periodic: true,
      flexible: true,
      delay: i * 0.042,
      cage: [10, 6] as [number, number],
      mobileCage: [6, 4] as [number, number],
      compliance: 0.000025,
    })),
    ...Array.from({ length: 4 }, (_, i) => ({
      name: `terminal bud ${i + 1}`,
      cluster: 13,
      role: "tube" as const,
      thickness: 0.012,
      periodic: true,
      sample: (u: number, v: number): Vec3 => {
        const a = u * Math.PI * 2,
          r = 0.008 + 0.055 * Math.sin(v * Math.PI) ** 0.7;
        return [
          Math.cos(a) * r + (i % 2 ? -0.045 : 0.045),
          0.06 + i * 0.08 + v * 0.22,
          Math.sin(a) * r,
        ];
      },
    })),
    ...FOXGLOVE_POSITIONS.flatMap((_, i) =>
      Array.from({ length: 5 }, (_, j) => ({
        name: "pointed calyx lobe",
        cluster: i + 1,
        role: "calyx" as const,
        thickness: 0.008,
        sample: (u: number, v: number): Vec3 => {
          const a = (j * Math.PI * 2) / 5,
            r = 0.045 + 0.055 * v,
            w = (u * 2 - 1) * (0.025 * Math.sin(v * Math.PI) + 0.002);
          return [
            Math.cos(a) * r - Math.sin(a) * w,
            Math.sin(a) * r + Math.cos(a) * w,
            0.2 * v,
          ];
        },
      })),
    ),
  ],
  organs: [
    {
      name: "raceme axis",
      cluster: 0,
      points: [
        [0, -1.45, 0],
        [0.012, 0, 0],
        [0, 1.25, 0],
      ],
      radius: 0.022,
      endRadius: 0.008,
      color: "#63824c",
    },
    ...FOXGLOVE_POSITIONS.map((p) => ({
      name: "short pedicel",
      cluster: 0,
      points: [
        [0, p[1] - 0.07, 0],
        [p[0] * 0.5, p[1] - 0.02, 0.025],
        p,
      ] as Vec3[],
      radius: 0.011,
      endRadius: 0.006,
      color: "#678551",
    })),
    ...FOXGLOVE_POSITIONS.flatMap((_, i) =>
      Array.from({ length: 4 }, (_, j) => {
        const a = 0.4 + j * 0.58,
          len = j % 2 ? 0.51 : 0.43;
        const points: Vec3[] = [
          [Math.cos(a) * 0.047, Math.sin(a) * 0.047, 0.1],
          [Math.cos(a) * 0.1, Math.sin(a) * 0.12, 0.31],
          [Math.cos(a) * 0.11, Math.sin(a) * 0.12, len],
        ];
        return {
          name: "included didynamous stamen",
          cluster: i + 1,
          points,
          foldedPoints: foldedOrganPoints(points),
          foldedRadius: 0.003,
          radius: 0.006,
          endRadius: 0.011,
          color: "#d6bc98",
        };
      }),
    ),
    ...FOXGLOVE_POSITIONS.map((_, i) => ({
      name: "included style",
      cluster: i + 1,
      points: [
        [0, 0, 0.07],
        [0, 0.1, 0.32],
        [0, 0.09, 0.49],
      ] as Vec3[],
      foldedPoints: foldedOrganPoints([
        [0, 0, 0.07],
        [0, 0.1, 0.32],
        [0, 0.09, 0.49],
      ]),
      foldedRadius: 0.003,
      radius: 0.006,
      endRadius: 0.01,
      color: "#d7c9b5",
    })),
    ...FOXGLOVE_POSITIONS.flatMap((_, cluster) =>
      Array.from({ length: 16 }, (_, i) => {
        const u = 0.45 + (i % 8) * 0.07,
          v = 0.62 + Math.floor(i / 8) * 0.19,
          a = u * Math.PI * 2;
        const points = (open: number): Vec3[] => {
          const p = foxgloveBell(u, v, open);
          return [0.007, 0.019, 0.031].map((inset, j) => [
            p[0] - Math.cos(a) * inset,
            p[1] - Math.sin(a) * inset * 0.95,
            p[2] + j * 0.009 * (0.6 + 0.4 * open),
          ]);
        };
        return {
          name: "interior corolla hair",
          cluster: cluster + 1,
          fine: true,
          points: points(1),
          foldedPoints: points(0),
          radius: 0.0015,
          foldedRadius: 0.0008,
          endRadius: 0.0005,
          color: "#e8d5d6",
        };
      }),
    ),
  ],
};
