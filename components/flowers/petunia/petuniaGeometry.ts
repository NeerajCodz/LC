import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
export function petuniaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.14 : 1),
    a = u * Math.PI * 2,
    t = Math.max(0, (v - 0.62) / 0.38);
  const crown = Math.max(0, Math.min(1, (v - 0.6) / 0.25));
  const folded =
    0.024 +
    0.035 * Math.sin(Math.PI * v) +
    0.095 * Math.sin(Math.PI * v) ** 0.7 * crown;
  const radius =
    folded * (1 - open) +
    (0.032 +
      0.01 * v +
      (0.67 * (0.92 + 0.08 * Math.cos(a * 5)) - 0.042) * t ** 1.15) *
      open;
  const y =
    1.16 * v * (1 - open) +
    (Math.min(v / 0.7, 1) + 0.095 * t + 0.012 * Math.cos(a * 5) * t * t) * open;
  return [Math.cos(a) * radius, y, Math.sin(a) * radius];
}
export const PETUNIA_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.42, 0.12, 0.1],
      rotation: [1.13, -0.3, -0.06],
      scale: 0.59,
      nod: 0.026,
    },
    {
      position: [0.41, 0.39, 0.03],
      rotation: [0.75, 0.4, 0.1],
      scale: 0.52,
      nod: 0.024,
    },
    {
      position: [-0.12, 0.68, -0.2],
      rotation: [1.02, -0.25, 0],
      scale: 0.48,
      nod: 0.024,
    },
    {
      position: [0.5, 0.7, 0.18],
      rotation: [0.66, 0.2, 0.1],
      scale: 0.31,
      nod: 0.029,
    },
    {
      position: [-0.4, 0.75, -0.26],
      rotation: [0.4, -0.4, 0],
      scale: 0.3,
      nod: 0.029,
    },
  ],
  surfaces: [],
  organs: [],
};
export const PETUNIA_STALKS: SpecimenOrgan[] = [
  {
    name: "upper leafy shoot",
    cluster: 0,
    points: [
      [0, 0, 0],
      [-0.02, 0.42, 0],
      [0, 0.83, -0.025],
    ],
    radius: 0.02,
    endRadius: 0.012,
    color: "#658449",
  },
  ...PETUNIA_MODEL.clusters.map((c) => ({
    name: "axillary flower pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] * 0.72, 0],
      [c.position[0] * 0.6, c.position[1] + 0.045, c.position[2] * 0.65],
      c.position,
    ] as Vec3[],
    radius: 0.012,
    endRadius: 0.009,
    color: "#789052",
  })),
];
for (let c = 0; c < 5; c++) {
  const delay = c * 0.027;
  PETUNIA_MODEL.surfaces.push({
    name: "long-tubed corolla",
    cluster: c,
    role: "tube",
    sample: (u, v, o) => petuniaCorolla(u, v, o, c >= 3),
    periodic: true,
    thickness: 0.01,
    flexible: true,
    cage: [8, 8],
    mobileCage: [5, 5],
    delay,
    compliance: 0.00006,
    shapeCompliance: 0.0005,
  });
  PETUNIA_MODEL.surfaces.push({
    name: "fused calyx base",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.009,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 3],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.045 + 0.012 * v;
      return [Math.cos(a) * r, 0.1 * v, Math.sin(a) * r];
    },
  });
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    PETUNIA_MODEL.surfaces.push({
      name: "calyx lobe",
      cluster: c,
      role: "calyx",
      thickness: 0.008,
      delay,
      sample: (u, v, stage) => {
        const w = (2 * u - 1) * (0.003 + 0.025 * Math.sin(Math.PI * v)),
          r = 0.052 + 0.045 * stage * Math.sin(v * 2);
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          0.085 + 0.19 * v,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
    const h = i === 4 ? 0.44 : 0.59 + 0.025 * Math.sin(i),
      x = Math.sin(a) * 0.024,
      z = Math.cos(a) * 0.024;
    PETUNIA_MODEL.organs.push({
      name: "included stamen filament",
      cluster: c,
      points: [
        [x, 0.09, z],
        [x, h * 0.7, z],
        [x, h, z],
      ],
      foldedPoints: [
        [x * 0.65, 0.09, z * 0.65],
        [x * 0.65, 0.24, z * 0.65],
        [x * 0.65, 0.4, z * 0.65],
      ],
      radius: 0.004,
      endRadius: 0.003,
      color: "#e1ddc4",
    });
    PETUNIA_MODEL.organs.push({
      name: "included anther",
      cluster: c,
      points: [
        [x, h, z],
        [x, h + 0.012, z],
        [x + 0.002, h + 0.026, z],
      ],
      foldedPoints: [
        [x * 0.65, 0.4, z * 0.65],
        [x * 0.65, 0.412, z * 0.65],
        [x * 0.65, 0.425, z * 0.65],
      ],
      radius: 0.008,
      endRadius: 0.006,
      flatten: 0.58,
      color: "#c9b763",
    });
  }
  PETUNIA_MODEL.organs.push({
    name: "pistil style",
    cluster: c,
    points: [
      [0, 0.09, 0],
      [0, 0.43, 0],
      [0, 0.85, 0],
    ],
    foldedPoints: [
      [0, 0.09, 0],
      [0, 0.3, 0],
      [0, 0.56, 0],
    ],
    radius: 0.005,
    endRadius: 0.006,
    color: "#9dae73",
  });
  for (const side of [-1, 1])
    PETUNIA_MODEL.organs.push({
      name: "pistil stigma lobe",
      cluster: c,
      points: [
        [0, 0.83, 0],
        [side * 0.006, 0.854, 0],
        [side * 0.009, 0.864, 0],
      ],
      foldedPoints: [
        [0, 0.54, 0],
        [side * 0.003, 0.555, 0],
        [side * 0.004, 0.563, 0],
      ],
      radius: 0.007,
      endRadius: 0.006,
      color: "#a6b77b",
    });
}
