import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** One hollow bilateral corolla: fused upper pair and a three-lobed lower lip. */
export function toreniaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.05 : 1),
    a = u * Math.PI * 2,
    t = Math.max(0, (v - 0.57) / 0.43),
    upper = Math.max(0, Math.sin(a));
  let lobes = 0;
  for (const [center, size] of [
    [1.18, 0.14],
    [Math.PI - 1.18, 0.14],
    [Math.PI + 0.4, 0.145],
    [Math.PI * 1.5, 0.2],
    [Math.PI * 2 - 0.4, 0.145],
  ]) {
    const d = Math.atan2(Math.sin(a - center), Math.cos(a - center));
    lobes += size * Math.exp(-((d / 0.34) ** 2));
  }
  const mature =
      0.048 + 0.105 * Math.sin(v * Math.PI * 0.72) + t ** 2 * (0.065 + lobes),
    bud = 0.028 + 0.07 * Math.sin(Math.PI * v);
  const r = bud * (1 - open) + mature * open;
  return [
    Math.cos(a) * r,
    Math.sin(a) * r * (0.64 + 0.13 * upper * open),
    0.1 + (0.49 + 0.11 * open) * v + 0.058 * lobes * t * open,
  ];
}
export const TORENIA_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 5 }, (_, i) => ({
    position: [
      i < 3 ? (i - 1) * 0.38 : i === 3 ? -0.19 : 0.23,
      -0.24 + i * 0.24,
      0.035 + (i % 2) * 0.08,
    ] as Vec3,
    rotation: [-0.06, i % 2 ? 0.32 : -0.27, 0] as Vec3,
    scale: i < 3 ? 1 - 0.07 * i : 0.53,
    nod: 0.025,
  })),
  surfaces: [],
  organs: [],
};
export const TORENIA_STALKS: SpecimenOrgan[] = [
  {
    name: "angular torenia shoot",
    cluster: 0,
    points: [
      [0, -0.65, 0],
      [0.015, -0.12, 0],
      [0.01, 0.89, 0],
    ],
    radius: 0.022,
    endRadius: 0.011,
    color: "#7e985e",
  },
  ...TORENIA_MODEL.clusters.map((c): SpecimenOrgan => ({
    name: "torenia flower pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] - 0.13, 0],
      [c.position[0] * 0.45, c.position[1] - 0.035, c.position[2] * 0.55],
      c.position,
    ],
    radius: 0.014,
    endRadius: 0.008,
    color: "#8aa368",
  })),
];
for (let c = 0; c < 5; c++) {
  const young = c >= 3,
    delay = 0.08 + c * 0.025;
  TORENIA_MODEL.surfaces.push({
    name: "bilateral torenia trumpet",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.014,
    overviewColumns: 32,
    overviewRows: 5,
    sample: (u, v, o) => toreniaCorolla(u, v, o, young),
    flexible: true,
    cage: [16, 7],
    mobileCage: [8, 5],
    delay,
    compliance: 0.000055,
    shapeCompliance: 0.00038,
  });
  // Broad wings are continuous radial ridges on one fused calyx, not detached sepals.
  TORENIA_MODEL.surfaces.push({
    name: "five-winged fused torenia calyx",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.011,
    overviewColumns: 30,
    overviewRows: 4,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        wing = (0.5 + 0.5 * Math.cos(a * 5)) ** 7,
        r =
          0.047 +
          0.044 * Math.sin(Math.PI * v * 0.7) +
          0.051 * wing * Math.sin(Math.PI * v);
      return [
        Math.cos(a) * r,
        Math.sin(a) * r,
        -0.025 + 0.355 * v + 0.035 * Math.cos(a * 2) * v ** 5,
      ];
    },
  });
  // Finite overlapping lips close the bud without collapsing a periodic rim to a point.
  for (let i = 0; i < 5; i++)
    TORENIA_MODEL.surfaces.push({
      name: "folded torenia lip tissue",
      cluster: c,
      role: "petal",
      tissue: i < 2 ? "disc" : i === 3 ? "guide" : undefined,
      thickness: 0.012,
      overviewRows: 2,
      delay,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.05 : 1),
          a = [
            1.18,
            Math.PI - 1.18,
            Math.PI + 0.4,
            Math.PI * 1.5,
            Math.PI * 2 - 0.4,
          ][i],
          w = 2 * u - 1,
          angle = a + w * 0.72,
          root = toreniaCorolla(angle / (Math.PI * 2), 0.82, stage, young),
          rim = toreniaCorolla(angle / (Math.PI * 2), 1, stage, young),
          width = w * (0.009 + 0.016 * Math.sin(Math.PI * v)),
          radius = 0.057 * (1 - v) - 0.011 * v;
        const closed: Vec3 = [
          Math.cos(a) * radius - Math.sin(a) * width,
          Math.sin(a) * radius + Math.cos(a) * width,
          0.565 + 0.071 * v + i * 0.001,
        ];
        return [
          closed[0] * (1 - open) + (root[0] * (1 - v) + rim[0] * v) * open,
          closed[1] * (1 - open) + (root[1] * (1 - v) + rim[1] * v) * open,
          closed[2] * (1 - open) +
            (root[2] * (1 - v) + rim[2] * v + 0.019 * v) * open,
        ];
      },
    });
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1,
      long = i >= 2,
      z = long ? 0.51 : 0.41,
      points: Vec3[] = [
        [side * 0.043, 0.042, 0.18],
        [side * 0.064, 0.107, z - 0.13],
        [side * 0.013, 0.122, z],
      ];
    const folded: Vec3[] = points.map(([px, py, pz]) => [
      px * 0.32,
      py * 0.3,
      pz * 0.83,
    ]);
    TORENIA_MODEL.organs.push({
      name: "didynamous torenia filament",
      cluster: c,
      bloomMorph: true,
      points,
      foldedPoints: folded,
      radius: 0.0045,
      endRadius: 0.003,
      color: "#e4d4c0",
    });
    for (const chamber of [-1, 1])
      TORENIA_MODEL.organs.push({
        name: "paired torenia anther chamber",
        cluster: c,
        points: [
          [side * 0.013, 0.122, z],
          [side * 0.022, 0.122 + chamber * 0.009, z + 0.013],
          [side * 0.037, 0.122 + chamber * 0.007, z + 0.024],
        ],
        foldedPoints: [
          [side * 0.004, 0.037, z * 0.83],
          [side * 0.007, 0.037 + chamber * 0.003, z * 0.83 + 0.01],
          [side * 0.012, 0.037 + chamber * 0.002, z * 0.83 + 0.02],
        ],
        radius: 0.006,
        endRadius: 0.004,
        flatten: 0.65,
        color: "#dbbc84",
      });
  }
  TORENIA_MODEL.organs.push({
    name: "included torenia style",
    cluster: c,
    points: [
      [0, 0.012, 0.045],
      [0, 0.082, 0.32],
      [0, 0.132, 0.56],
    ],
    foldedPoints: [
      [0, 0.005, 0.035],
      [0, 0.022, 0.26],
      [0, 0.036, 0.49],
    ],
    radius: 0.0045,
    endRadius: 0.003,
    color: "#e8d2b0",
  });
  for (let lobe = 0; lobe < 2; lobe++)
    TORENIA_MODEL.surfaces.push({
      name: "bilamellate torenia stigma",
      cluster: c,
      role: "petal",
      tissue: "inner",
      thickness: 0.006,
      overviewRows: 3,
      delay,
      sample: (u, v, o) => toreniaStigma(u, v, o * (young ? 0.05 : 1), lobe),
    });
}
/** Inner surfaces face into the V; the contact state is intentionally separate. */
export function toreniaStigma(
  u: number,
  v: number,
  open: number,
  lobe: number,
  closure = 0,
): Vec3 {
  const side = lobe ? 1 : -1,
    w = 2 * u - 1,
    spread = 0.034 * open * (1 - closure),
    width = 0.004 + 0.026 * Math.sin(Math.PI * v) ** 0.8;
  return [
    w * width,
    0.036 + 0.096 * open + side * (0.006 + spread) * v,
    0.49 + 0.07 * open + 0.041 * v + 0.006 * w * w,
  ];
}
export const TORENIA_HEAD_CENTER: Vec3 = [0, 0.02, 0.49];
for (let cluster = 0; cluster < 5; cluster++)
  TORENIA_MODEL.organs.push({
    name: "superior torenia ovary",
    cluster,
    points: [
      [0, 0, -0.005],
      [0, 0.012, 0.04],
      [0, 0.014, 0.078],
    ],
    radius: 0.036,
    endRadius: 0.019,
    color: "#95a475",
  });
for (const organ of TORENIA_MODEL.organs)
  if (organ.cluster >= 3 && organ.foldedPoints)
    organ.points = organ.foldedPoints.map((p) => [...p] as Vec3);
