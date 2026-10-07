import type { Vec3 } from "@/lib/flowers/types";
import type {
  SpecimenModel,
  SpecimenOrgan,
  SpecimenInstanceGroup,
} from "@/lib/three/specimenModel";
import { radialFloretPoses } from "@/lib/three/floretInstances";
export function zinniaRay(index: number) {
  const layer = Math.floor(index / 14),
    a = ((index % 14) * Math.PI) / 7 + layer * 0.22,
    length = 0.74 - layer * 0.12;
  return (u: number, v: number, open: number): Vec3 => {
    const width = 0.004 + 0.16 * Math.sin(v * Math.PI * 0.83) ** 0.7,
      w =
        (2 * u - 1) *
        width *
        (0.25 + 0.75 * open) *
        (1 - 0.87 * (1 - open) * v ** 12);
    const r =
      (0.21 * (1 - v) + 0.075 * Math.sin(Math.PI * v)) * (1 - open) +
      (0.2 +
        layer * 0.05 +
        length * v -
        0.025 * (0.5 + 0.5 * Math.cos(u * Math.PI * 6)) * v ** 9) *
        open;
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      -0.025 +
        layer * 0.055 +
        0.46 * Math.sin(v * Math.PI * 0.73) * (1 - open) +
        (0.11 * Math.sin(Math.PI * v) +
          0.13 * v * v +
          0.08 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v)) *
          open,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
const disk: SpecimenInstanceGroup = {
  name: "bisexual disk florets",
  cluster: 0,
  poses: radialFloretPoses(32, 0.225, 0.037, 1801).map((p) => ({
    ...p,
    position: [p.position[0], p.position[1] + 0.055, p.position[2]] as Vec3,
    foldedPosition: [p.position[0] * 0.18, 0.068, p.position[2] * 0.18] as Vec3,
  })),
  surfaces: [
    {
      name: "fused disk corolla tube",
      cluster: 0,
      role: "tube",
      tissue: "disc",
      periodic: true,
      thickness: 0.003,
      sample: (u, v, o) => {
        const a = u * Math.PI * 2,
          r = 0.007 + 0.006 * v * o;
        return [Math.cos(a) * r, 0.082 * v, Math.sin(a) * r];
      },
    },
    ...Array.from({ length: 5 }, (_, i) => ({
      name: "disk corolla lobe",
      cluster: 0,
      role: "petal" as const,
      tissue: "disc" as const,
      thickness: 0.0025,
      sample: (u: number, v: number, o: number): Vec3 => {
        const a = (i * Math.PI * 2) / 5,
          w = (2 * u - 1) * (0.0015 + 0.012 * Math.sin(Math.PI * v) ** 0.7),
          r =
            0.013 * (1 - v) + 0.004 + 0.042 * o * Math.sin(v * Math.PI * 0.68);
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          0.079 + 0.067 * v - 0.03 * o * v * v,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    })),
  ],
  organs: [
    {
      name: "pistil style",
      cluster: 0,
      points: [
        [0, 0.012, 0],
        [0, 0.1, 0],
        [0, 0.17, 0],
      ],
      foldedPoints: [
        [0, 0.01, 0],
        [0, 0.037, 0],
        [0, 0.063, 0],
      ],
      radius: 0.0022,
      endRadius: 0.0025,
      color: "#d0b77a",
    },
    ...[-1, 1].map((side) => ({
      name: "pistil style arm",
      cluster: 0,
      points: [
        [0, 0.16, 0],
        [side * 0.006, 0.177, 0],
        [side * 0.01, 0.18, 0.002],
      ] as Vec3[],
      foldedPoints: [
        [0, 0.055, 0],
        [side * 0.003, 0.067, 0],
        [side * 0.005, 0.072, 0.001],
      ] as Vec3[],
      radius: 0.0025,
      endRadius: 0.0025,
      color: "#dcc184",
    })),
    ...Array.from({ length: 5 }, (_, i) => {
      const a = (i * Math.PI * 2) / 5,
        x = Math.sin(a) * 0.007,
        z = Math.cos(a) * 0.007;
      return {
        name: "stamen anther",
        cluster: 0,
        points: [
          [x, 0.072, z],
          [x, 0.106, z],
          [x, 0.129, z],
        ] as Vec3[],
        foldedPoints: [
          [x * 0.5, 0.025, z * 0.5],
          [x * 0.5, 0.04, z * 0.5],
          [x * 0.5, 0.052, z * 0.5],
        ] as Vec3[],
        radius: 0.003,
        endRadius: 0.0022,
        color: "#9b7d44",
      };
    }),
  ],
};
export const ZINNIA_MODEL: SpecimenModel = {
  clusters: [
    { position: [0, 0, 0], rotation: [1.0, 0, 0], scale: 1, nod: 0.01 },
  ],
  surfaces: [],
  organs: [
    {
      name: "floral receptacle",
      cluster: 0,
      points: [
        [0, -0.16, 0],
        [0, -0.055, 0],
        [0, 0.06, 0],
      ],
      radius: 0.18,
      endRadius: 0.24,
      color: "#91945e",
    },
  ],
  instances: [disk],
};
export const ZINNIA_STALKS: SpecimenOrgan[] = [];
for (let i = 0; i < 28; i++) {
  const a = ((i % 14) * Math.PI) / 7 + Math.floor(i / 14) * 0.22,
    root = 0.2 + Math.floor(i / 14) * 0.05,
    y = 0.035 + Math.floor(i / 14) * 0.04;
  ZINNIA_MODEL.surfaces.push({
    name: "ray ligule",
    cluster: 0,
    role: "petal",
    sample: zinniaRay(i),
    thickness: 0.014,
    flexible: true,
    cage: [3, 5],
    mobileCage: [2, 3],
    delay: Math.floor(i / 14) * 0.045,
    compliance: 0.000046,
    shapeCompliance: 0.00042,
  });
  ZINNIA_MODEL.surfaces.push({
    name: "female ray tube",
    cluster: 0,
    role: "petal",
    periodic: true,
    thickness: 0.003,
    sample: (u, v) => {
      const t = u * Math.PI * 2;
      return [
        Math.sin(a) * root + Math.cos(t) * 0.01,
        y - 0.022 + 0.05 * v,
        Math.cos(a) * root + Math.sin(t) * 0.01,
      ];
    },
  });
  ZINNIA_MODEL.organs.push({
    name: "female ray pistil style",
    cluster: 0,
    points: [
      [Math.sin(a) * root, y - 0.01, Math.cos(a) * root],
      [Math.sin(a) * root, y + 0.05, Math.cos(a) * root],
      [Math.sin(a) * root, y + 0.105, Math.cos(a) * root],
    ],
    foldedPoints: [
      [Math.sin(a) * root * 0.7, y - 0.01, Math.cos(a) * root * 0.7],
      [Math.sin(a) * root * 0.65, y + 0.065, Math.cos(a) * root * 0.65],
      [Math.sin(a) * root * 0.6, y + 0.11, Math.cos(a) * root * 0.6],
    ],
    radius: 0.003,
    endRadius: 0.003,
    color: "#bda788",
  });
  for (const side of [-1, 1])
    ZINNIA_MODEL.organs.push({
      name: "female ray pistil style arm",
      cluster: 0,
      points: [
        [Math.sin(a) * root, y + 0.09, Math.cos(a) * root],
        [
          Math.sin(a) * root + Math.cos(a) * side * 0.006,
          y + 0.112,
          Math.cos(a) * root - Math.sin(a) * side * 0.006,
        ],
        [
          Math.sin(a) * root + Math.cos(a) * side * 0.012,
          y + 0.119,
          Math.cos(a) * root - Math.sin(a) * side * 0.012,
        ],
      ],
      foldedPoints: [
        [Math.sin(a) * root * 0.6, y + 0.095, Math.cos(a) * root * 0.6],
        [
          Math.sin(a) * root * 0.6 + Math.cos(a) * side * 0.003,
          y + 0.112,
          Math.cos(a) * root * 0.6 - Math.sin(a) * side * 0.003,
        ],
        [
          Math.sin(a) * root * 0.6 + Math.cos(a) * side * 0.005,
          y + 0.119,
          Math.cos(a) * root * 0.6 - Math.sin(a) * side * 0.005,
        ],
      ],
      radius: 0.003,
      endRadius: 0.003,
      color: "#c3b294",
    });
}
ZINNIA_MODEL.surfaces.push({
  name: "involucral receptacle wall",
  cluster: 0,
  role: "calyx",
  periodic: true,
  thickness: 0.018,
  contactObstacle: true,
  cage: [8, 3],
  mobileCage: [6, 2],
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r = 0.18 + 0.065 * v;
    return [Math.cos(a) * r, -0.16 + 0.17 * v, Math.sin(a) * r];
  },
});
for (let i = 0; i < 18; i++) {
  const a = (i * Math.PI) / 9;
  ZINNIA_MODEL.surfaces.push({
    name: "imbricate involucral bract",
    cluster: 0,
    role: "calyx",
    thickness: 0.016,
    sample: (u, v, o) => {
      const w = (2 * u - 1) * (0.003 + 0.07 * Math.sin(v * Math.PI) ** 0.66),
        r =
          (0.24 * (1 - v) + 0.08 * Math.sin(Math.PI * v)) * (1 - o) +
          (0.19 + 0.15 * v) * o;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        -0.14 + v * (0.56 - 0.38 * o),
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
