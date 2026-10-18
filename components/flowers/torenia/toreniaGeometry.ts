import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** One continuous hollow corolla: broad notched roof and three rounded landing lobes. */
export function toreniaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.05 : 1),
    a = u * Math.PI * 2,
    t = Math.max(0, (v - 0.53) / 0.47),
    flare = t * t * (3 - 2 * t),
    upper = Math.max(0, Math.sin(a)),
    lower = Math.max(0, -Math.sin(a)),
    roofBlend = 0.5 + 0.5 * Math.tanh(Math.sin(a) * 7);
  let lowerLobes = 0;
  for (const center of [Math.PI + 0.48, Math.PI * 1.5, Math.PI * 2 - 0.48]) {
    const d = Math.atan2(Math.sin(a - center), Math.cos(a - center));
    lowerLobes += 0.125 * Math.exp(-((d / 0.42) ** 4));
  }
  const notch = 0.018 * Math.exp(-(((a - Math.PI / 2) / 0.1) ** 2)),
    fan = 0.32 * (0.58 + 0.42 * (1 - Math.exp(-(upper * upper) / 0.08))),
    outline = (fan - notch) * roofBlend + (0.18 + lowerLobes) * (1 - roofBlend),
    neck = 0.023 + 0.1 * Math.sin(v * Math.PI * 0.7),
    mature = neck * (1 - flare) + outline * flare,
    // Keep a finite furled tip: its two skins never collapse onto the axis.
    bud = 0.027 + 0.06 * Math.sin(Math.PI * v) - 0.021 * v ** 5;
  const r = bud * (1 - open) + mature * open;
  return [
    Math.cos(a) * r,
    Math.sin(a) * r * (0.84 + 0.04 * lower * open),
    0.08 +
      (0.51 + 0.11 * open) * v +
      flare * (0.025 * lower - 0.09 * upper) * open,
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
    thickness: 0.008,
    overviewColumns: 32,
    overviewRows: 8,
    minimumColumns: 40,
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
    minimumColumns: 40,
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
  for (let i = 0; i < 4; i++) {
    const side = i % 2 ? 1 : -1,
      long = i >= 2,
      z = long ? 0.58 : 0.46,
      points: Vec3[] = [
        [side * 0.043, 0.02, 0.24],
        [side * 0.08, 0.05, z - 0.12],
        [side * 0.009, 0.1, z],
      ];
    const folded: Vec3[] = points.map(([px, py, pz]) => [
      px * 0.32,
      py * 0.3,
      pz * 0.72,
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
          [side * 0.009, 0.1, z],
          [side * 0.005, 0.1 + chamber * 0.009, z + 0.008],
          [side * 0.003, 0.1 + chamber * 0.007, z + 0.016],
        ],
        foldedPoints: [
          [side * 0.003, 0.03, z * 0.72],
          [side * 0.002, 0.03 + chamber * 0.003, z * 0.72 + 0.006],
          [side * 0.001, 0.03 + chamber * 0.002, z * 0.72 + 0.012],
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
      [0, 0.022, 0.47],
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
      thickness: 0.003,
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
    size = 0.45 + 0.55 * open,
    // Finite attachment widths and a smooth margin keep the offset skins from folding back.
    width = (0.006 + 0.024 * Math.sin(Math.PI * v) ** 2) * size;
  return [
    w * width,
    0.022 + 0.11 * open + side * (0.004 + 0.002 * open + spread) * v,
    0.47 + 0.09 * open + (0.028 + 0.013 * open) * v + 0.001 * w * w * size,
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
    organ.points = organ.foldedPoints.map((p, i) =>
      organ.name === "included torenia style"
        ? (p.map(
            (coordinate, axis) =>
              coordinate * 0.95 + organ.points[i][axis] * 0.05,
          ) as Vec3)
        : ([...p] as Vec3),
    );
