import type { Vec3 } from "@/lib/flowers/types";
import {
  anchoredHeadCluster,
  specimenClusterPoint,
  type SpecimenModel,
  type SpecimenOrgan,
  type SpecimenSurface,
  type SpecimenInstanceGroup,
} from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";

/** Authored single-row ray count; no fertile structures are attached to these rays. */
const rayAngle = (index: number) =>
  (index * Math.PI) / 10 + 0.014 * Math.sin(index * 2.17);
export function gazaniaLigule(index: number): SpecimenSurface["sample"] {
  const angle = rayAngle(index),
    length = 0.82 + 0.035 * Math.sin(index * 1.71);
  return (u, v, open) => {
    const across = 2 * u - 1;
    const width =
      across *
        (0.003 + 0.128 * Math.sin(v * Math.PI * 0.92) ** 0.72) *
        (0.16 + 0.84 * open) +
      0.012 * Math.sin(index * 2.7) * Math.sin(v * Math.PI) * open;
    const teeth = 0.016 * (0.5 + 0.5 * Math.cos(u * Math.PI * 6)) * v ** 12;
    const r =
      0.29 * (1 - v) * (1 - open) +
      (1 - open) * 0.09 * Math.sin(v * Math.PI) +
      open * (0.29 + length * v - teeth);
    const y =
      0.055 +
      (1 - open) * 0.43 * v +
      open *
        (0.06 * Math.sin(v * Math.PI) -
          0.035 * v * v +
          0.032 * across * across * Math.sin(v * Math.PI) +
          0.006 *
            (1 - across * across) *
            Math.cos(across * Math.PI * 3) *
            Math.sin(v * Math.PI) +
          0.008 * Math.sin(index * 1.31) * across * Math.sin(v * Math.PI));
    return [
      Math.sin(angle) * r + Math.cos(angle) * width,
      y,
      Math.cos(angle) * r - Math.sin(angle) * width,
    ];
  };
}
const diskTube = (maturity: number): SpecimenSurface => ({
  name: "five-lobed disk corolla",
  cluster: 0,
  role: "tube",
  tissue: "disc",
  periodic: true,
  thickness: 0.0028,
  overviewColumns: 15,
  sample: (u, v, open) => {
    const a = u * Math.PI * 2,
      lobe = 0.5 + 0.5 * Math.cos(a * 5),
      development = open * maturity;
    const closedRadius = 0.008 + 0.009 * Math.sin(v * Math.PI) - 0.003 * v ** 8;
    const openRadius = 0.009 + 0.015 * v * v + 0.003 * lobe * v ** 8;
    const r = closedRadius + (openRadius - closedRadius) * development;
    return [
      Math.sin(a) * r,
      v * (0.063 + 0.018 * development) + 0.018 * lobe * v ** 9 * development,
      Math.cos(a) * r,
    ];
  },
});
const diskOrgans = floralStamens({
  count: 5,
  overviewSides: 3,
  cluster: 0,
  radius: 0.008,
  height: 0.071,
  base: 0.028,
  foldedHeight: 0.047,
  filamentRadius: 0.0017,
  antherLength: 0.017,
  filament: "#e9b841",
  anther: "#c17619",
});
diskOrgans.push({
  name: "disk pistil style",
  cluster: 0,
  overviewSides: 3,
  points: [
    [0, 0.009, 0],
    [0, 0.042, 0],
    [0, 0.069, 0],
  ],
  foldedPoints: [
    [0, 0.009, 0],
    [0, 0.022, 0],
    [0, 0.039, 0],
  ],
  radius: 0.0022,
  endRadius: 0.002,
  color: "#efc34e",
});
for (const side of [-1, 1])
  diskOrgans.push({
    name: "disk style arm",
    cluster: 0,
    overviewSides: 3,
    points: [
      [0, 0.063, 0],
      [side * 0.004, 0.09, 0],
      [side * 0.009, 0.101, 0.002],
    ],
    foldedPoints: [
      [0, 0.036, 0],
      [side * 0.002, 0.049, 0],
      [side * 0.004, 0.058, 0],
    ],
    radius: 0.002,
    endRadius: 0.0016,
    color: "#ffcc4e",
  });
/** A photographed flowering stage: older outside florets surround retained young inner buds. */
const diskCohorts = [1, 0.48, 0.08].map(
  (maturity, cohort): SpecimenInstanceGroup => ({
    name: [
      "open marginal disk florets",
      "opening intermediate disk florets",
      "young central disk florets",
    ][cohort],
    cluster: 0,
    surfaces: [diskTube(maturity)],
    organs: diskOrgans.map((organ) => {
      const height = 0.5 + 0.5 * maturity;
      const transform = (points: Vec3[]) =>
        points.map(([x, y, z]): Vec3 => [x * height, y * height, z * height]);
      return {
        ...organ,
        points: transform(organ.points),
        foldedPoints: organ.foldedPoints
          ? transform(organ.foldedPoints)
          : undefined,
        radius: organ.radius * height,
        endRadius:
          organ.endRadius === undefined ? undefined : organ.endRadius * height,
      };
    }),
    poses: Array.from({ length: 96 }, (_, i) => {
      const a = i * 2.399963229728653,
        r = 0.265 * Math.sqrt((i + 0.5) / 96);
      return {
        position: [
          Math.sin(a) * r,
          0.045 + 0.022 * (1 - r / 0.265),
          Math.cos(a) * r,
        ] as Vec3,
        foldedPosition: [
          Math.sin(a) * r * 0.78,
          0.054,
          Math.cos(a) * r * 0.78,
        ] as Vec3,
        rotation: [0, a, 0] as Vec3,
        scale: 0.86 + 0.11 * Math.sin(i * 0.71) ** 2,
        delay: 0.06 + 0.17 * (1 - r / 0.265),
        phase: i * 0.37,
      };
    }).filter((pose) => {
      const r = Math.hypot(pose.position[0], pose.position[2]);
      return cohort === 0
        ? r >= 0.195
        : cohort === 1
          ? r >= 0.105 && r < 0.195
          : r < 0.105;
    }),
  }),
);
export const GAZANIA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [anchoredHeadCluster(0.77, -0.18, 1, 0.012)],
  surfaces: [],
  organs: [
    {
      name: "solid disk receptacle",
      cluster: 0,
      overviewSides: 24,
      points: [
        [0, -0.04, 0],
        [0, 0.015, 0],
        [0, 0.068, 0],
      ],
      radius: 0.28,
      endRadius: 0.28,
      color: "#aa873b",
    },
  ],
  instances: diskCohorts,
};
for (let i = 0; i < 20; i++) {
  const a = rayAngle(i);
  GAZANIA_MODEL.surfaces.push({
    name: "sterile ray ligule",
    cluster: 0,
    role: "petal",
    thickness: 0.011,
    flexible: true,
    cage: [3, 5],
    mobileCage: [2, 3],
    compliance: 0.000055,
    shapeCompliance: 0.0005,
    delay: (i % 3) * 0.012,
    sample: gazaniaLigule(i),
  });
  GAZANIA_MODEL.surfaces.push({
    name: "sterile ray basal tube",
    cluster: 0,
    role: "tube",
    periodic: true,
    thickness: 0.003,
    overviewColumns: 8,
    sample: (u, v) => {
      const t = u * Math.PI * 2,
        r = 0.275 + 0.015 * v;
      return [
        Math.sin(a) * r + Math.cos(t) * 0.008,
        0.018 + 0.037 * v,
        Math.cos(a) * r + Math.sin(t) * 0.008,
      ];
    },
  });
}
GAZANIA_MODEL.surfaces.push({
  name: "connate involucral cup",
  cluster: 0,
  role: "calyx",
  periodic: true,
  thickness: 0.018,
  overviewColumns: 24,
  contactObstacle: true,
  cage: [10, 4],
  mobileCage: [6, 3],
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r =
        0.033 +
        0.246 * Math.sin(v * Math.PI * 0.5) +
        0.0025 * Math.cos(a * 12) * Math.sin(v * Math.PI);
    return [Math.sin(a) * r, -0.18 + 0.2 * v, Math.cos(a) * r];
  },
});
for (let i = 0; i < 24; i++) {
  const a = (i * Math.PI) / 12;
  GAZANIA_MODEL.surfaces.push({
    name: "free phyllary apex",
    cluster: 0,
    role: "calyx",
    thickness: 0.01,
    sample: (u, v, open) => {
      const w = (2 * u - 1) * (0.002 + 0.035 * Math.sin(v * Math.PI) ** 0.8);
      const r =
        0.279 * (1 - v * 0.97) * (1 - open) + (0.279 + 0.056 * v) * open;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        0.02 + v * (0.45 * (1 - open) + 0.055 * open),
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
export const GAZANIA_STALKS: SpecimenOrgan[] = [];
export const GAZANIA_HEAD_CENTER = specimenClusterPoint(
  GAZANIA_MODEL.clusters[0],
  [0, 0.08, 0],
);
