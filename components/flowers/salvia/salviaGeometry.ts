import type { Vec3 } from "@/lib/flowers/types";
import { Euler } from "three";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

/** One circumference: upper hood and three small lower lobes are the actual tube rim. */
export function salviaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.045 : 1),
    a = u * Math.PI * 2,
    limb = Math.max(0, (v - 0.66) / 0.34),
    upper = Math.max(0, Math.cos(a)),
    lower = Math.max(0, -Math.cos(a)),
    lowerLobes = 0.68 + 0.32 * Math.cos(3 * (a - Math.PI)),
    closed = 0.018 + 0.024 * Math.sin(Math.PI * v),
    rx =
      closed * (1 - open) +
      (0.035 +
        0.021 * Math.sin(Math.PI * v) +
        limb * limb * (0.034 - 0.027 * upper + 0.034 * lower)) *
        open,
    ry =
      closed * (1 - open) +
      (0.035 + 0.024 * Math.sin(Math.PI * v) + 0.075 * limb * limb) * open;
  return [
    Math.sin(a) * rx,
    0.035 * v * v -
      0.035 * open * Math.sin(Math.PI * v) +
      Math.cos(a) * ry +
      0.008 * open * limb * limb * Math.sin(3 * a),
    (0.69 + 0.15 * open) * v +
      limb * limb * open * (0.19 * upper ** 4 + 0.075 * lower * lowerLobes),
  ];
}
export function salviaCalyx(u: number, v: number): Vec3 {
  const a = u * Math.PI * 2,
    upper = Math.max(0, Math.cos(a)),
    lower = Math.max(0, -Math.cos(a)),
    rib = 1 + 0.025 * Math.cos(8 * a) * Math.sin(Math.PI * v),
    r = (0.04 + 0.052 * Math.sin(Math.PI * v) + 0.065 * v * v) * rib;
  return [
    Math.sin(a) * r,
    Math.cos(a) * r,
    0.37 * v +
      v ** 4 *
        (0.12 * upper ** 2 + 0.08 * lower * (0.5 + 0.5 * Math.cos(2 * a))),
  ];
}
export const SALVIA_HEAD_CENTER: Vec3 = [0, 0.55, 0.08];
export const SALVIA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [
    SINGLE_CLUSTER,
    ...Array.from({ length: 20 }, (_, i) => {
      const tier = Math.floor(i / 4),
        a =
          ((i % 4) * Math.PI) / 2 +
          ((tier % 2) * Math.PI) / 4 +
          0.13 * Math.sin(i * 1.7),
        pitch = 0.08 + tier * 0.14 + 0.17 * Math.sin(i * 1.7 - 0.9),
        rotation = new Euler(-pitch, a, 0, "YXZ").reorder("XYZ");
      return {
        position: [
          Math.sin(a) * (0.055 + 0.008 * Math.sin(i * 2.4)),
          0.12 + tier * 0.18 + 0.018 * Math.sin(i * 2.1),
          Math.cos(a) * (0.055 + 0.008 * Math.sin(i * 2.4)),
        ] as Vec3,
        rotation: [rotation.x, rotation.y, rotation.z] as Vec3,
        scale:
          tier === 4
            ? 0.36
            : (0.6 - tier * 0.025) * (1 + 0.035 * Math.sin(i * 2.7)),
        nod: 0.012,
      };
    }),
  ],
  surfaces: [],
  organs: [],
};
export const SALVIA_STALKS: SpecimenOrgan[] = [
  {
    name: "salvia terminal spike axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0, 0.48, 0],
      [0, 0.89, 0],
    ],
    radius: 0.025,
    endRadius: 0.01,
    color: "#748b4c",
  },
  ...SALVIA_MODEL.clusters.slice(1).map((c): SpecimenOrgan => ({
    name: "salvia verticillaster pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] - 0.015, 0],
      [c.position[0] * 0.5, c.position[1], c.position[2] * 0.5],
      c.position,
    ],
    radius: 0.009,
    endRadius: 0.006,
    color: "#8f7040",
  })),
];
SALVIA_MODEL.organs.push(...SALVIA_STALKS);
for (let c = 1; c < SALVIA_MODEL.clusters.length; c++) {
  const young = c > 16,
    maturity = (o: number) => o * (young ? 0.045 : 1),
    delay = Math.floor((c - 1) / 4) * 0.035;
  SALVIA_MODEL.surfaces.push(
    {
      name: "continuous bilabiate hooded salvia corolla",
      cluster: c,
      role: "tube",
      outerSide: -1,
      periodic: true,
      sample: (u, v, o) => salviaCorolla(u, v, o, young),
      thickness: 0.009,
      flexible: true,
      delay,
      cage: [12, 4],
      mobileCage: [8, 2],
      overviewColumns: 16,
      overviewRows: 8,
      minimumRows: 12,
      compliance: 0.000024,
      shapeCompliance: 0.0002,
    },
    {
      name: "persistent scarlet bilabiate salvia calyx",
      cluster: c,
      role: "calyx",
      periodic: true,
      sample: salviaCalyx,
      thickness: 0.012,
      overviewColumns: 16,
      overviewRows: 5,
    },
  );
  const add = (
    name: string,
    points: (o: number) => Vec3[],
    radius: number,
    color: string,
    endRadius = radius * 0.6,
    flatten = 1,
  ) => {
    // The internal organs bend with the continuous tube and pack below its furled rim.
    const contained = (o: number) =>
      points(o).map((p): Vec3 => {
        const z = p[2] * (0.85 + 0.15 * o),
          t = Math.max(0, Math.min(1, z / (0.69 + 0.15 * o))),
          width = 0.72 + 0.28 * o;
        return [
          p[0] * width,
          p[1] * width - 0.035 * o * Math.sin(Math.PI * t),
          z,
        ];
      });
    SALVIA_MODEL.organs.push({
      name,
      cluster: c,
      bloomMorph: true,
      points: contained(maturity(1)),
      foldedPoints: contained(0),
      radius,
      foldedRadius: radius * 0.8,
      endRadius,
      color,
      flatten,
    });
  };
  for (const side of [-1, 1]) {
    add(
      "included salvia filament",
      (o) => [
        [side * 0.028, 0.02, 0.31],
        [side * 0.024, 0.025 + 0.035 * o, 0.57 + 0.1 * o],
        [side * 0.018, 0.026 + 0.05 * o, 0.63 + 0.12 * o],
      ],
      0.004,
      "#e8b29b",
    );
    add(
      "salvia staminal connective",
      (o) => [
        [side * 0.018, 0.026 + 0.05 * o, 0.63 + 0.12 * o],
        [side * 0.015, 0.033 + 0.045 * o, 0.68 + 0.13 * o],
        [side * 0.012, 0.038 + 0.045 * o, 0.71 + 0.13 * o],
      ],
      0.0045,
      "#cba098",
    );
    // Leave space for the anther's transported cross-section below the inner hood,
    // including the narrower cavity at half bloom, rather than fitting only its axis.
    add(
      "fertile salvia anther",
      (o) => [
        [side * 0.012, 0.038 + 0.045 * o, 0.69 + 0.13 * o],
        [side * 0.012, 0.042 + 0.045 * o, 0.712 + 0.13 * o],
        [side * 0.012, 0.041 + 0.045 * o, 0.735 + 0.13 * o],
      ],
      0.009,
      "#dac1a2",
      0.006,
      0.65,
    );
    add(
      "sterile salvia connective appendage",
      (o) => [
        [side * 0.018, 0.026 + 0.05 * o, 0.63 + 0.12 * o],
        [side * 0.024, 0.015 + 0.025 * o, 0.6 + 0.11 * o],
      ],
      0.004,
      "#c68c86",
    );
    add(
      "reduced salvia staminode",
      () => [
        [side * 0.025, -0.01, 0.25],
        [side * 0.026, 0.002, 0.3],
      ],
      0.0025,
      "#e4b3a1",
    );
  }
  add(
    "gynobasic salvia style",
    (o) => [
      [0, -0.006, 0.02],
      [0, 0.025 + 0.035 * o, 0.45 + 0.1 * o],
      [0, 0.036 + 0.045 * o, 0.72 + 0.16 * o],
    ],
    0.0035,
    "#e2c7af",
  );
  for (const side of [-1, 1])
    add(
      "bifid salvia stigma",
      (o) => [
        [0, 0.036 + 0.045 * o, 0.72 + 0.16 * o],
        [side * 0.009, 0.043 + 0.045 * o, 0.75 + 0.16 * o],
      ],
      0.003,
      "#c4a3b2",
    );
  for (let lobe = 0; lobe < 4; lobe++) {
    const a = (lobe * Math.PI) / 2;
    add(
      "four-lobed superior salvia ovary",
      () => [
        [Math.sin(a) * 0.014, Math.cos(a) * 0.014, 0.005],
        [Math.sin(a) * 0.019, Math.cos(a) * 0.019, 0.033],
        [Math.sin(a) * 0.012, Math.cos(a) * 0.012, 0.061],
      ],
      0.016,
      "#a7a56c",
    );
  }
}
