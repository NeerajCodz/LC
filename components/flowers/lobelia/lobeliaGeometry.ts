import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** Nonperiodic angular sheet preserves a dorsal cleft and the unequal 2+3 limbs. */
export function lobeliaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.045 : 1),
    gap = 0.42 + 0.08 * v * open,
    a = Math.PI / 2 + gap / 2 + u * (Math.PI * 2 - gap),
    t = Math.max(0, (v - 0.55) / 0.45);
  let lobe = 0;
  for (const [center, size, width] of [
    [1.94, 0.045, 0.11],
    [1.2 + Math.PI * 2, 0.045, 0.11],
    [Math.PI * 1.25, 0.19, 0.44],
    [Math.PI * 1.5, 0.22, 0.44],
    [Math.PI * 1.75, 0.19, 0.44],
  ]) {
    const d = Math.atan2(Math.sin(a - center), Math.cos(a - center));
    lobe += size * Math.exp(-((d / width) ** 2));
  }
  const lower = Math.max(0, -Math.sin(a)),
    full = 0.029 + 0.025 * v + t ** 2 * (0.037 + lobe),
    bud = 0.023 + 0.037 * Math.sin(Math.PI * v),
    r = bud * (1 - open) + full * open;
  return [
    Math.cos(a) * r,
    Math.sin(a) * r * (0.63 + 0.35 * lower * open),
    0.035 + (0.32 + 0.13 * open) * v + 0.085 * lower * t * open,
  ];
}
export const LOBELIA_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 9 }, (_, i) => ({
    position: [
      Math.sin(i * 2.15) * (0.3 + i * 0.014),
      -0.45 + i * 0.16,
      Math.cos(i * 2.15) * 0.1,
    ] as Vec3,
    rotation: [-0.11, ((i % 3) - 1) * 0.48, -0.05 * Math.cos(i)] as Vec3,
    scale: i < 7 ? 0.86 - i * 0.045 : 0.43,
    nod: 0.052,
  })),
  surfaces: [],
  organs: [],
};
export const LOBELIA_STALKS: SpecimenOrgan[] = [
  {
    name: "slender lobelia raceme axis",
    cluster: 0,
    points: [
      [0, -0.75, 0],
      [0.018, -0.13, 0],
      [0.045, 0.94, 0],
    ],
    radius: 0.016,
    endRadius: 0.006,
    color: "#799664",
  },
  ...LOBELIA_MODEL.clusters.map((c, i): SpecimenOrgan => ({
    name: "slender lobelia pedicel",
    cluster: 0,
    points: [
      [0.012, c.position[1] - 0.11, 0],
      [c.position[0] * 0.44, c.position[1] - 0.07, c.position[2] * 0.4],
      c.position,
    ],
    radius: 0.0068,
    endRadius: 0.004,
    color: i < 7 ? "#8da679" : "#96b07e",
  })),
];
for (let c = 0; c < 9; c++) {
  const young = c >= 7,
    delay = 0.075 + c * 0.018;
  LOBELIA_MODEL.surfaces.push({
    name: "dorsally split lobelia corolla",
    cluster: c,
    role: "tube",
    periodic: false,
    thickness: 0.009,
    overviewColumns: 32,
    overviewRows: 5,
    sample: (u, v, o) => lobeliaCorolla(u, v, o, young),
    flexible: true,
    cage: [12, 5],
    mobileCage: [6, 4],
    delay,
    compliance: 0.00007,
    shapeCompliance: 0.00045,
  });
  LOBELIA_MODEL.surfaces.push({
    name: "fused basal corolla bridge",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.008,
    overviewColumns: 12,
    overviewRows: 2,
    delay,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.029 + 0.003 * v;
      return [Math.cos(a) * r, Math.sin(a) * r, -0.01 + 0.1 * v];
    },
  });
  // Finite lobe tissue encloses the folded reproductive tip without filling the dorsal cut.
  for (const [direction, index] of [
    [1.99, 0],
    [7.43, 1],
    [Math.PI * 1.25, 2],
    [Math.PI * 1.5, 3],
    [Math.PI * 1.75, 4],
  ])
    LOBELIA_MODEL.surfaces.push({
      name: "folded lobelia terminal lobe tissue",
      cluster: c,
      role: "petal",
      thickness: 0.009,
      overviewRows: 2,
      delay,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.045 : 1),
          w = 2 * u - 1,
          angle = direction + w * (index < 2 ? 0.1 : 0.36),
          gap = 0.42 + 0.08 * 0.84 * open,
          param = (angle - Math.PI / 2 - gap / 2) / (Math.PI * 2 - gap),
          root = lobeliaCorolla(param, 0.83, stage, young),
          rim = lobeliaCorolla(param, 1, stage, young),
          r = 0.029 * (1 - v) - 0.007 * v,
          width = w * (0.006 + 0.01 * Math.sin(Math.PI * v));
        const closed: Vec3 = [
          Math.cos(direction) * r - Math.sin(direction) * width,
          Math.sin(direction) * r + Math.cos(direction) * width,
          0.335 + 0.088 * v + index * 0.0007,
        ];
        return [
          closed[0] * (1 - open) + (root[0] * (1 - v) + rim[0] * v) * open,
          closed[1] * (1 - open) + (root[1] * (1 - v) + rim[1] * v) * open,
          closed[2] * (1 - open) +
            (root[2] * (1 - v) + rim[2] * v + 0.012 * v) * open,
        ];
      },
    });
  LOBELIA_MODEL.surfaces.push({
    name: "five linear lobelia calyx teeth",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.006,
    overviewColumns: 20,
    overviewRows: 2,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        lobe = (0.5 + 0.5 * Math.cos(a * 5)) ** 6,
        r = 0.034 + 0.013 * v;
      return [
        Math.cos(a) * r,
        Math.sin(a) * r,
        -0.025 + 0.072 * v + 0.12 * lobe * v ** 3,
      ];
    },
  });
  LOBELIA_MODEL.surfaces.push({
    name: "fused lobelia anther tube",
    cluster: c,
    role: "petal",
    tissue: "inner",
    periodic: true,
    thickness: 0.005,
    overviewColumns: 12,
    overviewRows: 3,
    delay,
    sample: (u, v, o) => {
      const open = o * (young ? 0.045 : 1),
        a = u * Math.PI * 2,
        r = 0.012 + 0.002 * Math.sin(Math.PI * v),
        z = 0.14 + (0.25 + 0.07 * open) * v;
      return [Math.cos(a) * r, 0.021 + 0.073 * open + Math.sin(a) * r, z];
    },
  });
  for (const side of [-1, 1]) {
    LOBELIA_MODEL.surfaces.push({
      name: "pale throat bump",
      cluster: c,
      role: "petal",
      tissue: "guide",
      periodic: true,
      thickness: 0.006,
      overviewColumns: 12,
      overviewRows: 2,
      delay,
      sample: (u, v, o) => {
        const open = o * (young ? 0.045 : 1),
          a = u * Math.PI * 2,
          r = 0.012 + 0.018 * Math.sin(Math.PI * v);
        return [
          side * (0.016 + 0.033 * open) + Math.cos(a) * r,
          -0.014 - 0.016 * open + Math.sin(a) * r,
          0.24 + 0.11 * open + 0.077 * v,
        ];
      },
    });
  }
  for (let i = 0; i < 5; i++) {
    const a = ((i + 0.5) * Math.PI * 2) / 5,
      x = Math.cos(a) * 0.024,
      y = Math.sin(a) * 0.021;
    LOBELIA_MODEL.organs.push({
      name: "lobelia stamen filament",
      cluster: c,
      points: [
        [x, y, 0.02],
        [x * 0.45, 0.078 + y * 0.3, 0.21],
        [x * 0.26, 0.094 + y * 0.2, 0.405],
      ],
      foldedPoints: [
        [x * 0.7, y * 0.7, 0.02],
        [x * 0.3, 0.018 + y * 0.2, 0.2],
        [x * 0.2, 0.021 + y * 0.2, 0.36],
      ],
      radius: 0.0028,
      endRadius: 0.002,
      color: "#aaa6d5",
    });
    LOBELIA_MODEL.organs.push({
      name: "fused-tube anther locule",
      cluster: c,
      points: [
        [Math.cos(a) * 0.012, 0.094 + Math.sin(a) * 0.012, 0.39],
        [Math.cos(a) * 0.014, 0.094 + Math.sin(a) * 0.014, 0.43],
        [Math.cos(a) * 0.012, 0.094 + Math.sin(a) * 0.012, 0.46],
      ],
      foldedPoints: [
        [Math.cos(a) * 0.012, 0.021 + Math.sin(a) * 0.012, 0.35],
        [Math.cos(a) * 0.014, 0.021 + Math.sin(a) * 0.014, 0.38],
        [Math.cos(a) * 0.012, 0.021 + Math.sin(a) * 0.012, 0.406],
      ],
      radius: 0.0048,
      endRadius: 0.003,
      color: "#81789f",
    });
  }
  LOBELIA_MODEL.organs.push({
    name: "lobelia style inside anther tube",
    cluster: c,
    points: [
      [0, 0, 0.01],
      [0, 0.083, 0.26],
      [0, 0.095, 0.485],
    ],
    foldedPoints: [
      [0, 0, 0.01],
      [0, 0.018, 0.24],
      [0, 0.021, 0.405],
    ],
    radius: 0.0035,
    endRadius: 0.003,
    color: "#c9c5b4",
  });
  for (const side of [-1, 1])
    LOBELIA_MODEL.organs.push({
      name: "two lobelia stigma lobes",
      cluster: c,
      points: [
        [0, 0.095, 0.485],
        [side * 0.012, 0.097, 0.495],
        [side * 0.021, 0.097, 0.491],
      ],
      foldedPoints: [
        [0, 0.021, 0.405],
        [side * 0.004, 0.022, 0.409],
        [side * 0.006, 0.022, 0.411],
      ],
      radius: 0.005,
      endRadius: 0.004,
      flatten: 0.55,
      color: "#e5dfc7",
    });
  for (const side of [-1, 1])
    for (let hair = 0; hair < 3; hair++)
      LOBELIA_MODEL.organs.push({
        name: "lower anther beard hair",
        cluster: c,
        fine: true,
        points: [
          [side * 0.008, 0.08, 0.455],
          [side * (0.009 + hair * 0.003), 0.075, 0.475],
          [side * (0.013 + hair * 0.003), 0.073, 0.482],
        ],
        foldedPoints: [
          [side * 0.008, 0.01, 0.402],
          [side * (0.009 + hair * 0.003), 0.009, 0.416],
          [side * (0.013 + hair * 0.003), 0.007, 0.422],
        ],
        radius: 0.0014,
        endRadius: 0.0004,
        color: "#efe9d7",
      });
}
export const LOBELIA_HEAD_CENTER: Vec3 = [0, 0.12, 0.29];
for (let cluster = 0; cluster < 9; cluster++)
  LOBELIA_MODEL.organs.push({
    name: "subinferior lobelia ovary",
    cluster,
    points: [
      [0, 0, -0.055],
      [0, 0, -0.021],
      [0, 0, 0.012],
    ],
    radius: 0.029,
    endRadius: 0.02,
    color: "#87a16b",
  });
for (const organ of LOBELIA_MODEL.organs)
  if (organ.cluster >= 7 && organ.foldedPoints)
    organ.points = organ.foldedPoints.map((p) => [...p] as Vec3);
