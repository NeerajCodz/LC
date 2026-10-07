import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
export function primroseCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.12 : 1),
    a = u * Math.PI * 2,
    t = Math.max(0, (v - 0.52) / 0.48);
  const notch = 0.024 * Math.exp(-(Math.sin(a * 2.5) ** 2) / 0.035);
  const rim = 0.57 * (0.9 + 0.1 * Math.cos(a * 5)) - notch;
  const closed = 0.022 + 0.018 * Math.sin(Math.PI * v) - 0.01 * v;
  const radius =
    closed * (1 - open) +
    (0.026 + 0.008 * v + (rim - 0.034) * t ** 1.25) * open;
  const y =
    0.67 * v * (1 - open) +
    (0.38 * Math.min(v / 0.52, 1) +
      0.055 * t +
      0.009 * Math.cos(a * 5) * t * t) *
      open;
  return [Math.cos(a) * radius, y, Math.sin(a) * radius];
}
export const PRIMROSE_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 7 }, (_, i) => ({
    position: [
      Math.sin(i * 2.399) * (0.35 + (i % 3) * 0.08),
      0.04 + (i % 3) * 0.11,
      Math.cos(i * 2.399) * 0.32,
    ] as Vec3,
    rotation: [0.55 + (i % 3) * 0.15, (i - 3) * 0.15, 0] as Vec3,
    scale: i < 5 ? 0.54 : 0.32,
    nod: 0.024,
  })),
  surfaces: [],
  organs: [],
};
export const PRIMROSE_STALKS: SpecimenOrgan[] = PRIMROSE_MODEL.clusters.map(
  (c, i) => ({
    name: "basal flower stalk",
    cluster: 0,
    points: [
      [0, -1.6, 0],
      [c.position[0] * 0.45, -0.7, c.position[2] * 0.4],
      [c.position[0] * 0.8, c.position[1] - 0.08, c.position[2] * 0.85],
      c.position,
    ],
    radius: 0.012,
    endRadius: 0.009,
    color: i < 5 ? "#78914f" : "#849753",
  }),
);
for (let c = 0; c < 7; c++) {
  const delay = c * 0.025;
  PRIMROSE_MODEL.surfaces.push({
    name: "five-lobed fused corolla",
    cluster: c,
    role: "tube",
    sample: (u, v, o) => primroseCorolla(u, v, o, c >= 5),
    periodic: true,
    thickness: 0.01,
    flexible: true,
    cage: [8, 7],
    mobileCage: [4, 4],
    delay,
    compliance: 0.00005,
    shapeCompliance: 0.0005,
  });
  PRIMROSE_MODEL.surfaces.push({
    name: "five-toothed fused calyx",
    cluster: c,
    role: "calyx",
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.041 + 0.01 * v + 0.004 * Math.cos(a * 5) * v;
      return [
        Math.cos(a) * r,
        0.16 * v + 0.016 * Math.cos(a * 5) * v ** 8,
        Math.sin(a) * r,
      ];
    },
    thickness: 0.009,
    periodic: true,
    contactObstacle: true,
    cage: [8, 3],
    mobileCage: [5, 3],
    delay,
  });
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / 5,
      x = Math.sin(a) * 0.027,
      z = Math.cos(a) * 0.027;
    PRIMROSE_MODEL.organs.push({
      name: "included stamen filament",
      cluster: c,
      points: [
        [x, 0.08, z],
        [x, 0.17, z],
        [x, 0.22, z],
      ],
      foldedPoints: [
        [x * 0.7, 0.07, z * 0.7],
        [x * 0.7, 0.12, z * 0.7],
        [x * 0.7, 0.17, z * 0.7],
      ],
      radius: 0.0035,
      endRadius: 0.003,
      color: "#e1d6a4",
    });
    PRIMROSE_MODEL.organs.push({
      name: "included anther",
      cluster: c,
      points: [
        [x, 0.22, z],
        [x, 0.232, z],
        [x, 0.247, z],
      ],
      foldedPoints: [
        [x * 0.7, 0.17, z * 0.7],
        [x * 0.7, 0.181, z * 0.7],
        [x * 0.7, 0.193, z * 0.7],
      ],
      radius: 0.007,
      endRadius: 0.006,
      flatten: 0.55,
      color: "#c5a447",
    });
  }
  PRIMROSE_MODEL.organs.push({
    name: "pin style",
    cluster: c,
    points: [
      [0, 0.06, 0],
      [0.001, 0.24, 0],
      [0, 0.43, 0],
    ],
    foldedPoints: [
      [0, 0.06, 0],
      [0, 0.19, 0],
      [0, 0.31, 0],
    ],
    radius: 0.005,
    endRadius: 0.009,
    color: "#bdc47c",
  });
}
