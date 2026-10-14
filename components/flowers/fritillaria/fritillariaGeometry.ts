import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

export const FRITILLARIA_FLOWER_POSITIONS: Vec3[] = Array.from(
  { length: 5 },
  (_, i) => {
    const a = (i * Math.PI * 2) / 5;
    return [Math.sin(a) * 0.29, 0.53 + 0.015 * Math.sin(i), Math.cos(a) * 0.29];
  },
);
/** Six distinct overlapping thick blades form the bell; there is no fused tube. */
export function fritillariaTepal(index: number) {
  const a = (index * Math.PI) / 3;
  return (u: number, v: number, open: number): Vec3 => {
    const w = 2 * u - 1,
      width =
        w *
        (0.006 + 0.12 * Math.sin(v * Math.PI * 0.88) ** 0.7) *
        (0.42 + 0.58 * open),
      folded = 0.018 + 0.047 * (1 - v) + 0.029 * Math.sin(Math.PI * v),
      r =
        folded * (1 - open) +
        (0.063 + 0.191 * Math.sin(v * Math.PI * 0.53)) * open;
    return [
      Math.sin(a) * r + Math.cos(a) * width,
      0.025 + (0.53 + 0.2 * open) * v - 0.067 * w * w * v ** 7 * open,
      Math.cos(a) * r - Math.sin(a) * width,
    ];
  };
}
function organPose(points: Vec3[], open: number): Vec3[] {
  return points.map(([x, y, z]) => [
    x * (0.45 + 0.55 * open),
    y * (0.52 + 0.48 * open),
    z * (0.45 + 0.55 * open),
  ]);
}
export const FRITILLARIA_STALKS: SpecimenOrgan[] = [
  {
    name: "bare upper crown imperial axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0, 0.43, 0],
      [0, 0.74, 0],
    ],
    radius: 0.035,
    endRadius: 0.024,
    color: "#739051",
  },
  ...FRITILLARIA_FLOWER_POSITIONS.map((p): SpecimenOrgan => ({
    name: "nodding crown imperial pedicel",
    cluster: 0,
    points: [[0, 0.48, 0], [p[0] * 0.65, 0.63, p[2] * 0.65], p],
    radius: 0.021,
    endRadius: 0.014,
    color: "#8d9c5a",
  })),
];
export const FRITILLARIA_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...FRITILLARIA_FLOWER_POSITIONS.map((position, i) => ({
      position,
      rotation: [Math.PI + 0.08, (i * Math.PI * 2) / 5, 0] as Vec3,
      scale: 0.86,
      nod: 0.025,
    })),
  ],
  surfaces: [],
  organs: [...FRITILLARIA_STALKS],
};
for (let i = 0; i < 12; i++) {
  const a = (i * Math.PI) / 6;
  FRITILLARIA_MODEL.surfaces.push({
    name: "narrow upright crown bract",
    cluster: 0,
    role: "bract",
    tissue: "leaf",
    thickness: 0.012,
    overviewColumns: 4,
    overviewRows: 4,
    flexible: true,
    cage: [2, 4],
    mobileCage: [1, 2],
    sample: (u, v): Vec3 => {
      const w = (2 * u - 1) * (0.004 + 0.041 * Math.sin(Math.PI * v) ** 0.7),
        r = 0.036 + 0.27 * v;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        0.68 + 0.52 * v - 0.16 * v * v,
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
for (let i = 0; i < 5; i++) {
  const cluster = i + 1,
    delay = i * 0.017;
  for (let j = 0; j < 6; j++) {
    FRITILLARIA_MODEL.surfaces.push({
      name: "separate bell tepal",
      cluster,
      role: "petal",
      sample: fritillariaTepal(j),
      thickness: 0.016,
      flexible: true,
      delay,
      pinMidrib: true,
      cage: [4, 5],
      mobileCage: [2, 3],
      overviewColumns: 6,
      overviewRows: 4,
      compliance: 0.000025,
      shapeCompliance: 0.0003,
    });
    const a = (j * Math.PI) / 3,
      full = fritillariaTepal(j)(0.5, 0.1, 1),
      bud = fritillariaTepal(j)(0.5, 0.1, 0),
      points = (p: Vec3): Vec3[] =>
        [-0.022, 0, 0.022].map((d) => [
          p[0] - Math.sin(a) * 0.01,
          p[1] + d,
          p[2] - Math.cos(a) * 0.01,
        ]);
    FRITILLARIA_MODEL.organs.push({
      name: "pale basal nectary",
      cluster,
      bloomMorph: true,
      points: points(full),
      foldedPoints: points(bud),
      radius: 0.026,
      foldedRadius: 0.02,
      endRadius: 0.018,
      flatten: 0.32,
      color: "#ede3cf",
    });
  }
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
      cluster,
      bloomMorph: true,
      points,
      foldedPoints: organPose(points, 0),
      foldedRadius: radius * 0.6,
      radius,
      endRadius,
      color,
      flatten,
    };
    FRITILLARIA_MODEL.organs.push(organ);
    return organ;
  };
  add(
    "superior crown imperial ovary",
    [
      [0, 0.018, 0],
      [0, 0.085, 0],
      [0, 0.14, 0],
    ],
    0.025,
    "#acb574",
    0.021,
  );
  add(
    "exserted crown imperial style",
    [
      [0, 0.11, 0],
      [0, 0.43, 0],
      [0, 0.82, 0],
    ],
    0.009,
    "#d0cd9b",
    0.007,
  );
  for (let j = 0; j < 6; j++) {
    const a = (j * Math.PI) / 3,
      y = 0.615 + 0.016 * Math.sin(j),
      tip: Vec3 = [Math.sin(a) * 0.058, y, Math.cos(a) * 0.058];
    const filament = add(
      "crown imperial stamen filament",
      [
        fritillariaTepal(j)(0.5, 1 / 32, 1),
        [Math.sin(a) * 0.052, 0.34, Math.cos(a) * 0.052],
        tip,
      ],
      0.006,
      "#e1c997",
      0.004,
    );
    // Epitepalous insertion uses the same midrib landmark in both bloom poses.
    filament.foldedPoints![0] = fritillariaTepal(j)(0.5, 1 / 32, 0);
    for (const side of [-1, 1])
      add(
        "crown imperial stamen anther chamber",
        [
          tip,
          [
            tip[0] + Math.cos(a) * side * 0.007,
            y + 0.047,
            tip[2] - Math.sin(a) * side * 0.007,
          ],
          [
            tip[0] + Math.cos(a) * side * 0.005,
            y + 0.092,
            tip[2] - Math.sin(a) * side * 0.005,
          ],
        ],
        0.011,
        "#99794d",
        0.007,
        0.68,
      );
  }
  for (let j = 0; j < 3; j++) {
    const a = (j * Math.PI * 2) / 3;
    add(
      "tripartite stigma division",
      [
        [0, 0.815, 0],
        [Math.sin(a) * 0.019, 0.845, Math.cos(a) * 0.019],
        [Math.sin(a) * 0.034, 0.862, Math.cos(a) * 0.034],
      ],
      0.009,
      "#bdbb8c",
      0.006,
    );
  }
}
