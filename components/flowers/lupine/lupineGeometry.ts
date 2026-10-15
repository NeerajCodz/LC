import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenOrgan,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";

/** Three illustrative loose whorls, followed by three younger terminal flowers. */
export const LUPINE_FLOWER_POSITIONS: Vec3[] = Array.from(
  { length: 24 },
  (_, i) => {
    const young = i >= 21,
      level = Math.floor(i / 7),
      a = (i * Math.PI * 2) / 7 + level * 0.19;
    return [
      Math.sin(a) * (young ? 0.035 : 0.073),
      young ? 1.23 + (i - 21) * 0.095 : 0.1 + level * 0.36,
      Math.cos(a) * (young ? 0.035 : 0.073),
    ];
  },
);
export function lupineBanner(u: number, v: number, open: number): Vec3 {
  const w = 2 * u - 1,
    width = 0.004 + 0.142 * Math.sin(v * Math.PI * 0.98) ** 0.67,
    r = 0.01 + 0.034 * Math.sin(v * Math.PI);
  return [
    open * w * width + (1 - open) * Math.sin(w * 2.7) * r,
    0.018 + (0.16 + 0.12 * open) * v,
    open * (-0.046 * Math.sin(Math.PI * v) + 0.045 * w * w + 0.025 * v ** 5) +
      (1 - open) * (0.025 + 0.145 * v - Math.cos(w * 2.7) * r),
  ];
}
export function lupineWing(sign: number) {
  return (u: number, v: number, open: number): Vec3 => {
    const w = 2 * u - 1,
      width = 0.003 + 0.058 * Math.sin(Math.PI * v * 0.98) ** 0.7;
    return [
      sign * (0.025 + 0.079 * open * v + width * w * 0.2),
      -0.017 + width * w + 0.008 * Math.sin(Math.PI * v) * open,
      0.028 + (0.145 + 0.13 * open) * v + 0.021 * open * Math.sin(Math.PI * v),
    ];
  };
}
export function lupineKeel(sign: number) {
  return (u: number, v: number, open: number): Vec3 => {
    const a = u * Math.PI,
      r = 0.003 + 0.046 * Math.sin(Math.PI * v * 0.98) ** 0.75;
    return [
      sign * (0.001 + r * Math.sin(a) * (0.45 + 0.55 * open)),
      -0.055 - r * Math.cos(a) + 0.052 * v ** 4 * open,
      0.018 + (0.15 + 0.135 * open) * v,
    ];
  };
}
function organPose(points: Vec3[], open: number): Vec3[] {
  return points.map(([x, y, z]) => [
    x * (0.3 + 0.7 * open),
    (-0.04 + (y + 0.04) * 0.48) * (1 - open) + y * open,
    z * (0.53 + 0.47 * open),
  ]);
}
export const LUPINE_STALKS: SpecimenOrgan[] = [
  {
    name: "upright lupine raceme axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.008, 0.72, 0],
      [0, 1.5, 0],
    ],
    radius: 0.022,
    endRadius: 0.007,
    color: "#66844f",
  },
  ...LUPINE_FLOWER_POSITIONS.map((p): SpecimenOrgan => ({
    name: "short lupine pedicel",
    cluster: 0,
    points: [
      [0, Math.max(0, p[1] - 0.035), 0],
      [p[0] * 0.65, p[1] - 0.012, p[2] * 0.65],
      p,
    ],
    radius: 0.009,
    endRadius: 0.005,
    color: "#72905a",
  })),
];
export const LUPINE_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...LUPINE_FLOWER_POSITIONS.map((position, i) => ({
      position,
      rotation: [
        i >= 21 ? -0.45 : 0.04,
        (i * Math.PI * 2) / 7 + Math.floor(i / 7) * 0.19,
        0,
      ] as Vec3,
      scale: i >= 21 ? 0.6 - (i - 21) * 0.075 : 1 - Math.floor(i / 7) * 0.04,
      nod: 0.017,
    })),
  ],
  surfaces: [],
  organs: [...LUPINE_STALKS],
};
for (let i = 0; i < 24; i++) {
  const cluster = i + 1,
    young = i >= 21,
    delay = Math.floor(i / 7) * 0.09,
    stage = (open: number) => open * (young ? 0.055 : 1);
  const petal = (
    name: string,
    role: SpecimenSurface["role"],
    sample: SpecimenSurface["sample"],
  ): SpecimenSurface => ({
    name,
    role,
    tissue: role === "banner" ? "guide" : undefined,
    cluster,
    sample: (u, v, open) => sample(u, v, stage(open)),
    thickness: 0.006,
    flexible: !young,
    delay,
    cage: [3, 3],
    mobileCage: [1, 1],
    overviewColumns: 4,
    overviewRows: 2,
    compliance: 0.000035,
    shapeCompliance: 0.0002,
  });
  LUPINE_MODEL.surfaces.push(
    petal("grooved reflexed banner", "banner", lupineBanner),
    ...[-1, 1].map((s) =>
      petal("enveloping lateral wing", "wing", lupineWing(s)),
    ),
    ...[-1, 1].map((s) =>
      petal("paired upcurved enclosing keel", "keel", lupineKeel(s)),
    ),
  );
  for (let lip = 0; lip < 2; lip++)
    LUPINE_MODEL.surfaces.push({
      name: lip ? "lower calyx lip" : "upper calyx lip",
      role: "calyx",
      cluster,
      thickness: 0.006,
      overviewColumns: 4,
      overviewRows: 2,
      sample: (u, v): Vec3 => {
        const a = (u + lip) * Math.PI,
          r = 0.022 + 0.022 * Math.sin(v * Math.PI * 0.7);
        return [Math.cos(a) * r, Math.sin(a) * r - 0.018, -0.02 + 0.085 * v];
      },
    });
  const add = (
    name: string,
    points: Vec3[],
    radius: number,
    color: string,
    endRadius = radius * 0.7,
    fine = false,
  ) => {
    LUPINE_MODEL.organs.push({
      name,
      cluster,
      points: organPose(points, young ? 0.055 : 1),
      foldedPoints: organPose(points, 0),
      radius,
      endRadius,
      foldedRadius: radius * 0.6,
      color,
      fine,
    });
  };
  add(
    "joined stamen column",
    [
      [0, -0.05, 0.025],
      [0, -0.055, 0.075],
      [0, -0.052, 0.125],
    ],
    0.019,
    "#e0d6ac",
  );
  for (let j = 0; j < 10; j++) {
    const a = (j * Math.PI) / 5,
      x = Math.sin(a) * 0.013,
      y = -0.047 + Math.cos(a) * 0.012,
      z = j % 2 ? 0.202 : 0.221,
      antherLength = j % 2 ? 0.022 : 0.009;
    add(
      "monadelphous stamen filament",
      [
        [x * 0.7, y, 0.115],
        [x, y - 0.003, 0.165],
        [x, y + 0.01, z],
      ],
      0.0025,
      "#e4dac0",
    );
    add(
      "dimorphic stamen anther",
      [
        [x, y + 0.01, z],
        [x, y + 0.014, z + antherLength * 0.45],
        [x, y + 0.012, z + antherLength],
      ],
      j % 2 ? 0.006 : 0.0045,
      "#d5bc67",
      0.0035,
    );
  }
  add(
    "brushy curved style",
    [
      [0, -0.055, 0.027],
      [0, -0.05, 0.175],
      [0, -0.006, 0.26],
    ],
    0.004,
    "#cad0a6",
    0.003,
  );
  for (let j = 0; j < 3; j++) {
    const a = (j * Math.PI * 2) / 3;
    add(
      "style brush hair",
      [
        [0, -0.009, 0.25],
        [Math.sin(a) * 0.006, -0.006 + Math.cos(a) * 0.006, 0.256],
        [Math.sin(a) * 0.008, -0.006 + Math.cos(a) * 0.008, 0.264],
      ],
      0.0011,
      "#e9dfbc",
      0.0004,
      true,
    );
  }
}
