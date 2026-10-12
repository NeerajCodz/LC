import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";

export const PANSY_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.42, 0.32, 0.02],
      rotation: [1.13, -0.2, -0.15],
      scale: 0.8,
      nod: 0.035,
    },
    {
      position: [0.38, 0.62, -0.08],
      rotation: [1.02, 0.18, 0.11],
      scale: 0.74,
      nod: 0.028,
    },
    {
      position: [0.06, 0.12, 0.3],
      rotation: [1.3, 0.05, 0.1],
      scale: 0.85,
      nod: 0.04,
    },
    {
      position: [-0.06, 0.82, 0.05],
      rotation: [0.25, 0, -0.12],
      scale: 0.3,
      nod: 0.015,
    },
  ],
  surfaces: [],
  organs: [],
};
export const PANSY_STALKS: SpecimenOrgan[] = PANSY_MODEL.clusters.map((c) => ({
  name: "axillary peduncle",
  cluster: 0,
  points: [
    [0, -0.34, 0],
    [c.position[0] * 0.65, c.position[1] * 0.3, c.position[2] * 0.6],
    c.position,
  ],
  radius: 0.013,
  endRadius: 0.01,
  color: "#66865a",
}));
const angles = [2.58, 3.7, -1.14, 1.14, 0];
for (let c = 0; c < PANSY_MODEL.clusters.length; c++) {
  for (let i = 0; i < 5; i++) {
    const a = angles[i],
      upper = i < 2,
      lower = i === 4;
    PANSY_MODEL.surfaces.push({
      name: "unequal petal",
      cluster: c,
      role: "petal",
      tissue: upper ? "inner" : lower ? "guide" : undefined,
      thickness: 0.011,
      flexible: true,
      cage: [3, 4],
      mobileCage: [2, 3],
      compliance: 0.000075,
      shapeCompliance: 0.0009,
      delay: c * 0.02,
      sample: (u, v, stage) => {
        const open = c === 3 ? stage * 0.1 : stage,
          w =
            (2 * u - 1) *
            (0.006 +
              (lower ? 0.31 : upper ? 0.215 : 0.25) *
                Math.sin(Math.PI * v) ** 0.58) *
            (0.3 + 0.7 * open),
          r =
            0.02 +
            (upper ? 0.64 : lower ? 0.62 : 0.54) *
              Math.sin((v * Math.PI) / 2) *
              open +
            0.13 * (1 - open) * Math.sin(v * Math.PI),
          y =
            0.018 +
            0.48 * v * (1 - open) +
            0.11 * Math.sin(v * Math.PI) * open +
            0.018 * (2 * u - 1) ** 2 +
            0.008 * Math.sin(u * 19 + v * 9) * v;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          y,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
    const sa = (i * Math.PI * 2) / 5;
    PANSY_MODEL.surfaces.push({
      name: "sepal with basal appendage",
      cluster: c,
      role: "calyx",
      thickness: 0.013,
      sample: (u, v, open) => {
        const r = 0.055 + 0.22 * v * (0.45 + 0.55 * open),
          w = (2 * u - 1) * (0.004 + 0.04 * Math.sin(v * Math.PI));
        return [
          Math.sin(sa) * r + Math.cos(sa) * w,
          -0.035 - 0.09 * v,
          Math.cos(sa) * r - Math.sin(sa) * w,
        ];
      },
    });
  }
  PANSY_MODEL.surfaces.push({
    name: "lower petal nectar spur",
    cluster: c,
    role: "tube",
    periodic: true,
    tissue: "guide",
    thickness: 0.012,
    contactObstacle: true,
    cage: [4, 3],
    mobileCage: [3, 2],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.043 * (1 - 0.64 * v);
      return [
        Math.sin(a) * r,
        -0.025 - 0.31 * v,
        0.065 + 0.1 * Math.sin((v * Math.PI) / 2) + Math.cos(a) * r,
      ];
    },
  });
  PANSY_MODEL.organs.push(
    ...floralStamens({
      count: 5,
      cluster: c,
      radius: 0.028,
      height: 0.09,
      base: 0.018,
      filamentRadius: 0.006,
      antherLength: 0.045,
      filament: "#c7b789",
      anther: "#b9a756",
    }),
  );
  PANSY_MODEL.organs.push({
    name: "club-shaped stigma",
    cluster: c,
    points: [
      [0, 0.015, 0],
      [0, 0.09, 0.012],
      [0, 0.15, 0.026],
    ] as Vec3[],
    radius: 0.012,
    endRadius: 0.024,
    color: "#b9c08a",
  });
  PANSY_MODEL.organs.push({
    name: "blind spur apex",
    cluster: c,
    points: [
      [0, -0.3, 0.16],
      [0, -0.335, 0.165],
      [0, -0.345, 0.165],
    ],
    radius: 0.018,
    endRadius: 0.008,
    color: "#b59866",
  });
}
