import type { Vec3 } from "@/lib/flowers/types";
import {
  radialTube,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export const LISIANTHUS_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.44, 0.03, 0.08],
      rotation: [0.5, -0.2, 0.1],
      scale: 0.57,
      nod: 0.02,
    },
    {
      position: [0.4, 0.26, 0.12],
      rotation: [0.65, 0.25, -0.08],
      scale: 0.56,
      nod: 0.019,
    },
    {
      position: [-0.04, 0.55, -0.15],
      rotation: [0.32, 0, 0.1],
      scale: 0.52,
      nod: 0.018,
    },
    {
      position: [0.36, 0.62, 0.31],
      rotation: [0.3, 0.1, 0],
      scale: 0.29,
      nod: 0.014,
    },
    {
      position: [-0.44, 0.47, 0.3],
      rotation: [0.26, -0.1, 0],
      scale: 0.28,
      nod: 0.014,
    },
  ],
  surfaces: [],
  organs: [],
};
export const LISIANTHUS_STALKS: SpecimenOrgan[] = LISIANTHUS_MODEL.clusters.map(
  (c) => ({
    name: "cyme pedicel",
    cluster: 0,
    points: [
      [0, -0.58, 0],
      [c.position[0] * 0.6, c.position[1] - 0.3, c.position[2] * 0.55],
      c.position,
    ] as Vec3[],
    radius: 0.016,
    endRadius: 0.011,
    color: "#7e9b74",
  }),
);
for (let c = 0; c < 5; c++) {
  const young = c >= 3,
    delay = c * 0.025;
  LISIANTHUS_MODEL.surfaces.push({
    name: "short fused corolla base",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.012,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 2],
    delay,
    sample: (u, v, stage) => {
      const a = u * Math.PI * 2,
        open = stage * (young ? 0.12 : 1),
        r = 0.046 + (0.047 + 0.05 * open) * v;
      return [Math.sin(a) * r, 0.15 * v, Math.cos(a) * r];
    },
  });
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    LISIANTHUS_MODEL.surfaces.push({
      name: "corolla lobe",
      cluster: c,
      role: "petal",
      thickness: 0.011,
      flexible: true,
      cage: [3, 5],
      mobileCage: [1, 3],
      delay,
      compliance: 0.000055,
      shapeCompliance: 0.00055,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.12 : 1),
          w =
            (2 * u - 1) *
            (0.004 + 0.37 * Math.sin(v * Math.PI) ** 0.65) *
            (0.36 + 0.64 * open),
          angle = a + 0.32 * v * (1 - open),
          r =
            (0.093 + 0.05 * open) * (1 - v * 0.62) +
            0.14 * (1 - open) * Math.sin(v * Math.PI) +
            0.68 * open * Math.sin(v * 1.13);
        return [
          Math.sin(angle) * r + Math.cos(angle) * w,
          0.14 +
            0.79 * v * (1 - 0.5 * open) +
            0.12 * (2 * u - 1) ** 2 * Math.sin(v * Math.PI) * open +
            0.013 * Math.sin(v * 36 + i) * open,
          Math.cos(angle) * r - Math.sin(angle) * w,
        ];
      },
    });
  }
  const ovary = radialTube(0.037, 0.087, 4);
  LISIANTHUS_MODEL.surfaces.push({
    name: "superior ovary",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.012,
    sample: ovary,
  });
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / 5;
    LISIANTHUS_MODEL.surfaces.push({
      name: "linear calyx tooth",
      cluster: c,
      role: "calyx",
      thickness: 0.009,
      contactObstacle: true,
      cage: [2, 3],
      mobileCage: [1, 2],
      sample: (u, v, stage) => {
        const width = (2 * u - 1) * (0.003 + 0.025 * Math.sin(v * Math.PI)),
          r = 0.049 + (0.05 + 0.11 * stage) * v;
        return [
          Math.sin(a) * r + Math.cos(a) * width,
          -0.022 + 0.48 * v,
          Math.cos(a) * r - Math.sin(a) * width,
        ];
      },
    });
  }
  LISIANTHUS_MODEL.organs.push(
    ...floralStamens({
      count: 5,
      cluster: c,
      radius: 0.081,
      height: 0.35,
      base: 0.135,
      foldedHeight: 0.28,
      filament: "#dfdcae",
      anther: "#cdb544",
      antherLength: 0.075,
    }),
  );
  LISIANTHUS_MODEL.organs.push({
    name: "central style",
    cluster: c,
    points: [
      [0, 0.07, 0],
      [0, 0.24, 0],
      [0, 0.405, 0],
    ],
    foldedPoints: [
      [0, 0.07, 0],
      [0, 0.21, 0],
      [0, 0.34, 0],
    ],
    radius: 0.007,
    endRadius: 0.007,
    color: "#b7c88c",
  });
  for (const side of [-1, 1])
    LISIANTHUS_MODEL.organs.push({
      name: "stigma lobe",
      cluster: c,
      points: [
        [0, 0.398, 0],
        [side * 0.019, 0.423, 0],
        [side * 0.027, 0.44, 0],
      ],
      foldedPoints: [
        [0, 0.34, 0],
        [side * 0.011, 0.36, 0],
        [side * 0.017, 0.372, 0],
      ],
      radius: 0.012,
      endRadius: 0.015,
      flatten: 0.48,
      color: "#c3d29b",
    });
}
