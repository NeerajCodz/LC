import type { Vec3 } from "@/lib/flowers/types";
import type {
  SpecimenModel,
  SpecimenOrgan,
  SpecimenSurface,
  SpecimenInstanceGroup,
} from "@/lib/three/specimenModel";
import { radialFloretPoses } from "@/lib/three/floretInstances";
export function gerberaLigule(index: number) {
  const a = (index * Math.PI) / 16,
    length = 0.78 + 0.045 * Math.sin(index * 1.7);
  return (u: number, v: number, open: number): Vec3 => {
    const tip = 0.5 + 0.5 * Math.cos(u * Math.PI * 6),
      w =
        (2 * u - 1) *
        (0.002 + 0.103 * Math.sin(v * Math.PI * 0.82) ** 0.66) *
        (0.18 + 0.82 * open) *
        (1 - 0.88 * (1 - open) * v ** 12);
    const r =
      (0.285 * (1 - v) + 0.06 * Math.sin(Math.PI * v)) * (1 - open) +
      (0.285 + length * v - 0.024 * tip * v ** 10) * open;
    const y =
      0.45 * Math.sin(v * Math.PI * 0.72) * (1 - open) +
      (0.03 +
        0.1 * Math.sin(Math.PI * v) +
        0.035 * v * v +
        0.042 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v)) *
        open;
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      y,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
function smallBilateralCorolla(): SpecimenSurface[] {
  return [
    {
      name: "bilateral corolla tube",
      cluster: 0,
      role: "tube",
      tissue: "disc",
      periodic: true,
      thickness: 0.003,
      sample: (u, v, o) => {
        const a = u * Math.PI * 2,
          r = 0.008 + 0.006 * v * o;
        return [Math.cos(a) * r, 0.06 * v, Math.sin(a) * r];
      },
    },
    {
      name: "three-toothed outer limb",
      cluster: 0,
      role: "petal",
      tissue: "disc",
      thickness: 0.0025,
      sample: (u, v, o) => {
        const w = (2 * u - 1) * (0.0015 + 0.022 * Math.sin(v * Math.PI * 0.78)),
          tooth = 0.5 + 0.5 * Math.cos(u * Math.PI * 6);
        return [
          w,
          0.055 + 0.077 * v * (1 - 0.67 * o),
          0.012 + 0.037 * o * v - 0.006 * o * tooth * v ** 10,
        ];
      },
    },
    ...Array.from({ length: 2 }, (_, i) => ({
      name: "paired inner limb",
      cluster: 0,
      role: "petal" as const,
      tissue: "disc" as const,
      thickness: 0.002,
      sample: (u: number, v: number, o: number): Vec3 => {
        const side = i ? 1 : -1,
          w = (2 * u - 1) * (0.001 + 0.004 * Math.sin(Math.PI * v));
        return [
          side * 0.009 + w,
          0.055 + 0.065 * v * (1 - 0.4 * o),
          -0.007 - 0.025 * o * Math.sin(v * Math.PI * 0.8),
        ];
      },
    })),
  ];
}
function smallStyles(): SpecimenOrgan[] {
  return [
    {
      name: "pistil style",
      cluster: 0,
      points: [
        [0, 0.015, 0],
        [0, 0.09, 0],
        [0, 0.155, 0],
      ],
      foldedPoints: [
        [0, 0.01, 0],
        [0, 0.036, 0],
        [0, 0.06, 0],
      ],
      radius: 0.002,
      endRadius: 0.002,
      color: "#c9bc92",
    },
    ...[-1, 1].map((side) => ({
      name: "pistil style arm",
      cluster: 0,
      points: [
        [0, 0.145, 0],
        [side * 0.005, 0.162, 0],
        [side * 0.009, 0.167, 0.003],
      ] as Vec3[],
      foldedPoints: [
        [0, 0.055, 0],
        [side * 0.002, 0.064, 0],
        [side * 0.004, 0.069, 0.001],
      ] as Vec3[],
      radius: 0.002,
      endRadius: 0.0024,
      color: "#d7c6a1",
    })),
  ];
}
const disk: SpecimenInstanceGroup = {
  name: "bisexual bilateral disk florets",
  cluster: 0,
  poses: radialFloretPoses(64, 0.25, 0.028, 1601).map((p) => ({
    ...p,
    position: [p.position[0], p.position[1] + 0.025, p.position[2]] as Vec3,
    foldedPosition: [p.position[0] * 0.18, 0.05, p.position[2] * 0.18] as Vec3,
  })),
  surfaces: smallBilateralCorolla(),
  organs: [
    ...smallStyles(),
    ...Array.from({ length: 5 }, (_, i) => {
      const a = (i * Math.PI * 2) / 5,
        x = Math.sin(a) * 0.009,
        z = Math.cos(a) * 0.009;
      return {
        name: "stamen anther",
        cluster: 0,
        points: [
          [x, 0.077, z],
          [x, 0.106, z],
          [x, 0.13, z],
        ] as Vec3[],
        foldedPoints: [
          [x * 0.5, 0.03, z * 0.5],
          [x * 0.5, 0.042, z * 0.5],
          [x * 0.5, 0.053, z * 0.5],
        ] as Vec3[],
        radius: 0.0034,
        endRadius: 0.0025,
        color: "#ba9b65",
      };
    }),
  ],
};
const inner: SpecimenInstanceGroup = {
  name: "inner female rays",
  cluster: 0,
  poses: Array.from({ length: 24 }, (_, i) => {
    const a = (i * Math.PI) / 12;
    return {
      position: [Math.sin(a) * 0.294, 0.025, Math.cos(a) * 0.294] as Vec3,
      foldedPosition: [Math.sin(a) * 0.06, 0.068, Math.cos(a) * 0.06] as Vec3,
      rotation: [0, a, 0] as Vec3,
      scale: 0.95 + (i % 3) * 0.04,
      delay: 0.08,
      phase: i * 0.71,
    };
  }),
  surfaces: smallBilateralCorolla(),
  organs: smallStyles(),
};
export const GERBERA_MODEL: SpecimenModel = {
  clusters: [
    { position: [0, 0, 0], rotation: [1.05, 0, 0], scale: 1, nod: 0.01 },
  ],
  surfaces: [],
  organs: [
    {
      name: "floral receptacle",
      cluster: 0,
      points: [
        [0, -0.17, 0],
        [0, -0.06, 0],
        [0, 0.025, 0],
      ],
      radius: 0.24,
      endRadius: 0.3,
      color: "#9b9870",
    },
  ],
  instances: [inner, disk],
};
export const GERBERA_STALKS: SpecimenOrgan[] = [];
for (let i = 0; i < 32; i++) {
  const a = (i * Math.PI) / 16;
  GERBERA_MODEL.surfaces.push({
    name: "outer ray ligule",
    cluster: 0,
    role: "petal",
    sample: gerberaLigule(i),
    thickness: 0.011,
    flexible: true,
    cage: [3, 5],
    mobileCage: [2, 3],
    delay: (i % 2) * 0.018,
    compliance: 0.00006,
    shapeCompliance: 0.0005,
  });
  GERBERA_MODEL.surfaces.push({
    name: "outer ray tube",
    cluster: 0,
    role: "petal",
    periodic: true,
    thickness: 0.003,
    sample: (u, v) => {
      const t = u * Math.PI * 2;
      return [
        Math.sin(a) * 0.285 + Math.cos(t) * 0.009,
        0.015 + 0.05 * v,
        Math.cos(a) * 0.285 + Math.sin(t) * 0.009,
      ];
    },
  });
  for (const side of [-1, 1])
    GERBERA_MODEL.surfaces.push({
      name: "ray inner lip",
      cluster: 0,
      role: "petal",
      thickness: 0.0025,
      sample: (u, v, o) => {
        const w = (2 * u - 1) * (0.0015 + 0.004 * Math.sin(Math.PI * v)),
          r = 0.285 - 0.024 * o * Math.sin(v * Math.PI * 0.8);
        return [
          Math.sin(a) * r + Math.cos(a) * (side * 0.008 + w),
          0.058 + 0.075 * v * (1 - 0.45 * o),
          Math.cos(a) * r - Math.sin(a) * (side * 0.008 + w),
        ];
      },
    });
  GERBERA_MODEL.organs.push({
    name: "female ray pistil style",
    cluster: 0,
    points: [
      [Math.sin(a) * 0.285, 0.02, Math.cos(a) * 0.285],
      [Math.sin(a) * 0.285, 0.08, Math.cos(a) * 0.285],
      [Math.sin(a) * 0.285, 0.15, Math.cos(a) * 0.285],
    ],
    foldedPoints: [
      [Math.sin(a) * 0.22, 0.02, Math.cos(a) * 0.22],
      [Math.sin(a) * 0.18, 0.09, Math.cos(a) * 0.18],
      [Math.sin(a) * 0.15, 0.14, Math.cos(a) * 0.15],
    ],
    radius: 0.003,
    endRadius: 0.003,
    color: "#d6bb93",
  });
  for (const side of [-1, 1])
    GERBERA_MODEL.organs.push({
      name: "female ray pistil style arm",
      cluster: 0,
      points: [
        [Math.sin(a) * 0.285, 0.14, Math.cos(a) * 0.285],
        [
          Math.sin(a) * 0.285 + Math.cos(a) * side * 0.006,
          0.156,
          Math.cos(a) * 0.285 - Math.sin(a) * side * 0.006,
        ],
        [
          Math.sin(a) * 0.285 + Math.cos(a) * side * 0.01,
          0.161,
          Math.cos(a) * 0.285 - Math.sin(a) * side * 0.01,
        ],
      ],
      foldedPoints: [
        [Math.sin(a) * 0.15, 0.13, Math.cos(a) * 0.15],
        [
          Math.sin(a) * 0.15 + Math.cos(a) * side * 0.003,
          0.143,
          Math.cos(a) * 0.15 - Math.sin(a) * side * 0.003,
        ],
        [
          Math.sin(a) * 0.15 + Math.cos(a) * side * 0.005,
          0.15,
          Math.cos(a) * 0.15 - Math.sin(a) * side * 0.005,
        ],
      ],
      radius: 0.003,
      endRadius: 0.0035,
      color: "#dabd96",
    });
}
GERBERA_MODEL.surfaces.push({
  name: "involucral receptacle wall",
  cluster: 0,
  role: "calyx",
  periodic: true,
  thickness: 0.019,
  contactObstacle: true,
  cage: [12, 3],
  mobileCage: [8, 2],
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r = 0.23 + 0.06 * v;
    return [Math.cos(a) * r, -0.17 + 0.17 * v, Math.sin(a) * r];
  },
});
for (let i = 0; i < 24; i++) {
  const a = (i * Math.PI) / 12;
  GERBERA_MODEL.surfaces.push({
    name: "involucral phyllary",
    cluster: 0,
    role: "calyx",
    thickness: 0.012,
    sample: (u, v, o) => {
      const w = (2 * u - 1) * (0.003 + 0.049 * Math.sin(Math.PI * v)),
        r =
          (0.26 * (1 - v) + 0.06 * Math.sin(Math.PI * v)) * (1 - o) +
          (0.245 + 0.1 * v) * o;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        -0.15 + v * (0.54 - 0.37 * o),
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
