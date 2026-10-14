import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenSurface,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

/** Authored sixteen-flower study; all blossoms share one opening schedule. */
export const WISTERIA_FLOWER_POSITIONS: Vec3[] = Array.from(
  { length: 16 },
  (_, i) => {
    if (i === 0) return [0, 0, 0];
    const angle = i * 2.3999632297,
      radius = 0.12 + 0.025 * Math.sin(i * 0.73);
    return [
      Math.sin(angle) * radius,
      -i * 0.12,
      -0.14 + Math.cos(angle) * radius,
    ];
  },
);
export const WISTERIA_STEM_LENGTH = 3.4;
export const WISTERIA_SUPPORT_HEIGHT = 0.72;
/** Negative X/Z polar angle winds counter-clockwise when viewed down the support. */
export const WISTERIA_SHOOT_POINTS: Vec3[] = Array.from(
  { length: 85 },
  (_, i) => {
    const t = i / 84,
      angle = -Math.PI * 2 * 3.2 * t,
      gather = Math.max(0, (t - 0.88) / 0.12),
      x = -0.12 + 0.12 * Math.cos(angle),
      z = 0.015 + 0.12 * Math.sin(angle);
    return [
      x * (1 - gather),
      -WISTERIA_STEM_LENGTH + WISTERIA_STEM_LENGTH * t,
      z * (1 - gather) - 0.015 * (1 - t),
    ];
  },
);

export function wisteriaBanner(u: number, v: number, open: number): Vec3 {
  const across = 2 * u - 1,
    width = 0.006 + 0.43 * Math.sin(v * Math.PI * 0.985) ** 0.72,
    radius = 0.006 + 0.077 * Math.sin(v * Math.PI * 0.97),
    ruffle = 0.009 * Math.sin(u * 31 + v * 5) * Math.sin(Math.PI * v) ** 2;
  return [
    open * across * width + (1 - open) * Math.sin(across * 2.7) * radius,
    0.045 + (0.34 + 0.29 * open) * v,
    open *
      (0.028 + 0.145 * across ** 2 - 0.1 * Math.sin(Math.PI * v) + ruffle) +
      (1 - open) * (0.025 + 0.27 * v - Math.cos(across * 2.7) * radius),
  ];
}
export function wisteriaWing(sign: number): SpecimenSurface["sample"] {
  return (u, v, open) => {
    const across = 2 * u - 1,
      width = 0.004 + 0.14 * Math.sin(v * Math.PI * 0.985) ** 0.68;
    return [
      sign * (0.035 + (0.065 + 0.22 * open) * v + width * across * 0.35),
      -0.024 + width * across + open * 0.024 * Math.sin(v * Math.PI),
      0.028 + (0.29 + 0.25 * open) * v + 0.045 * open * Math.sin(v * Math.PI),
    ];
  };
}
export function wisteriaKeel(sign: number): SpecimenSurface["sample"] {
  return (u, v, open) => {
    const radius = 0.004 + 0.115 * Math.sin(v * Math.PI * 0.985) ** 0.72,
      angle = u * Math.PI;
    return [
      sign * (0.0025 + radius * Math.sin(angle) * (0.44 + 0.56 * open)),
      -0.076 - radius * Math.cos(angle) + 0.059 * v ** 4 * open,
      0.025 + (0.285 + 0.26 * open) * v,
    ];
  };
}

function includedStamens(cluster: number): SpecimenOrgan[] {
  return Array.from({ length: 10 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 10,
      x = Math.sin(angle) * 0.026;
    return {
      name: i === 9 ? "free tenth stamen" : "united stamen",
      overviewSides: 3,
      cluster,
      points: [
        [x, -0.074, 0.035],
        [x * 1.05, -0.1, 0.22],
        [x * 1.22, -0.06, 0.42],
      ],
      foldedPoints: [
        [x * 0.65, -0.074, 0.035],
        [x * 0.68, -0.096, 0.14],
        [x * 0.72, -0.072, 0.27],
      ],
      radius: 0.0037,
      endRadius: 0.0065,
      color: "#e0cd9a",
    };
  });
}

function rachisLocal([x, y, z]: Vec3): Vec3 {
  return [
    x / 0.58,
    (Math.cos(0.16) * y + Math.sin(0.16) * z) / 0.58,
    (-Math.sin(0.16) * y + Math.cos(0.16) * z) / 0.58,
  ];
}

// The shared surface renderer adds a small index phase; cancel it across a raceme.
function racemeDelay(cluster: number, organIndex: number, start: number) {
  return start - (cluster * 10 + organIndex) * 0.31 * 0.004;
}

export const WISTERIA_MODEL: SpecimenModel = {
  clusters: WISTERIA_FLOWER_POSITIONS.map((position, i) => ({
    ...SINGLE_CLUSTER,
    position,
    rotation: [0.16, i === 0 ? 0 : i * 2.3999632297, 0] as Vec3,
    scale: 0.58 - (i / 15) * 0.17,
    // Cluster zero owns the long carrier; other flowers pivot at fixed pedicel tips.
    nod: i === 0 ? 0 : 0.009 + (i / 15) * 0.011,
  })),
  surfaces: WISTERIA_FLOWER_POSITIONS.flatMap((_, cluster) => [
    {
      name: "standard banner",
      cluster,
      role: "banner" as const,
      sample: wisteriaBanner,
      thickness: 0.011,
      flexible: true,
      delay: racemeDelay(cluster, 0, 0.08),
      cage: [4, 4] as [number, number],
      mobileCage: [1, 2] as [number, number],
      compliance: 0.000065,
    },
    ...[-1, 1].map((sign, side) => ({
      name: "lateral wing",
      cluster,
      role: "wing" as const,
      sample: wisteriaWing(sign),
      thickness: 0.012,
      flexible: true,
      delay: racemeDelay(cluster, side + 1, 0.105),
      cage: [3, 4] as [number, number],
      mobileCage: [1, 2] as [number, number],
      compliance: 0.000036,
    })),
    ...[-1, 1].map((sign, side) => ({
      name: "paired enclosing keel",
      cluster,
      role: "keel" as const,
      tissue: "inner" as const,
      sample: wisteriaKeel(sign),
      thickness: 0.013,
      flexible: true,
      delay: racemeDelay(cluster, side + 3, 0.105),
      cage: [3, 4] as [number, number],
      mobileCage: [1, 2] as [number, number],
      compliance: 0.000028,
    })),
    ...Array.from({ length: 5 }, (_, i) => ({
      name: "short calyx tooth",
      cluster,
      role: "calyx" as const,
      thickness: 0.008,
      sample: (u: number, v: number): Vec3 => {
        const angle = (i * Math.PI * 2) / 5,
          width = (2 * u - 1) * (0.003 + 0.03 * Math.sin(v * Math.PI)),
          radius = 0.03 + 0.043 * v;
        return [
          Math.sin(angle) * radius + Math.cos(angle) * width,
          Math.cos(angle) * radius - Math.sin(angle) * width,
          -0.075 + 0.17 * v,
        ];
      },
    })),
  ]),
  organs: [
    {
      name: "pendant raceme rachis",
      cluster: 0,
      points: (
        [
          [0, 0.17, -0.14],
          [0.015, -0.8, -0.14],
          [0, -1.86, -0.14],
        ] as Vec3[]
      ).map(rachisLocal),
      radius: 0.024,
      endRadius: 0.009,
      color: "#76865a",
    },
    // In cluster zero's coordinates so the whole rachis remains one connected shoot.
    ...WISTERIA_FLOWER_POSITIONS.map((position, i) => {
      const target = i === 0 ? ([0, 0, 0] as Vec3) : position;
      return {
        name: "raceme flower pedicel",
        cluster: 0,
        points: [
          rachisLocal([0, position[1] + 0.05, -0.14]),
          rachisLocal([
            target[0] * 0.65,
            position[1] + 0.025,
            target[2] - 0.04,
          ]),
          rachisLocal(target),
        ],
        radius: 0.013,
        endRadius: 0.007,
        color: "#829160",
      };
    }),
    ...WISTERIA_FLOWER_POSITIONS.flatMap((_, cluster) => [
      ...includedStamens(cluster),
      {
        name: "included curved style",
        overviewSides: 3,
        cluster,
        points: [
          [0, -0.115, 0.035],
          [0, -0.09, 0.24],
          [0, -0.005, 0.435],
        ] as Vec3[],
        foldedPoints: [
          [0, -0.115, 0.035],
          [0, -0.09, 0.15],
          [0, -0.025, 0.28],
        ] as Vec3[],
        radius: 0.006,
        endRadius: 0.008,
        color: "#c5cba2",
      },
    ]),
  ],
};
