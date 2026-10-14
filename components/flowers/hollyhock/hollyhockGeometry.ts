import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

export const HOLLYHOCK_FLOWER_POSITIONS: Vec3[] = Array.from(
  { length: 7 },
  (_, i) => {
    const a = i * 2.399963229728653;
    return [Math.sin(a) * 0.11, 0.13 + i * 0.36, Math.cos(a) * 0.11];
  },
);
export function hollyhockPetal(index: number, young = false) {
  const a = (index * Math.PI * 2) / 5;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.075 : 1),
      w = 2 * u - 1,
      notch = 0.055 * Math.exp(-w * w * 24) * v ** 10,
      width =
        w *
        (0.004 + 0.31 * Math.sin(Math.PI * v * 0.98) ** 0.7) *
        (0.3 + 0.7 * open),
      r =
        (0.009 + 0.059 * (1 - v) + 0.049 * Math.sin(Math.PI * v)) * (1 - open) +
        (0.052 + 0.68 * Math.sin(v * Math.PI * 0.54) - notch) * open;
    return [
      Math.sin(a) * r + Math.cos(a) * width,
      0.055 +
        (0.69 * (1 - open) + 0.25 * open) * v +
        0.056 * w * w * Math.sin(Math.PI * v) * open,
      Math.cos(a) * r - Math.sin(a) * width,
    ];
  };
}
function cup(lobes: number, epicalyx: boolean) {
  return (u: number, v: number): Vec3 => {
    const a = u * Math.PI * 2,
      lobe = (0.5 + 0.5 * Math.cos(a * lobes)) ** 2,
      r = (epicalyx ? 0.06 : 0.047) + (epicalyx ? 0.047 : 0.035) * v;
    return [
      Math.sin(a) * r,
      (epicalyx ? -0.052 : -0.025) + 0.086 * v + 0.073 * lobe * v ** 5,
      Math.cos(a) * r,
    ];
  };
}
function organPose(points: Vec3[], open: number): Vec3[] {
  return points.map(([x, y, z]) => [
    x * (0.45 + 0.55 * open),
    y * (0.76 + 0.24 * open),
    z * (0.45 + 0.55 * open),
  ]);
}
export const HOLLYHOCK_STALKS: SpecimenOrgan[] = [
  {
    name: "leafy hollyhock inflorescence axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.009, 1.1, 0],
      [0, 2.45, 0],
    ],
    radius: 0.033,
    endRadius: 0.011,
    color: "#758653",
  },
  ...HOLLYHOCK_FLOWER_POSITIONS.map((p): SpecimenOrgan => ({
    name: "short axillary hollyhock pedicel",
    cluster: 0,
    points: [[0, p[1] - 0.023, 0], [p[0] * 0.55, p[1] - 0.008, p[2] * 0.55], p],
    radius: 0.016,
    endRadius: 0.01,
    color: "#81955d",
  })),
];
export const HOLLYHOCK_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...HOLLYHOCK_FLOWER_POSITIONS.map((position, i) => ({
      position,
      rotation: [1.38, i * 2.399963229728653, 0] as Vec3,
      scale: i >= 5 ? 0.32 - (i - 5) * 0.07 : 0.61 - i * 0.025,
      nod: 0.023,
    })),
  ],
  surfaces: [],
  organs: [...HOLLYHOCK_STALKS],
};
for (let i = 0; i < 7; i++) {
  const cluster = i + 1,
    young = i >= 5,
    delay = i * 0.045;
  for (let p = 0; p < 5; p++)
    HOLLYHOCK_MODEL.surfaces.push({
      name: "notched single hollyhock petal",
      cluster,
      role: "petal",
      sample: hollyhockPetal(p, young),
      thickness: 0.013,
      flexible: !young,
      delay,
      cage: [4, 5],
      mobileCage: [2, 3],
      overviewColumns: 6,
      overviewRows: 4,
      compliance: 0.00004,
      shapeCompliance: 0.0004,
    });
  for (const epicalyx of [true, false])
    HOLLYHOCK_MODEL.surfaces.push({
      name: epicalyx ? "seven-lobed epicalyx" : "five-lobed calyx",
      cluster,
      role: "calyx",
      periodic: true,
      sample: cup(epicalyx ? 7 : 5, epicalyx),
      thickness: 0.01,
      overviewColumns: epicalyx ? 14 : 10,
      overviewRows: 2,
    });
  const add = (
    name: string,
    points: Vec3[],
    radius: number,
    color: string,
    endRadius = radius * 0.7,
  ) => {
    HOLLYHOCK_MODEL.organs.push({
      name,
      cluster,
      points: organPose(points, young ? 0.075 : 1),
      foldedPoints: organPose(points, 0),
      foldedRadius: radius * 0.6,
      radius,
      endRadius,
      color,
    });
  };
  add(
    "continuous stamen column",
    [
      [0, 0.025, 0],
      [0, 0.19, 0],
      [0, 0.405, 0],
    ],
    0.033,
    "#ece1bb",
    0.025,
  );
  add(
    "included style axis",
    [
      [0, 0.02, 0],
      [0, 0.27, 0],
      [0, 0.445, 0],
    ],
    0.009,
    "#d6ccaa",
  );
  for (let j = 0; j < 32; j++) {
    const a = j * 2.399963229728653,
      y = 0.28 + (j % 8) * 0.017,
      root: Vec3 = [Math.sin(a) * 0.025, y, Math.cos(a) * 0.025],
      tip: Vec3 = [Math.sin(a) * 0.058, y + 0.012, Math.cos(a) * 0.058];
    add(
      "upper-column stamen filament",
      [root, [Math.sin(a) * 0.042, y + 0.006, Math.cos(a) * 0.042], tip],
      0.003,
      "#e7d3ac",
    );
    add(
      "compact hollyhock stamen anther",
      [
        tip,
        [tip[0], tip[1] + 0.012, tip[2]],
        [tip[0] + 0.004, tip[1] + 0.024, tip[2]],
      ],
      0.009,
      "#d3b455",
      0.006,
    );
  }
  for (let j = 0; j < 16; j++) {
    const a = (j * Math.PI) / 8;
    add(
      "filiform style branch",
      [
        [0, 0.44, 0],
        [Math.sin(a) * 0.025, 0.48, Math.cos(a) * 0.025],
        [Math.sin(a) * 0.042, 0.515 + 0.012 * Math.sin(j), Math.cos(a) * 0.042],
      ],
      0.0035,
      "#d7c9ac",
      0.0025,
    );
  }
}
