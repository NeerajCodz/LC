import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** A hairy swollen throat leads into five pointed, connected star lobes. */
export function pentasCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.07 : 1),
    a = u * Math.PI * 2,
    t = Math.max(0, (v - 0.7) / 0.3),
    lobe = (0.5 + 0.5 * Math.cos(a * 5)) ** 4;
  const full =
      0.022 +
      0.038 * Math.exp(-(((v - 0.7) / 0.14) ** 2)) +
      t ** 1.4 * (0.025 + 0.23 * lobe),
    closed = 0.026 + 0.028 * Math.sin(Math.PI * v);
  const r = closed * (1 - open) + full * open;
  return [
    Math.sin(a) * r,
    0.73 * Math.min(v / 0.7, 1) + 0.047 * t - 0.016 * lobe * t * open,
    Math.cos(a) * r,
  ];
}
export const PENTAS_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 22 }, (_, i) => {
    const a = i * 2.399963229728653,
      r = i < 19 ? 0.15 + 0.56 * Math.sqrt(i / 19) : 0.3 + (i - 19) * 0.14;
    return {
      position: [
        Math.sin(a) * r,
        0.09 + 0.1 * (1 - r * r),
        Math.cos(a) * r,
      ] as Vec3,
      rotation: [0.16 * Math.cos(a), 0, -0.16 * Math.sin(a)] as Vec3,
      scale: i < 19 ? 0.83 + 0.055 * Math.sin(i * 2.1) : 0.43,
      nod: 0.019,
    };
  }),
  surfaces: [],
  organs: [],
};
export const PENTAS_STALKS: SpecimenOrgan[] = [
  {
    name: "pentas cyme axis",
    cluster: 0,
    points: [
      [0, -0.3, 0],
      [0, -0.13, 0],
      [0, 0.07, 0],
    ],
    radius: 0.028,
    endRadius: 0.017,
    color: "#81935e",
  },
  ...PENTAS_MODEL.clusters.map((c) => ({
    name: "pentas cyme terminal branch",
    cluster: 0,
    points: [
      [0, -0.17, 0],
      [c.position[0] * 0.48, -0.025, c.position[2] * 0.48],
      [c.position[0] * 0.85, c.position[1] - 0.035, c.position[2] * 0.85],
      c.position,
    ] as Vec3[],
    radius: 0.013,
    endRadius: 0.007,
    color: "#93a477",
  })),
];
for (let c = 0; c < 22; c++) {
  const young = c >= 19,
    delay = 0.065 + (c % 6) * 0.011;
  PENTAS_MODEL.surfaces.push({
    name: "five-pointed pentas corolla",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.008,
    overviewRows: 3,
    overviewColumns: 20,
    sample: (u, v, o) => pentasCorolla(u, v, o, young),
    flexible: true,
    cage: [10, 4],
    mobileCage: [5, 3],
    delay,
    compliance: 0.00004,
    shapeCompliance: 0.00035,
  });
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    PENTAS_MODEL.surfaces.push({
      name: "valvate terminal lobe tissue",
      cluster: c,
      role: "petal",
      thickness: 0.008,
      overviewRows: 2,
      overviewColumns: 2,
      delay,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.07 : 1),
          w = 2 * u - 1,
          angle = a + w * 0.66,
          root = pentasCorolla(angle / (Math.PI * 2), 0.84, stage, young),
          rim = pentasCorolla(angle / (Math.PI * 2), 1, stage, young);
        const radius = 0.033 * (1 - v) - 0.007 * v,
          width = w * (0.006 + 0.014 * Math.sin(Math.PI * v));
        const closed: Vec3 = [
          Math.sin(a) * radius + Math.cos(a) * width,
          0.76 + 0.049 * v,
          Math.cos(a) * radius - Math.sin(a) * width,
        ];
        const full: Vec3 = [
          root[0] * (1 - v) + rim[0] * v + Math.sin(angle) * 0.027 * v,
          root[1] * (1 - v) + rim[1] * v + 0.007 * Math.sin(Math.PI * v),
          root[2] * (1 - v) + rim[2] * v + Math.cos(angle) * 0.027 * v,
        ];
        return [
          closed[0] * (1 - open) + full[0] * open,
          closed[1] * (1 - open) + full[1] * open,
          closed[2] * (1 - open) + full[2] * open,
        ];
      },
    });
  }
  PENTAS_MODEL.surfaces.push({
    name: "unequal hairy pentas calyx",
    cluster: c,
    role: "calyx",
    periodic: true,
    overviewRows: 1,
    overviewColumns: 10,
    thickness: 0.007,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        lobe = (0.5 + 0.5 * Math.cos(a * 5)) ** 3,
        length = 0.075 + 0.068 * Math.cos(a) - 0.025 * Math.sin(a),
        r = 0.034 + 0.012 * v;
      return [
        Math.sin(a) * r,
        -0.025 + 0.071 * v + length * lobe * v ** 4,
        Math.cos(a) * r,
      ];
    },
  });
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / 5,
      x = Math.sin(a) * 0.035,
      z = Math.cos(a) * 0.035;
    PENTAS_MODEL.organs.push({
      name: "included pentas stamen filament",
      cluster: c,
      overviewSides: 3,
      points: [
        [x, 0.5, z],
        [x, 0.58, z],
        [x, 0.64, z],
      ],
      foldedPoints: [
        [x * 0.6, 0.5, z * 0.6],
        [x * 0.6, 0.59, z * 0.6],
        [x * 0.6, 0.65, z * 0.6],
      ],
      radius: 0.003,
      endRadius: 0.0024,
      color: "#e4d4ad",
    });
    for (const side of [-1, 1])
      PENTAS_MODEL.organs.push({
        name: "included pentas anther chamber",
        cluster: c,
        points: [
          [x + side * 0.004, 0.64, z],
          [x + side * 0.006, 0.68, z],
          [x + side * 0.004, 0.711, z],
        ],
        foldedPoints: [
          [x * 0.6 + side * 0.003, 0.65, z * 0.6],
          [x * 0.6 + side * 0.004, 0.685, z * 0.6],
          [x * 0.6 + side * 0.003, 0.714, z * 0.6],
        ],
        radius: 0.0045,
        endRadius: 0.0025,
        flatten: 0.65,
        color: "#cbb979",
      });
  }
  PENTAS_MODEL.organs.push({
    name: "exserted pentas style",
    cluster: c,
    points: [
      [0, 0.025, 0],
      [0.002, 0.45, 0],
      [0.004, 0.875, 0.003],
    ],
    foldedPoints: [
      [0, 0.025, 0],
      [0, 0.42, 0],
      [0, 0.775, 0],
    ],
    radius: 0.004,
    endRadius: 0.003,
    color: "#efd3dc",
  });
  for (const side of [-1, 1])
    PENTAS_MODEL.organs.push({
      name: "bifid pentas stigma",
      cluster: c,
      points: [
        [0.004, 0.875, 0.003],
        [side * 0.013, 0.89, 0.003],
        [side * 0.028, 0.895, 0.002],
      ],
      foldedPoints: [
        [0, 0.775, 0],
        [side * 0.003, 0.785, 0],
        [side * 0.005, 0.793, 0],
      ],
      radius: 0.004,
      endRadius: 0.0026,
      color: "#eedec0",
    });
  for (let i = 0; i < 12; i++) {
    const u = i / 12,
      v = 0.7 + (i % 3) * 0.045,
      full = pentasCorolla(u, v, 1, young),
      closed = pentasCorolla(u, v, 0, young),
      a = u * Math.PI * 2;
    const tip = (p: Vec3): Vec3 => [
      p[0] - Math.sin(a) * 0.021,
      p[1] + 0.008,
      p[2] - Math.cos(a) * 0.021,
    ];
    PENTAS_MODEL.organs.push({
      name: "throat hair",
      cluster: c,
      fine: true,
      points: [full, tip(full)],
      foldedPoints: [closed, tip(closed)],
      radius: 0.0013,
      endRadius: 0.0003,
      color: "#f3e4e5",
    });
  }
}
export const PENTAS_HEAD_CENTER: Vec3 = [0, 0.58, 0];
for (let cluster = 0; cluster < 22; cluster++)
  PENTAS_MODEL.organs.push({
    name: "inferior pentas ovary",
    cluster,
    points: [
      [0, -0.062, 0],
      [0, -0.022, 0],
      [0, 0.028, 0],
    ],
    radius: 0.034,
    endRadius: 0.019,
    color: "#849864",
  });
for (const organ of PENTAS_MODEL.organs)
  if (organ.cluster >= 19 && organ.foldedPoints)
    organ.points = organ.foldedPoints.map((p) => [...p] as Vec3);
