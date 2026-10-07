import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
const lengths = [1.0, 0.65, 0.88, 0.73, 0.88, 0.65],
  widths = [0.33, 0.19, 0.26, 0.22, 0.26, 0.19];
export function gladiolusTepal(i: number, young = false) {
  const a = (i * Math.PI) / 3;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.14 : 1),
      root = 0.045 + 0.07 * (0.45 + 0.55 * open);
    const w =
      (2 * u - 1) *
      (0.003 + widths[i] * Math.sin(Math.PI * v) ** 0.66) *
      (0.3 + 0.7 * open);
    const span = i === 0 ? 0.51 : 0.54;
    const r =
      root * (1 - v) +
      0.075 * Math.sin(Math.PI * v) ** 0.75 * (1 - open) +
      open *
        (span * Math.sin(v * Math.PI * 0.61) - (i === 0 ? 0.21 * v ** 3 : 0));
    const y =
      0.26 +
      lengths[i] * v * (0.86 - 0.6 * open) +
      0.1 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v) * open +
      (i === 0 ? 0.22 * open * v * v : 0);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      y,
      -0.045 + Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const GLADIOLUS_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 11 }, (_, i) => ({
    position: [(i % 2 ? 1 : -1) * 0.21, -0.22 + i * 0.17, 0.12] as Vec3,
    rotation: [
      1.18 + (i % 2) * 0.09,
      Math.PI + (i % 2 ? 1 : -1) * 0.16,
      0,
    ] as Vec3,
    scale: i < 8 ? 0.54 - i * 0.018 : 0.27,
    nod: 0.015,
  })),
  surfaces: [],
  organs: [],
};
export const GLADIOLUS_STALKS: SpecimenOrgan[] = [
  {
    name: "continuous upper spike",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.008, 0.8, 0],
      [0.012, 1.6, 0],
    ],
    radius: 0.026,
    endRadius: 0.015,
    color: "#698252",
  },
  ...GLADIOLUS_MODEL.clusters.map((c) => ({
    name: "short floral pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] - 0.015, 0],
      [c.position[0] * 0.65, c.position[1] + 0.05, 0.05],
      c.position,
    ] as Vec3[],
    radius: 0.015,
    endRadius: 0.011,
    color: "#849362",
  })),
];
for (let c = 0; c < 11; c++) {
  const delay = c * 0.021,
    young = c >= 8;
  GLADIOLUS_MODEL.surfaces.push({
    name: "oblique fused perianth tube",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.014,
    flexible: true,
    cage: [6, 4],
    mobileCage: [4, 1],
    delay,
    compliance: 0.000023,
    shapeCompliance: 0.00018,
    sample: (u, v, stage) => {
      const open = stage * (young ? 0.14 : 1),
        a = u * Math.PI * 2,
        r = 0.045 + 0.07 * v * v * (0.45 + 0.55 * open);
      return [Math.cos(a) * r, 0.26 * v, -0.045 * v * v + Math.sin(a) * r];
    },
  });
  for (let i = 0; i < 6; i++)
    GLADIOLUS_MODEL.surfaces.push({
      name: "unequal tepal",
      cluster: c,
      role: "petal",
      tissue: i % 2 ? "guide" : undefined,
      sample: gladiolusTepal(i, young),
      thickness: 0.013,
      flexible: true,
      cage: [3, 4],
      mobileCage: [1, 2],
      delay,
      compliance: 0.00005,
      shapeCompliance: 0.0005,
    });
  for (const side of [-1, 1])
    GLADIOLUS_MODEL.surfaces.push({
      name: "spathe valve",
      cluster: c,
      role: "calyx",
      thickness: 0.013,
      delay,
      sample: (u, v) => [
        side * 0.05 + (2 * u - 1) * (0.004 + 0.075 * Math.sin(Math.PI * v)),
        -0.16 + 0.31 * v,
        -0.028 + side * 0.05 * v + 0.018 * (2 * u - 1) ** 2,
      ],
    });
  GLADIOLUS_MODEL.organs.push({
    name: "inferior ovary",
    cluster: c,
    points: [
      [0, -0.14, 0],
      [0, -0.065, 0],
      [0, 0, 0],
    ],
    radius: 0.043,
    endRadius: 0.03,
    color: "#859669",
  });
  for (let i = 0; i < 3; i++) {
    const x = (i - 1) * 0.025,
      h = 0.49 + i * 0.012;
    GLADIOLUS_MODEL.organs.push({
      name: "unilateral stamen filament",
      cluster: c,
      points: [
        [x * 0.35, 0.07, 0.015],
        [x, 0.33, 0.065],
        [x, h, 0.072],
      ],
      foldedPoints: [
        [x * 0.3, 0.07, 0.012],
        [x * 0.4, 0.22, 0.016],
        [x * 0.5, 0.33, 0.02],
      ],
      radius: 0.005,
      endRadius: 0.004,
      color: "#e9d7be",
    });
    GLADIOLUS_MODEL.organs.push({
      name: "unilateral anther",
      cluster: c,
      points: [
        [x, h, 0.072],
        [x, h + 0.04, 0.076],
        [x, h + 0.085, 0.08],
      ],
      foldedPoints: [
        [x * 0.5, 0.33, 0.02],
        [x * 0.5, 0.355, 0.022],
        [x * 0.5, 0.38, 0.024],
      ],
      radius: 0.01,
      endRadius: 0.006,
      flatten: 0.5,
      color: "#bfa75e",
    });
  }
  GLADIOLUS_MODEL.organs.push({
    name: "pistil style",
    cluster: c,
    points: [
      [0, 0.07, 0],
      [0, 0.35, 0.02],
      [0, 0.55, 0.036],
    ],
    foldedPoints: [
      [0, 0.07, 0],
      [0, 0.2, 0.01],
      [0, 0.35, 0.02],
    ],
    radius: 0.005,
    endRadius: 0.005,
    color: "#e4dfb0",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    GLADIOLUS_MODEL.organs.push({
      name: "pistil style arm",
      cluster: c,
      points: [
        [0, 0.53, 0.036],
        [Math.sin(a) * 0.025, 0.564, 0.036 + Math.cos(a) * 0.022],
        [Math.sin(a) * 0.038, 0.58, 0.036 + Math.cos(a) * 0.034],
      ],
      foldedPoints: [
        [0, 0.33, 0.02],
        [Math.sin(a) * 0.012, 0.353, 0.02 + Math.cos(a) * 0.01],
        [Math.sin(a) * 0.018, 0.366, 0.02 + Math.cos(a) * 0.016],
      ],
      radius: 0.006,
      endRadius: 0.008,
      color: "#dfe0b4",
    });
  }
}
