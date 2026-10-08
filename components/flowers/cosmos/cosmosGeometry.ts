import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  radialTube,
  type SpecimenModel,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export const COSMOS_MODEL: SpecimenModel = {
  clusters: [SINGLE_CLUSTER],
  surfaces: [],
  organs: [],
};
for (let i = 0; i < 8; i++) {
  const a = (i * Math.PI) / 4;
  COSMOS_MODEL.surfaces.push({
    name: "neuter ray ligule",
    cluster: 0,
    role: "petal",
    thickness: 0.011,
    flexible: true,
    cage: [5, 7],
    mobileCage: [3, 4],
    compliance: 0.000065,
    shapeCompliance: 0.00065,
    sample: (u, v, open) => {
      const w =
          (2 * u - 1) *
          (0.004 + 0.3 * Math.sin(v * Math.PI * 0.85) ** 0.65) *
          (0.35 + 0.65 * open),
        tooth =
          0.032 * (0.5 + 0.5 * Math.cos((u - 0.5) * Math.PI * 6)) * v ** 10,
        r =
          0.2 * (1 - v * 0.65) +
          0.14 * (1 - open) * Math.sin(v * Math.PI) +
          open * (0.72 * Math.sin(v * 1.35) - tooth);
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        0.045 +
          0.64 * v * (1 - 0.85 * open) +
          0.085 * (2 * u - 1) ** 2 * Math.sin(v * Math.PI) * open,
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
  COSMOS_MODEL.surfaces.push({
    name: "neuter ray corolla tube",
    cluster: 0,
    role: "tube",
    periodic: true,
    thickness: 0.006,
    sample: (u, v) => {
      const b = u * Math.PI * 2,
        r = 0.014 + 0.003 * v;
      return [
        Math.sin(a) * 0.2 + Math.sin(b) * r,
        0.012 + 0.044 * v,
        Math.cos(a) * 0.2 + Math.cos(b) * r,
      ];
    },
  });
}
for (let rank = 0; rank < 2; rank++)
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4 + rank * 0.24;
    COSMOS_MODEL.surfaces.push({
      name: rank ? "inner involucral bract" : "outer involucral bract",
      cluster: 0,
      role: "calyx",
      thickness: 0.012,
      contactObstacle: true,
      cage: [2, 3],
      mobileCage: [1, 2],
      sample: (u, v, open) => {
        const w =
            (2 * u - 1) *
            (0.004 + (rank ? 0.09 : 0.055) * Math.sin(v * Math.PI) ** 0.7),
          r =
            0.2 * (1 - v * 0.6) +
            0.13 * (1 - open) * Math.sin(v * Math.PI) +
            (rank ? 0.12 : 0.18) * open * v;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          -0.08 + rank * 0.025 + 0.73 * v * (1 - 1.18 * open),
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
COSMOS_MODEL.surfaces.push({
  name: "head receptacle",
  cluster: 0,
  role: "calyx",
  periodic: true,
  thickness: 0.016,
  contactObstacle: true,
  cage: [8, 3],
  mobileCage: [6, 2],
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r = 0.028 + 0.2 * v;
    return [Math.sin(a) * r, -0.14 + 0.2 * v, Math.cos(a) * r];
  },
});
const diskSurfaces: SpecimenSurface[] = [
  {
    name: "disk corolla tube",
    cluster: 0,
    role: "tube",
    tissue: "disc",
    periodic: true,
    thickness: 0.003,
    sample: radialTube(0.012, 0.042, 5, 0.02),
  },
];
for (let i = 0; i < 5; i++) {
  const a = (i * Math.PI * 2) / 5;
  diskSurfaces.push({
    name: "disk corolla lobe",
    cluster: 0,
    role: "petal",
    tissue: "disc",
    thickness: 0.003,
    sample: (u, v, open) => {
      const w = (2 * u - 1) * (0.002 + 0.009 * Math.sin(v * Math.PI)),
        r = 0.02 + 0.014 * open * v;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        0.04 + 0.048 * v * (1 - 0.15 * open),
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
const diskOrgans = floralStamens({
  count: 5,
  cluster: 0,
  radius: 0.009,
  height: 0.063,
  base: 0.03,
  foldedHeight: 0.049,
  filamentRadius: 0.0018,
  antherLength: 0.016,
  filament: "#e4d39a",
  anther: "#ba9847",
});
for (const side of [-1, 1])
  diskOrgans.push({
    name: "disk style arm",
    cluster: 0,
    points: [
      [0, 0.06, 0],
      [side * 0.004, 0.084, 0],
      [side * 0.009, 0.097, 0],
    ],
    foldedPoints: [
      [0, 0.047, 0],
      [side * 0.003, 0.061, 0],
      [side * 0.004, 0.069, 0],
    ],
    radius: 0.0022,
    endRadius: 0.0018,
    color: "#f2d48d",
  });
COSMOS_MODEL.instances = [
  {
    name: "bisexual disk florets",
    cluster: 0,
    surfaces: diskSurfaces,
    organs: diskOrgans,
    poses: Array.from({ length: 80 }, (_, i) => {
      const a = i * 2.399963,
        r = 0.2 * Math.sqrt((i + 0.5) / 80);
      return {
        position: [
          Math.sin(a) * r,
          0.056 + 0.016 * (1 - r / 0.2),
          Math.cos(a) * r,
        ] as Vec3,
        foldedPosition: [
          Math.sin(a) * r * 0.72,
          0.065,
          Math.cos(a) * r * 0.72,
        ] as Vec3,
        rotation: [0, a, 0] as Vec3,
        scale: 0.85 + 0.12 * Math.sin(i * 0.71) ** 2,
        delay: 0.05 + 0.09 * (1 - r / 0.2),
        phase: i * 0.21,
      };
    }),
  },
];
