import type { Quality, Vec3 } from "@/lib/flowers/types";
import { createParametricShell } from "@/lib/three/parametricShell";
import { createOrganicTube } from "@/lib/three/organicTube";
import { joinOrgans } from "@/lib/three/floralOrgans";

export const FUCHSIA_COUNTS = {
  sepals: 4,
  petals: 4,
  stamens: 8,
  stigmaLobes: 4,
} as const;
export const FUCHSIA_MOUTH = -0.47;
export const FUCHSIA_BRANCHES: Vec3[][] = [
  [
    [0, 0, 0],
    [0.12, 0.45, -0.02],
    [0.6, 0.81, 0.015],
    [0.96, 0.71, 0.02],
  ],
  [
    [0, 0.14, 0],
    [-0.23, 0.48, 0.02],
    [-0.55, 0.63, 0.1],
    [-0.85, 0.6, 0.12],
  ],
];
export const FUCHSIA_FLOWERS = [
  { position: [0.96, 0.71, 0.02] as Vec3, scale: 1, phase: 0.2 },
  { position: [-0.85, 0.6, 0.12] as Vec3, scale: 0.82, phase: 2.4 },
] as const;

/** Valvate sepals surround the bud, then spread without reflexing above their insertion. */
export function fuchsiaSepalPoint(
  u: number,
  t: number,
  open: number,
  index = 0,
): Vec3 {
  const across = u * 2 - 1,
    closedRadius = 0.063 * (1 - t) + 0.157 * Math.sin(Math.PI * t) + 0.002 * t;
  const radius = 0.063 + 0.63 * t * (1 + 0.018 * Math.sin(index * 3.1));
  const spread =
    ((1 - t) ** 4 * Math.PI) / 4 +
    ((0.004 + 0.113 * Math.sin(Math.PI * t) ** 0.75) / radius) *
      (1 - (1 - t) ** 4);
  const angle =
    across * (((1 - open) * Math.PI) / 4 + open * spread) +
    open * 0.025 * Math.sin(Math.PI * t) * (index - 1.5);
  const r = closedRadius * (1 - open) + radius * open;
  return [
    Math.sin(angle) * r,
    FUCHSIA_MOUTH -
      (0.86 * (1 - open) + 0.59 * open) * t +
      open * 0.018 * Math.sin(across * 4 + index) * Math.sin(Math.PI * t),
    Math.cos(angle) * r,
  ];
}
export function fuchsiaPetalPoint(
  u: number,
  t: number,
  open: number,
  index = 0,
): Vec3 {
  const across = u * 2 - 1,
    angle = across * (0.81 + 0.18 * t) + open * 0.14 * t;
  const r =
    0.05 + (0.028 * (1 - open) + 0.116 * open) * Math.sin(t * Math.PI * 0.74);
  return [
    Math.sin(angle) * r,
    FUCHSIA_MOUTH -
      t * (0.41 + 0.13 * open) +
      0.028 * across * across * t ** 4 +
      open * 0.009 * Math.sin(across * 7 + index) * t ** 3,
    Math.cos(angle) * r,
  ];
}
export function createFuchsiaBlade(
  kind: "sepal" | "petal",
  quality: Quality,
  index: number,
) {
  return createParametricShell({
    columns:
      quality === "overview" || quality === "low"
        ? 14
        : quality === "medium"
          ? 22
          : 36,
    rows:
      quality === "overview" || quality === "low"
        ? 28
        : quality === "medium"
          ? 42
          : 64,
    thickness: kind === "sepal" ? 0.011 : 0.006,
    sample: (u, t, open) =>
      (kind === "sepal" ? fuchsiaSepalPoint : fuchsiaPetalPoint)(
        u,
        t,
        open,
        index,
      ),
  });
}
export function createFuchsiaHypanthium(quality: Quality) {
  return createParametricShell({
    columns: quality === "overview" || quality === "low" ? 24 : 48,
    rows: quality === "overview" || quality === "low" ? 20 : 36,
    thickness: 0.01,
    periodic: true,
    sample: (u, t) => {
      const a = u * Math.PI * 2,
        r = 0.038 + 0.025 * t + 0.013 * Math.sin(Math.PI * t) ** 2;
      return [Math.sin(a) * r, -0.13 - 0.34 * t, Math.cos(a) * r];
    },
  });
}
export function createFuchsiaOvary(quality: Quality) {
  return createOrganicTube({
    points: [
      [0, 0, 0],
      [0, -0.065, 0],
      [0, -0.14, 0],
    ],
    radius: 0.035,
    endRadius: 0.035,
    segments: quality === "overview" || quality === "low" ? 14 : 28,
    sides: quality === "overview" || quality === "low" ? 10 : 20,
    color: "#587543",
    tipColor: "#914247",
    grain: 0.018,
  });
}

const tube = (
  points: Vec3[],
  radius: number,
  color: string,
  quality: Quality,
  endRadius = radius * 0.7,
) =>
  createOrganicTube({
    points,
    radius,
    endRadius,
    color,
    tipColor: color,
    segments: quality === "overview" || quality === "low" ? 14 : 28,
    sides: quality === "overview" || quality === "low" ? 7 : 12,
    grain: 0.025,
  });
/** The same vertex ordering in both poses keeps filaments and anthers attached during bloom. */
export function createFuchsiaStamen(quality: Quality, index: number) {
  const angle = (index * Math.PI) / 4 + 0.12,
    long = index % 2 === 0,
    h = long ? 0.96 : 0.77;
  const state = (open: number) => {
    const r = 0.033 + 0.083 * open,
      x = Math.sin(angle) * r,
      z = Math.cos(angle) * r,
      y = FUCHSIA_MOUTH - (0.51 * (1 - open) + h * open);
    const parts = [
      tube(
        [
          [
            Math.sin(angle) * 0.043,
            FUCHSIA_MOUTH + 0.03,
            Math.cos(angle) * 0.043,
          ],
          [x * 0.82, FUCHSIA_MOUTH - (0.27 + 0.17 * open), z * 0.82],
          [x, y, z],
        ],
        0.007,
        "#d74775",
        quality,
        0.004,
      ),
    ];
    for (const side of [-1, 1])
      parts.push(
        tube(
          [
            [x + side * 0.009, y + 0.021, z],
            [x + side * 0.013, y, z + 0.006],
            [x + side * 0.01, y - 0.022, z],
          ],
          0.0105,
          "#e8cbbb",
          quality,
          0.007,
        ),
      );
    return joinOrgans(parts);
  };
  const g = state(1),
    bud = state(0);
  g.morphAttributes.position = [bud.getAttribute("position")];
  g.morphAttributes.normal = [bud.getAttribute("normal")];
  bud.dispose();
  return g;
}
export function createFuchsiaPistil(quality: Quality) {
  const state = (open: number) => {
    const end = -1.06 - 0.56 * open,
      parts = [
        tube(
          [
            [0, -0.08, 0],
            [0.009, -0.68, 0.008],
            [0.014, end, 0.012],
          ],
          0.0105,
          "#e35b82",
          quality,
          0.006,
        ),
      ];
    for (let i = 0; i < 4; i++) {
      const a = (i * Math.PI) / 2,
        x = 0.014 + Math.sin(a) * 0.013,
        z = 0.012 + Math.cos(a) * 0.013;
      parts.push(
        tube(
          [
            [x, end + 0.014, z],
            [x, end - 0.003, z],
            [x, end - 0.015, z],
          ],
          0.017,
          "#d99aa7",
          quality,
          0.009,
        ),
      );
    }
    return joinOrgans(parts);
  };
  const g = state(1),
    bud = state(0);
  g.morphAttributes.position = [bud.getAttribute("position")];
  g.morphAttributes.normal = [bud.getAttribute("normal")];
  bud.dispose();
  return g;
}
export function fuchsiaStemPoint(t: number, length: number): Vec3 {
  return [
    Math.sin(t * Math.PI) * 0.075,
    -length + length * t,
    Math.sin(t * Math.PI * 2) * 0.018,
  ];
}
export function createFuchsiaWood(quality: Quality, length: number) {
  return createOrganicTube({
    points: Array.from({ length: 17 }, (_, i) =>
      fuchsiaStemPoint(i / 16, length),
    ),
    radius: 0.035,
    endRadius: 0.023,
    segments: quality === "overview" || quality === "low" ? 36 : 64,
    sides: quality === "overview" || quality === "low" ? 10 : 18,
    color: "#62513d",
    tipColor: "#873e4f",
    grain: 0.12,
  });
}
