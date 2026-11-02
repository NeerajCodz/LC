import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";

/** A single periodic fused wall, with five plicate ridges continuing into slender rim teeth. */
export function daturaCorolla(u: number, v: number, open: number): Vec3 {
  const a = u * Math.PI * 2,
    throat = Math.max(0, (v - 0.36) / 0.64),
    tooth = (0.5 + 0.5 * Math.cos(5 * a)) ** 5,
    bud =
      0.035 +
      0.019 * Math.sin(Math.PI * v) +
      0.004 * Math.cos(5 * a) * Math.sin(Math.PI * v),
    spread =
      0.055 +
      0.025 * v +
      0.32 * throat ** 1.65 +
      0.1 * tooth * throat ** 5 +
      0.015 * Math.cos(5 * a) * throat ** 2,
    r = bud * (1 - open) + spread * open,
    y = (1.43 + 0.07 * open) * v + 0.075 * tooth * v ** 10 * open;
  return [Math.sin(a) * r, y, Math.cos(a) * r];
}
export const DATURA_HEAD_CENTER: Vec3 = [0, 0.83, 0];
export const DATURA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [SINGLE_CLUSTER],
  surfaces: [
    {
      name: "continuous plicate five-pointed datura trumpet",
      cluster: 0,
      role: "tube",
      periodic: true,
      sample: daturaCorolla,
      thickness: 0.011,
      outerSide: -1,
      flexible: true,
      cage: [20, 10],
      mobileCage: [10, 6],
      overviewColumns: 20,
      overviewRows: 12,
      minimumColumns: 20,
      minimumRows: 12,
      compliance: 0.000026,
      shapeCompliance: 0.00021,
    },
    {
      name: "tubular five-toothed green datura calyx",
      cluster: 0,
      role: "calyx",
      periodic: true,
      thickness: 0.014,
      overviewColumns: 20,
      overviewRows: 6,
      minimumColumns: 20,
      sample: (u, v): Vec3 => {
        const a = u * Math.PI * 2,
          tooth = (0.5 + 0.5 * Math.cos(5 * a + Math.PI)) ** 5,
          r =
            0.071 + 0.037 * v + 0.004 * Math.cos(5 * a) * Math.sin(Math.PI * v);
        return [
          Math.sin(a) * r,
          -0.035 + 0.64 * v + 0.09 * tooth * v ** 5,
          Math.cos(a) * r,
        ];
      },
    },
  ],
  organs: [],
};
const add = (
  name: string,
  points: Vec3[],
  radius: number,
  color: string,
  endRadius = radius * 0.65,
  flatten = 1,
) => {
  DATURA_MODEL.organs.push({
    name,
    cluster: 0,
    bloomMorph: true,
    points,
    foldedPoints: points.map(([x, y, z]): Vec3 => [
      x * 0.72,
      y * (1.43 / 1.5),
      z * 0.72,
    ]),
    radius,
    foldedRadius: radius * 0.85,
    endRadius,
    color,
    flatten,
  });
};
for (let i = 0; i < 5; i++) {
  const a = ((i + 0.5) * Math.PI * 2) / 5,
    p = (r: number, y: number): Vec3 => [Math.sin(a) * r, y, Math.cos(a) * r];
  add(
    "included datura filament",
    [p(0.027, 0.49), p(0.025, 0.91), p(0.025, 1.12)],
    0.0045,
    "#e6e1c5",
  );
  add(
    "included datura anther",
    [p(0.025, 1.1), p(0.026, 1.17), p(0.027, 1.24)],
    0.013,
    "#d9c58a",
    0.008,
    0.65,
  );
}
add(
  "included datura style",
  [
    [0, 0.1, 0],
    [0, 0.76, 0],
    [0, 1.25, 0],
  ],
  0.006,
  "#d7dfb3",
);
for (const side of [-1, 1])
  add(
    "included datura stigma lobe",
    [
      [0, 1.24, 0],
      [side * 0.006, 1.26, 0],
      [side * 0.012, 1.27, 0],
    ],
    0.008,
    "#bfc796",
    0.006,
  );
add(
  "superior datura ovary",
  [
    [0, 0.025, 0],
    [0, 0.08, 0],
    [0, 0.14, 0],
  ],
  0.028,
  "#8ea45e",
  0.018,
);
