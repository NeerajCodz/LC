import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  anchoredHeadCluster,
  specimenClusterPoint,
} from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export function magnoliaReceptacleRadius(v: number) {
  const t = Math.max(0, Math.min(1, (v - 0.3) / 0.68));
  return 0.17 + 0.03 * Math.sin(v * Math.PI) - 0.14 * t * t * (3 - 2 * t);
}
export const MAGNOLIA_MODEL: SpecimenModel = {
  clusters: [{ ...SINGLE_CLUSTER, nod: 0.006 }],
  surfaces: [],
  organs: [],
};
MAGNOLIA_MODEL.surfaces.push({
  name: "receptacular neck",
  cluster: 0,
  role: "bract",
  tissue: "inner",
  periodic: true,
  thickness: 0.025,
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r = 0.075 + 0.095 * v;
    return [Math.sin(a) * r, -0.1 + 0.11 * v, Math.cos(a) * r];
  },
});
for (let i = 0; i < 9; i++) {
  const layer = Math.floor(i / 3),
    a = ((i % 3) * Math.PI * 2) / 3 + layer * 0.66,
    length = 1.15 - layer * 0.12,
    width = 0.49 - layer * 0.045;
  MAGNOLIA_MODEL.surfaces.push({
    name: "substantial tepal",
    cluster: 0,
    role: "petal",
    thickness: 0.027,
    flexible: true,
    cage: [4, 6],
    mobileCage: [2, 3],
    delay: layer * 0.045,
    compliance: 0.00002,
    shapeCompliance: 0.00027,
    sample: (u, v, stage) => {
      const open = stage * (1 - layer * 0.1),
        w =
          (2 * u - 1) *
          (0.005 + width * Math.sin(v * Math.PI) ** 0.62) *
          (0.32 + 0.68 * open),
        r =
          0.18 * (1 - v * 0.65) +
          0.19 * (1 - open) * Math.sin(v * Math.PI) +
          length * open * Math.sin(v * 1.07);
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        layer * 0.045 +
          length * v * (1 - 0.73 * open) +
          0.16 * (2 * u - 1) ** 2 * Math.sin(v * Math.PI) * open,
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
MAGNOLIA_MODEL.surfaces.push({
  name: "elongate floral receptacle",
  cluster: 0,
  role: "bract",
  tissue: "disc",
  periodic: true,
  thickness: 0.025,
  contactObstacle: true,
  cage: [10, 6],
  mobileCage: [6, 4],
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r = magnoliaReceptacleRadius(v);
    return [Math.sin(a) * r, 0.01 + 0.5 * v, Math.cos(a) * r];
  },
});
for (let i = 0; i < 2; i++) {
  const a = i * Math.PI + 0.32;
  MAGNOLIA_MODEL.surfaces.push({
    name: "protective bud bract",
    cluster: 0,
    role: "bract",
    tissue: "inner",
    thickness: 0.018,
    sample: (u, v, stage) => {
      const w = (2 * u - 1) * (0.005 + 0.35 * Math.sin(v * Math.PI) ** 0.7),
        r =
          0.13 * (1 - v * 0.7) +
          0.3 * (1 - stage) * Math.sin(v * Math.PI) +
          0.48 * stage * v;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        -0.045 + 0.93 * v * (1 - 1.12 * stage),
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
MAGNOLIA_MODEL.instances = [
  {
    name: "spiral stamens",
    cluster: 0,
    surfaces: [],
    organs: floralStamens({
      count: 1,
      cluster: 0,
      radius: 0.07,
      height: 0.031,
      base: 0.003,
      foldedHeight: 0.022,
      filamentRadius: 0.004,
      filament: "#a67b90",
      anther: "#d8c698",
      antherLength: 0.135,
    }),
    poses: Array.from({ length: 179 }, (_, i) => {
      const a = i * 2.399963,
        y = 0.04 + (0.17 * i) / 179,
        r =
          magnoliaReceptacleRadius((y - 0.01) / 0.5) +
          0.012 -
          0.0525 * (0.86 + 0.14 * Math.sin(i * 0.61) ** 2);
      return {
        position: [Math.sin(a) * r, y, Math.cos(a) * r] as Vec3,
        foldedPosition: [
          Math.sin(a) * r * 0.72,
          y,
          Math.cos(a) * r * 0.72,
        ] as Vec3,
        rotation: [0, a, 0] as Vec3,
        scale: 0.86 + 0.14 * Math.sin(i * 0.61) ** 2,
        delay: 0.035,
        phase: i * 0.19,
      };
    }),
  },
  {
    name: "spiral carpels",
    cluster: 0,
    surfaces: [],
    organs: [
      {
        name: "individual carpel ovary",
        cluster: 0,
        points: [
          [0, 0, 0],
          [0, 0.023, 0.008],
          [0, 0.046, 0.012],
        ],
        radius: 0.014,
        endRadius: 0.008,
        color: "#87946b",
      },
      {
        name: "recurved carpel style",
        cluster: 0,
        points: [
          [0, 0.04, 0.012],
          [0, 0.073, 0.016],
          [0, 0.081, 0.03],
        ],
        radius: 0.005,
        endRadius: 0.003,
        color: "#b8ba89",
      },
    ],
    poses: Array.from({ length: 60 }, (_, i) => {
      const a = i * 2.399963,
        y = 0.25 + (0.21 * i) / 60,
        r =
          magnoliaReceptacleRadius((y - 0.01) / 0.5) +
          0.012 -
          0.0525 * (0.86 + 0.14 * Math.sin(i * 0.61) ** 2);
      return {
        position: [Math.sin(a) * r, y, Math.cos(a) * r] as Vec3,
        foldedPosition: [
          Math.sin(a) * r * 0.82,
          y * 0.8,
          Math.cos(a) * r * 0.82,
        ] as Vec3,
        rotation: [0, a, 0] as Vec3,
        scale: 0.84 + 0.12 * Math.sin(i) ** 2,
        delay: 0,
        phase: i * 0.21,
      };
    }),
  },
];

MAGNOLIA_MODEL.clusters[0] = anchoredHeadCluster(0.65, -0.1, 1, 0.006);
export const MAGNOLIA_HEAD_CENTER = specimenClusterPoint(
  MAGNOLIA_MODEL.clusters[0],
  [0, 0.31, 0],
);
