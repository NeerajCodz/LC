import type { Vec3 } from "@/lib/flowers/types";
import {
  radialTube,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export const CAMELLIA_MODEL: SpecimenModel = {
  clusters: [
    { position: [0, 0, 0], rotation: [0, 0, 0], scale: 0.89, nod: 0.008 },
    {
      position: [0.55, 0.2, 0.25],
      rotation: [0.2, 0.35, -0.15],
      scale: 0.3,
      nod: 0.009,
    },
  ],
  surfaces: [],
  organs: [],
};
export const CAMELLIA_STALKS: SpecimenOrgan[] = [
  {
    name: "woody bud branch",
    cluster: 0,
    points: [
      [0, -0.55, 0],
      [0.31, -0.02, 0.12],
      [0.55, 0.2, 0.25],
    ],
    radius: 0.041,
    endRadius: 0.021,
    color: "#80674e",
  },
];
for (let c = 0; c < 2; c++) {
  const age = c === 1 ? 0.1 : 1;
  for (let i = 0; i < 7; i++) {
    const inner = i >= 2,
      a = inner ? ((i - 2) * Math.PI * 2) / 5 + 0.32 : i * Math.PI,
      length = inner ? 0.8 : 0.95,
      root = inner ? 0.17 : 0.2,
      y = inner ? 0.14 : 0.025;
    CAMELLIA_MODEL.surfaces.push({
      name: "single-form petal",
      cluster: c,
      role: "petal",
      thickness: 0.019,
      flexible: true,
      cage: [4, 6],
      mobileCage: [2, 3],
      compliance: 0.000035,
      shapeCompliance: 0.0004,
      delay: inner ? 0.035 : 0,
      sample: (u, v, stage) => {
        const open = stage * age,
          w =
            (2 * u - 1) *
            (0.004 + (inner ? 0.35 : 0.4) * Math.sin(v * Math.PI) ** 0.65) *
            (0.36 + 0.64 * open),
          notch = 0.035 * Math.exp(-Math.pow((u - 0.5) * 13, 2)) * v ** 9,
          r =
            root * (1 - v * 0.65) +
            0.17 * (1 - open) * Math.sin(v * Math.PI) +
            length * open * (Math.sin(v * 1.16) - notch);
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          y +
            length * v * (0.72 + 0.28 * stage - 0.6 * open) +
            0.12 * (2 * u - 1) ** 2 * Math.sin(v * Math.PI) * open,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  for (let i = 0; i < 9; i++) {
    const inner = i >= 4,
      a = i * 2.399963,
      length = inner ? 0.62 : 0.48;
    CAMELLIA_MODEL.surfaces.push({
      name: "protective bracteole or sepal",
      cluster: c,
      role: "calyx",
      thickness: 0.017,
      contactObstacle: true,
      cage: [2, 3],
      mobileCage: [1, 2],
      sample: (u, v, stage) => {
        const open = stage * age,
          w = (2 * u - 1) * (0.004 + 0.13 * Math.sin(v * Math.PI)),
          closed = 0.12 * (1 - v * 0.6) + 0.26 * Math.sin(v * Math.PI) ** 0.75,
          r = closed * (1 - open) + (0.13 + 0.27 * v) * open;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          -0.04 + length * v * (1 - 1.17 * open),
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  CAMELLIA_MODEL.surfaces.push({
    name: "connate inner petal base",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.019,
    contactObstacle: true,
    cage: [8, 3],
    mobileCage: [4, 2],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.13 + 0.04 * v;
      return [Math.sin(a) * r, 0.14 * v, Math.cos(a) * r];
    },
  });
  CAMELLIA_MODEL.surfaces.push({
    name: "connate filament collar",
    cluster: c,
    role: "tube",
    tissue: "inner",
    periodic: true,
    thickness: 0.012,
    contactObstacle: true,
    cage: [8, 4],
    mobileCage: [6, 3],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.073 + 0.06 * v;
      return [Math.sin(a) * r, 0.045 + 0.18 * v, Math.cos(a) * r];
    },
  });
  CAMELLIA_MODEL.surfaces.push({
    name: "superior ovary",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.014,
    sample: radialTube(0.045, 0.1, 3),
  });
  CAMELLIA_MODEL.organs.push(
    ...floralStamens({
      count: 64,
      cluster: c,
      radius: 0.19,
      height: 0.35,
      base: 0.19,
      foldedHeight: 0.29,
      filamentRadius: 0.0045,
      filament: "#eddda3",
      anther: "#d9b145",
      antherLength: 0.047,
      spiral: true,
    }),
  );
  CAMELLIA_MODEL.organs.push({
    name: "central style",
    cluster: c,
    points: [
      [0, 0.08, 0],
      [0, 0.28, 0],
      [0, 0.4, 0],
    ],
    foldedPoints: [
      [0, 0.08, 0],
      [0, 0.24, 0],
      [0, 0.35, 0],
    ],
    radius: 0.007,
    endRadius: 0.006,
    color: "#b6c98b",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    CAMELLIA_MODEL.organs.push({
      name: "style lobe",
      cluster: c,
      points: [
        [0, 0.395, 0],
        [Math.sin(a) * 0.017, 0.44, Math.cos(a) * 0.017],
        [Math.sin(a) * 0.027, 0.463, Math.cos(a) * 0.027],
      ],
      foldedPoints: [
        [0, 0.345, 0],
        [Math.sin(a) * 0.009, 0.37, Math.cos(a) * 0.009],
        [Math.sin(a) * 0.014, 0.383, Math.cos(a) * 0.014],
      ],
      radius: 0.005,
      endRadius: 0.007,
      color: "#b9c787",
    });
  }
}
