import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export function freesiaFunnel(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.12 : 1),
    a = u * Math.PI * 2,
    t = Math.max(0, (v - 0.45) / 0.55),
    mouth = 0.43 * (0.9 + 0.1 * Math.cos(a * 6));
  const closed =
    0.027 + 0.085 * Math.sin(v * Math.PI) ** 0.7 * Math.min(1, t * 2.5);
  const r =
    closed * (1 - open) + (0.028 + 0.012 * v + mouth * t ** 1.25) * open;
  return [
    Math.sin(a) * r,
    0.82 * v * (1 - open) +
      (0.44 * Math.min(v / 0.45, 1) +
        0.24 * t +
        0.014 * Math.cos(a * 6) * t * t) *
        open,
    Math.cos(a) * r,
  ];
}
export const FREESIA_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 7 }, (_, i) => ({
    position: [-0.64 + i * 0.25, 0.06 + i * 0.055, 0.01] as Vec3,
    rotation: [1.05, 0.12 * (i - 3), -0.1] as Vec3,
    scale: i < 5 ? 0.46 : 0.3,
    nod: 0.018 + (i % 3) * 0.003,
  })),
  surfaces: [],
  organs: [],
};
export const FREESIA_STALKS: SpecimenOrgan[] = [
  {
    name: "bent spike axis",
    cluster: 0,
    points: [
      [0, -1.85, 0],
      [0.02, -0.55, 0],
      [-0.72, 0.01, 0],
      [1.0, 0.42, 0],
    ],
    radius: 0.017,
    endRadius: 0.01,
    color: "#758c50",
  },
  ...FREESIA_MODEL.clusters.map((c) => ({
    name: "short flower pedicel",
    cluster: 0,
    points: [
      [c.position[0], c.position[1] - 0.05, 0],
      [c.position[0], c.position[1] - 0.018, 0.006],
      c.position,
    ] as Vec3[],
    radius: 0.011,
    endRadius: 0.008,
    color: "#859c61",
  })),
];
for (let c = 0; c < 7; c++) {
  const delay = c * 0.035;
  FREESIA_MODEL.surfaces.push({
    name: "six-lobed fused funnel",
    cluster: c,
    role: "tube",
    tissue: "guide",
    periodic: true,
    thickness: 0.014,
    flexible: true,
    cage: [10, 7],
    mobileCage: [6, 4],
    compliance: 0.00004,
    shapeCompliance: 0.0004,
    delay,
    sample: (u, v, stage) => freesiaFunnel(u, v, stage, c >= 5),
  });
  for (const side of [-1, 1])
    FREESIA_MODEL.surfaces.push({
      name: "spathe valve",
      cluster: c,
      role: "calyx",
      thickness: 0.011,
      contactObstacle: true,
      cage: [2, 3],
      mobileCage: [1, 2],
      sample: (u, v, stage) => {
        const width = (2 * u - 1) * (0.004 + 0.04 * Math.sin(v * Math.PI));
        return [
          width,
          -0.025 + 0.29 * v,
          side * (0.044 + 0.055 * stage * v) + 0.012 * (2 * u - 1) ** 2,
        ];
      },
    });
  FREESIA_MODEL.organs.push(
    ...floralStamens({
      count: 3,
      cluster: c,
      radius: 0.043,
      height: 0.52,
      base: 0.18,
      foldedHeight: 0.45,
      filamentRadius: 0.0045,
      antherLength: 0.068,
    }),
  );
  FREESIA_MODEL.organs.push({
    name: "central style",
    cluster: c,
    points: [
      [0, 0.08, 0],
      [0, 0.32, 0],
      [0, 0.51, 0],
    ],
    foldedPoints: [
      [0, 0.08, 0],
      [0, 0.25, 0],
      [0, 0.44, 0],
    ],
    radius: 0.005,
    endRadius: 0.005,
    color: "#d5cfab",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    for (const fork of [-1, 1]) {
      const b = a + fork * 0.12;
      FREESIA_MODEL.organs.push({
        name: "bifid style tip",
        cluster: c,
        points: [
          [0, 0.505, 0],
          [Math.sin(a) * 0.029, 0.57, Math.cos(a) * 0.029],
          [Math.sin(b) * 0.048, 0.625, Math.cos(b) * 0.048],
        ],
        foldedPoints: [
          [0, 0.44, 0],
          [Math.sin(a) * 0.015, 0.48, Math.cos(a) * 0.015],
          [Math.sin(b) * 0.022, 0.51, Math.cos(b) * 0.022],
        ],
        radius: 0.004,
        endRadius: 0.0048,
        color: "#c4ba83",
      });
    }
  }
}
