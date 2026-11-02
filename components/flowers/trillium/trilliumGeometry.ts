import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

/** Three individually attached blades: erect claws, recurved distal half and rolled wavy margins. */
export function trilliumPetal(
  u: number,
  v: number,
  open: number,
  index: number,
): Vec3 {
  const w = 2 * u - 1,
    a = (index * Math.PI * 2) / 3,
    // A blunt living apex keeps nonadjacent cage columns farther apart than
    // the tissue thickness; an almost collapsed tip falsely contacts itself.
    width = 0.022 * (1 - v) + 0.36 * Math.sin(Math.PI * v) ** 0.62 + 0.026,
    x = w * width * (0.16 + 0.84 * open),
    r = 0.065 + 0.11 * v * (1 - open) + 0.88 * v * open,
    // The bud carrier retains an outward slope so its two offset skins cannot exchange sides at the recurved rim.
    y =
      0.015 +
      0.91 * v * (1 - open) +
      open *
        (0.5 * Math.sin(v * Math.PI * 0.64) -
          0.08 * v * v +
          0.08 * w * w * Math.sin(Math.PI * v) +
          0.027 * w * w * v * Math.sin(14 * v + index * 0.8));
  return [
    Math.cos(a) * x + Math.sin(a) * r,
    y,
    -Math.sin(a) * x + Math.cos(a) * r,
  ];
}
export const TRILLIUM_HEAD_CENTER: Vec3 = [0, 0.2, 0];
export const TRILLIUM_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [SINGLE_CLUSTER],
  surfaces: [],
  organs: [],
};
for (let i = 0; i < 3; i++) {
  TRILLIUM_MODEL.surfaces.push(
    {
      name: "broad undulate white trillium petal",
      cluster: 0,
      role: "petal",
      sample: (u, v, o) => trilliumPetal(u, v, o, i),
      thickness: 0.012,
      flexible: true,
      cage: [8, 9],
      mobileCage: [4, 5],
      overviewColumns: 6,
      overviewRows: 10,
      compliance: 0.000055,
      shapeCompliance: 0.00032,
    },
    {
      name: "lanceolate green trillium sepal",
      cluster: 0,
      role: "calyx",
      thickness: 0.012,
      overviewColumns: 4,
      overviewRows: 6,
      sample: (u, v, o): Vec3 => {
        const a = (i * Math.PI * 2) / 3 + Math.PI / 3,
          w = 2 * u - 1,
          x = w * (0.012 + 0.105 * Math.sin(Math.PI * v) ** 0.8),
          r = 0.045 + 0.6 * v * o + 0.06 * Math.sin(Math.PI * v) * (1 - o),
          y = -0.025 + 0.08 * v * o + 0.8 * v * (1 - o) + 0.018 * w * w;
        return [
          Math.cos(a) * x + Math.sin(a) * r,
          y,
          -Math.sin(a) * x + Math.cos(a) * r,
        ];
      },
    },
  );
}
TRILLIUM_MODEL.surfaces.push({
  name: "six-angled trillium ovary",
  cluster: 0,
  role: "receptacle",
  tissue: "disc",
  periodic: true,
  thickness: 0.012,
  overviewColumns: 12,
  overviewRows: 6,
  sample: (u, v): Vec3 => {
    const a = u * Math.PI * 2,
      r =
        (0.023 + 0.059 * Math.sin(Math.PI * v) ** 0.8) *
        (1 + 0.11 * Math.cos(6 * a));
    return [Math.sin(a) * r, 0.015 + 0.19 * v, Math.cos(a) * r];
  },
});
const add = (
  name: string,
  points: Vec3[],
  radius: number,
  color: string,
  endRadius = radius * 0.65,
  flatten = 1,
) => {
  const organ: SpecimenOrgan = {
    name,
    cluster: 0,
    bloomMorph: true,
    points,
    foldedPoints: points.map(([x, y, z]): Vec3 => [
      x * 0.56,
      y * 0.92,
      z * 0.56,
    ]),
    radius,
    foldedRadius: radius * 0.85,
    endRadius,
    color,
    flatten,
  };
  TRILLIUM_MODEL.organs.push(organ);
};
for (let i = 0; i < 6; i++) {
  const a = (i * Math.PI) / 3 + Math.PI / 6,
    point = (r: number, y: number): Vec3 => [
      Math.sin(a) * r,
      y,
      Math.cos(a) * r,
    ];
  add(
    "trillium filament",
    [point(0.09, 0.035), point(0.12, 0.09), point(0.13, 0.14)],
    0.007,
    "#f0ead7",
  );
  add(
    "pale yellow trillium anther",
    [point(0.13, 0.13), point(0.145, 0.23), point(0.16, 0.32)],
    0.018,
    "#e4c454",
    0.012,
    0.65,
  );
}
for (let i = 0; i < 3; i++) {
  const a = (i * Math.PI * 2) / 3;
  add(
    "trillium stigma branch",
    [
      [Math.sin(a) * 0.012, 0.19, Math.cos(a) * 0.012],
      [Math.sin(a) * 0.027, 0.29, Math.cos(a) * 0.027],
      [Math.sin(a) * 0.065, 0.35, Math.cos(a) * 0.065],
    ],
    0.008,
    "#d9e1b4",
    0.005,
  );
}
