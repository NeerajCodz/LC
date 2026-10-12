import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** C. indica: narrow true petals and unequal petaloid staminal organs. */
export function cannaTruePetal(i: number, young = false) {
  const a = (i * Math.PI * 2) / 3 + 0.18;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.1 : 1),
      w = (2 * u - 1) * (0.003 + 0.052 * Math.sin(v * Math.PI) ** 0.76),
      r =
        0.059 * (1 - v * 0.75) + 0.07 * Math.sin(v * Math.PI) + 0.22 * open * v,
      y = 0.23 + 0.84 * v * (1 - 0.19 * open);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      y,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}

export function cannaStaminode(i: number, young = false) {
  const a = [-0.72, 0.22, 1.86][i],
    length = [1.09, 1.18, 1.03][i],
    width = [0.102, 0.112, 0.097][i];
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.1 : 1),
      across = 2 * u - 1,
      w =
        across *
        (0.003 + width * Math.sin(v * Math.PI * 0.92) ** 0.75) *
        (0.32 + 0.68 * open),
      notch = i === 1 ? 0.047 * Math.exp(-((across * 5.5) ** 2)) * v ** 12 : 0,
      r =
        0.058 * (1 - v * 0.82) +
        0.075 * Math.sin(v * Math.PI) * (1 - open) +
        open * (0.39 * v + 0.065 * Math.sin(v * Math.PI)),
      y = 0.16 + length * v * (1 - 0.18 * open) - notch * open,
      curl =
        0.09 * across * across * Math.sin(v * Math.PI) * open +
        0.013 * Math.sin(v * 19 + i) * across * open;
    return [
      Math.sin(a) * (r + curl) + Math.cos(a) * w,
      y,
      Math.cos(a) * (r + curl) - Math.sin(a) * w,
    ];
  };
}

export function cannaLabellum(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.1 : 1),
    across = 2 * u - 1,
    w =
      across *
      (0.003 + 0.085 * Math.sin(v * Math.PI * 0.93) ** 0.7) *
      (0.33 + 0.67 * open),
    notch = 0.034 * Math.exp(-((across * 5) ** 2)) * v ** 10,
    y =
      0.17 +
      0.91 * v * (1 - open) +
      open * (0.6 * Math.sin(v * 2.32) - 0.36 * v ** 3 - notch),
    z =
      0.06 * (1 - v * 0.85) +
      0.07 * Math.sin(v * Math.PI) * (1 - open) +
      open *
        (0.57 * v -
          0.17 * v ** 4 +
          0.07 * across * across * Math.sin(v * Math.PI));
  return [w - 0.055 * open * v * v, y, z];
}

export function cannaHalfStamen(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.1 : 1),
    w =
      (2 * u - 1) *
      (0.003 + 0.061 * Math.sin(v * Math.PI * 0.9) ** 0.75) *
      (0.42 + 0.58 * open);
  return [
    0.021 + w + 0.085 * open * v,
    0.17 + 0.99 * v * (1 - 0.14 * open),
    0.01 + 0.045 * Math.sin(v * Math.PI) + 0.14 * open * v,
  ];
}

export function cannaStyle(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.1 : 1),
    w =
      (2 * u - 1) *
      (0.003 + 0.029 * Math.sin(v * Math.PI * 0.82)) *
      (0.5 + 0.5 * open);
  return [
    -0.021 + w - 0.03 * open * v,
    0.15 + 1.3 * v * (1 - 0.14 * open),
    -0.012 + 0.027 * Math.sin(v * Math.PI) + 0.095 * open * v,
  ];
}

export const CANNA_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.28, -0.05, 0.12],
      rotation: [0.71, -0.38, 0.18],
      scale: 0.64,
      nod: 0.014,
    },
    {
      position: [0.28, 0.35, -0.02],
      rotation: [0.59, 0.54, -0.13],
      scale: 0.6,
      nod: 0.016,
    },
    {
      position: [-0.15, 0.77, -0.08],
      rotation: [0.38, -0.39, 0.12],
      scale: 0.55,
      nod: 0.013,
    },
    {
      position: [0.1, 1.13, -0.025],
      rotation: [0.12, 0.24, -0.08],
      scale: 0.39,
      nod: 0.011,
    },
  ],
  surfaces: [],
  organs: [],
  instances: [],
};

export const CANNA_STALKS: SpecimenOrgan[] = [
  {
    name: "terminal raceme axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.012, 0.59, -0.018],
      [0.08, 1.14, -0.03],
    ],
    radius: 0.039,
    endRadius: 0.02,
    color: "#718455",
  },
  ...CANNA_MODEL.clusters.map((c) => ({
    name: "short cincinnus branch",
    cluster: 0,
    points: [
      [0.014, c.position[1] - 0.04, -0.016],
      [c.position[0] * 0.65, c.position[1] - 0.018, c.position[2] * 0.7],
      c.position,
    ] as Vec3[],
    radius: 0.018,
    endRadius: 0.012,
    color: "#7e885c",
  })),
];

for (let c = 0; c < CANNA_MODEL.clusters.length; c++) {
  const young = c === 3,
    delay = c * 0.045;
  CANNA_MODEL.surfaces.push({
    name: "true corolla basal tube",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.014,
    flexible: true,
    cage: [6, 3],
    mobileCage: [4, 2],
    delay,
    compliance: 0.000024,
    shapeCompliance: 0.00016,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.044 + 0.015 * v;
      return [Math.sin(a) * r, 0.23 * v, Math.cos(a) * r];
    },
  });
  for (let i = 0; i < 3; i++) {
    CANNA_MODEL.surfaces.push({
      name: "narrow true petal",
      cluster: c,
      role: "petal",
      tissue: "inner",
      thickness: 0.012,
      flexible: true,
      cage: [2, 4],
      mobileCage: [1, 2],
      delay,
      compliance: 0.000042,
      shapeCompliance: 0.00042,
      sample: cannaTruePetal(i, young),
    });
    CANNA_MODEL.surfaces.push({
      name: "outer petaloid staminode",
      cluster: c,
      role: "petal",
      thickness: 0.013,
      flexible: true,
      cage: [4, 7],
      mobileCage: [2, 3],
      delay,
      compliance: 0.00007,
      shapeCompliance: 0.00055,
      sample: cannaStaminode(i, young),
    });
    const a = (i * Math.PI * 2) / 3;
    CANNA_MODEL.surfaces.push({
      name: "persistent sepal",
      cluster: c,
      role: "calyx",
      thickness: 0.011,
      delay,
      sample: (u, v) => {
        const w = (2 * u - 1) * (0.003 + 0.028 * Math.sin(v * Math.PI)),
          r = 0.047 + 0.035 * v;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          -0.04 + 0.3 * v,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  CANNA_MODEL.surfaces.push(
    {
      name: "reflexed labellum",
      cluster: c,
      role: "petal",
      tissue: "guide",
      thickness: 0.014,
      flexible: true,
      cage: [4, 7],
      mobileCage: [2, 3],
      delay,
      compliance: 0.00007,
      shapeCompliance: 0.0006,
      sample: (u, v, stage) => cannaLabellum(u, v, stage, young),
    },
    {
      name: "fertile petaloid half-stamen",
      cluster: c,
      role: "petal",
      tissue: "inner",
      thickness: 0.013,
      flexible: true,
      cage: [2, 5],
      mobileCage: [1, 3],
      delay,
      compliance: 0.000036,
      shapeCompliance: 0.00032,
      sample: (u, v, stage) => cannaHalfStamen(u, v, stage, young),
    },
    {
      name: "flat petaloid style",
      cluster: c,
      role: "petal",
      tissue: "inner",
      thickness: 0.012,
      flexible: true,
      cage: [2, 5],
      mobileCage: [1, 3],
      delay,
      compliance: 0.00002,
      shapeCompliance: 0.0002,
      sample: (u, v, stage) => cannaStyle(u, v, stage, young),
    },
  );
  const anther = (stage: number): Vec3[] =>
    [0.82, 0.91, 0.995].map((v) => {
      const p = cannaHalfStamen(1, v, stage, young);
      return [p[0] + 0.005, p[1], p[2] + 0.007] as Vec3;
    });
  CANNA_MODEL.organs.push(
    {
      name: "single adnate anther locule",
      cluster: c,
      points: anther(1),
      foldedPoints: anther(0),
      radius: 0.013,
      endRadius: 0.008,
      flatten: 0.63,
      color: "#d9b25b",
    },
    {
      name: "inferior warty ovary",
      cluster: c,
      points: [
        [0, -0.12, 0],
        [0, -0.062, 0],
        [0, -0.005, 0],
      ],
      radius: 0.042,
      endRadius: 0.036,
      color: "#83905a",
    },
    {
      name: "marginal stigma ridge",
      cluster: c,
      points: [
        cannaStyle(0.12, 0.94, 1, young),
        cannaStyle(0.5, 0.985, 1, young),
        cannaStyle(0.88, 0.94, 1, young),
      ],
      foldedPoints: [
        cannaStyle(0.12, 0.94, 0, young),
        cannaStyle(0.5, 0.985, 0, young),
        cannaStyle(0.88, 0.94, 0, young),
      ],
      radius: 0.0065,
      endRadius: 0.0045,
      color: "#edbd65",
    },
  );
  CANNA_MODEL.instances!.push({
    name: "ovary papillae",
    cluster: c,
    surfaces: [],
    organs: [
      {
        name: "sealed ovary papilla",
        cluster: 0,
        points: [
          [0, 0, 0],
          [0, 0.007, 0],
          [0, 0.012, 0],
        ],
        radius: 0.0045,
        endRadius: 0.0017,
        color: "#86935e",
      },
    ],
    poses: Array.from({ length: 24 }, (_, i) => {
      const a = i * 2.399963229728653,
        r = 0.036;
      return {
        position: [
          Math.sin(a) * r,
          -0.1 + (i % 6) * 0.015,
          Math.cos(a) * r,
        ] as Vec3,
        rotation: [Math.PI / 2, a, 0] as Vec3,
        scale: 0.85 + (i % 3) * 0.08,
        delay,
        phase: i * 0.13,
      };
    }),
  });
}
