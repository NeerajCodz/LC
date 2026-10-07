import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
const axis = (t: number): Vec3 => [
  0.035 + 0.78 * t * t,
  0.04 + 1.8 * t - 0.25 * t * t,
  0,
];
export function valleyBell(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.16 : 1),
    a = u * Math.PI * 2,
    tooth = (0.5 + 0.5 * Math.cos(a * 6)) ** 3;
  const mature =
    0.05 +
    0.19 * Math.sin(v * Math.PI * 0.82) ** 0.85 -
    0.018 * v +
    0.066 * tooth * v ** 9;
  const closed = 0.043 + 0.055 * Math.sin(Math.PI * v) - 0.022 * v;
  return [
    Math.cos(a) * (closed * (1 - open) + mature * open),
    0.55 * v - 0.027 * Math.cos(a * 6) * v ** 9 * open,
    Math.sin(a) * (closed * (1 - open) + mature * open),
  ];
}
export const LILY_OF_THE_VALLEY_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 11 }, (_, i) => {
    const p = axis(i / 10);
    return {
      position: [p[0] + 0.16, p[1] - 0.065, 0.11 + (i % 2) * 0.035] as Vec3,
      rotation: [3.02 + (i % 3) * 0.035, 0, -0.06] as Vec3,
      scale: i < 8 ? 0.33 - i * 0.008 : 0.2,
      nod: 0.032,
    };
  }),
  surfaces: [],
  organs: [],
};
export const LILY_OF_THE_VALLEY_STALKS: SpecimenOrgan[] = [
  {
    name: "arching raceme axis",
    cluster: 0,
    points: Array.from({ length: 9 }, (_, i) => axis(i / 8)),
    radius: 0.015,
    endRadius: 0.007,
    color: "#6d8a54",
  },
  ...LILY_OF_THE_VALLEY_MODEL.clusters.map((c, i) => {
    const p = axis(i / 10);
    return {
      name: "curved bell pedicel",
      cluster: 0,
      points: [p, [p[0] + 0.08, p[1] + 0.01, 0.055], c.position] as Vec3[],
      radius: 0.008,
      endRadius: 0.005,
      color: "#879967",
    };
  }),
];
for (let c = 0; c < 11; c++) {
  const delay = c * 0.018;
  LILY_OF_THE_VALLEY_MODEL.surfaces.push({
    name: "six-toothed bell",
    cluster: c,
    role: "tube",
    sample: (u, v, o) => valleyBell(u, v, o, c >= 8),
    periodic: true,
    thickness: 0.012,
    flexible: true,
    cage: [8, 5],
    mobileCage: [8, 3],
    delay,
    compliance: 0.000025,
    shapeCompliance: 0.00016,
  });
  LILY_OF_THE_VALLEY_MODEL.surfaces.push({
    name: "superior ovary",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.011,
    contactObstacle: true,
    cage: [6, 2],
    mobileCage: [4, 1],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.025 + 0.018 * Math.sin(Math.PI * v);
      return [Math.cos(a) * r, 0.022 + 0.12 * v, Math.sin(a) * r];
    },
  });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3,
      x = Math.sin(a) * 0.042,
      z = Math.cos(a) * 0.042;
    LILY_OF_THE_VALLEY_MODEL.organs.push({
      name: "included stamen filament",
      cluster: c,
      points: [
        [x * 0.5, 0.075, z * 0.5],
        [x * 0.9, 0.16, z * 0.9],
        [x, 0.23, z],
      ],
      foldedPoints: [
        [x * 0.4, 0.075, z * 0.4],
        [x * 0.55, 0.14, z * 0.55],
        [x * 0.6, 0.19, z * 0.6],
      ],
      radius: 0.005,
      endRadius: 0.004,
      color: "#d5d6ae",
    });
    LILY_OF_THE_VALLEY_MODEL.organs.push({
      name: "included anther",
      cluster: c,
      points: [
        [x, 0.23, z],
        [x, 0.25, z],
        [x, 0.273, z],
      ],
      foldedPoints: [
        [x * 0.6, 0.19, z * 0.6],
        [x * 0.6, 0.21, z * 0.6],
        [x * 0.6, 0.23, z * 0.6],
      ],
      radius: 0.012,
      endRadius: 0.008,
      flatten: 0.55,
      color: "#a1b179",
    });
  }
  LILY_OF_THE_VALLEY_MODEL.organs.push({
    name: "pistil style",
    cluster: c,
    points: [
      [0, 0.09, 0],
      [0, 0.2, 0],
      [0, 0.34, 0],
    ],
    foldedPoints: [
      [0, 0.09, 0],
      [0, 0.18, 0],
      [0, 0.29, 0],
    ],
    radius: 0.006,
    endRadius: 0.007,
    color: "#d5dcaa",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    LILY_OF_THE_VALLEY_MODEL.organs.push({
      name: "pistil stigma arm",
      cluster: c,
      points: [
        [0, 0.33, 0],
        [Math.sin(a) * 0.008, 0.342, Math.cos(a) * 0.008],
        [Math.sin(a) * 0.013, 0.348, Math.cos(a) * 0.013],
      ],
      foldedPoints: [
        [0, 0.28, 0],
        [Math.sin(a) * 0.005, 0.29, Math.cos(a) * 0.005],
        [Math.sin(a) * 0.007, 0.3, Math.cos(a) * 0.007],
      ],
      radius: 0.007,
      endRadius: 0.006,
      color: "#c9d5a0",
    });
  }
}
for (let i = 8; i < 11; i++) {
  const p = axis(i / 10);
  LILY_OF_THE_VALLEY_STALKS.push({
    name: "terminal membranous bract",
    cluster: 0,
    points: [
      p,
      [p[0] - 0.013, p[1] + 0.05, -0.015],
      [p[0] - 0.02, p[1] + 0.12, -0.025],
    ],
    radius: 0.016,
    endRadius: 0.002,
    flatten: 0.22,
    color: "#afbc94",
  });
}
