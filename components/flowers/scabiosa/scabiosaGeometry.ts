import type { Vec3 } from "@/lib/flowers/types";
import { radialFloretPoses } from "@/lib/three/floretInstances";
import { floralStamens } from "@/lib/three/floralStamens";
import {
  anchoredHeadCluster,
  specimenClusterPoint,
  type SpecimenModel,
  type SpecimenInstancePose,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";

export const SCABIOSA_MARGIN_POSES: SpecimenInstancePose[] = Array.from(
  { length: 16 },
  (_, i) => {
    const angle = (i * Math.PI * 2) / 16;
    return {
      position: [Math.sin(angle) * 0.52, 0.022, Math.cos(angle) * 0.52],
      foldedPosition: [Math.sin(angle) * 0.34, 0.045, Math.cos(angle) * 0.34],
      rotation: [0, angle, 0],
      scale: 1,
      delay: 0.075,
      phase: i * 0.31,
    };
  },
);
export const SCABIOSA_INNER_POSES = radialFloretPoses(25, 0.43, 0.1, 931).map(
  (p) => ({
    ...p,
    position: [p.position[0], p.position[1] + 0.045, p.position[2]] as Vec3,
    foldedPosition: [
      p.position[0] * 0.72,
      p.position[1] + 0.045,
      p.position[2] * 0.72,
    ] as Vec3,
    scale: p.scale * 0.57,
    delay: 0.12,
  }),
);

/** One continuous five-lobed tube. The outward lobe is longest; two adjacent lobes are intermediate. */
export function scabiosaCorolla(u: number, v: number, open: number): Vec3 {
  const angle = u * Math.PI * 2;
  let lobe = 0;
  for (let i = 0; i < 5; i++) {
    const direction = (i * Math.PI * 2) / 5,
      distance = Math.atan2(
        Math.sin(angle - direction),
        Math.cos(angle - direction),
      ),
      extension = i === 0 ? 0.2 : i === 1 || i === 4 ? 0.12 : 0.07;
    lobe += extension * Math.exp(-((distance / 0.36) ** 2));
  }
  const flare = v ** 5,
    radius = 0.017 + 0.018 * v + flare * (0.008 + open * (0.052 + lobe)),
    height =
      v * (0.205 + 0.035 * (1 - open)) -
      open * 0.043 * flare +
      open * 0.012 * Math.cos(angle * 5) * flare;
  return [Math.sin(angle) * radius, height, Math.cos(angle) * radius];
}

/** Five real finite-width corolla apices overlap in the bud and extend their mature lobes. */
export const SCABIOSA_TERMINAL_TISSUE: SpecimenSurface[] = Array.from(
  { length: 5 },
  (_, i) => {
    const direction = (i * Math.PI * 2) / 5;
    return {
      name: "imbricated terminal corolla tissue",
      cluster: 0,
      role: "petal",
      thickness: 0.005,
      sample: (u, v, open) => {
        const across = 2 * u - 1,
          angle = direction + across * 0.7,
          rootClosed = scabiosaCorolla(angle / (Math.PI * 2), 1, 0),
          rootOpen = scabiosaCorolla(angle / (Math.PI * 2), 1, 1),
          axial = 0.043 * Math.cos(across * 0.7) * (1 - v) - 0.016 * v,
          width =
            0.043 * Math.sin(across * 0.7) * (1 - v) +
            across * (0.012 + 0.007 * Math.sin(Math.PI * v)) * v,
          closed: Vec3 = [
            Math.sin(direction) * axial + Math.cos(direction) * width,
            rootClosed[1] +
              0.044 * Math.sin((v * Math.PI) / 2) +
              0.0011 * i * v +
              0.006 * across ** 2 * v,
            Math.cos(direction) * axial - Math.sin(direction) * width,
          ],
          radial = Math.hypot(rootOpen[0], rootOpen[2]) + 0.014 * v,
          full: Vec3 = [
            Math.sin(angle) * radial,
            rootOpen[1] -
              0.018 * v +
              0.01 * Math.sin(Math.PI * v) +
              0.006 * across ** 2 * Math.sin(Math.PI * v),
            Math.cos(angle) * radial,
          ];
        return [
          closed[0] + (full[0] - closed[0]) * open,
          closed[1] + (full[1] - closed[1]) * open,
          closed[2] + (full[2] - closed[2]) * open,
        ];
      },
    };
  },
);

function marginPoint(index: number, [x, y, z]: Vec3, open: number): Vec3 {
  const pose = SCABIOSA_MARGIN_POSES[index],
    angle = pose.rotation[1],
    folded = pose.foldedPosition!,
    px = folded[0] + (pose.position[0] - folded[0]) * open,
    py = folded[1] + (pose.position[1] - folded[1]) * open,
    pz = folded[2] + (pose.position[2] - folded[2]) * open;
  return [
    px + Math.cos(angle) * x + Math.sin(angle) * z,
    py + y,
    pz - Math.sin(angle) * x + Math.cos(angle) * z,
  ];
}

const fineOrgans = floralStamens({
  count: 4,
  cluster: 0,
  radius: 0.073,
  height: 0.35,
  base: 0.035,
  foldedHeight: 0.175,
  filamentRadius: 0.0032,
  antherLength: 0.027,
  filament: "#d1c9e5",
  anther: "#c5c1a8",
});
fineOrgans.push(
  {
    name: "inferior floret ovary",
    cluster: 0,
    points: [
      [0, -0.061, 0],
      [0, -0.027, 0],
      [0, 0.012, 0],
    ],
    radius: 0.022,
    endRadius: 0.016,
    color: "#7b8960",
  },
  {
    name: "single protruding style",
    cluster: 0,
    points: [
      [0, 0.022, 0],
      [0.007, 0.2, 0],
      [0.012, 0.378, 0],
    ],
    foldedPoints: [
      [0, 0.022, 0],
      [0.004, 0.1, 0],
      [0.006, 0.17, 0],
    ],
    radius: 0.0034,
    endRadius: 0.004,
    color: "#e2dbea",
  },
  ...[-1, 1].map((side) => ({
    name: "lobed style tip",
    cluster: 0,
    points: [
      [0.012, 0.372, 0],
      [0.012 + side * 0.005, 0.381, 0.003],
      [0.012 + side * 0.008, 0.386, 0.004],
    ] as Vec3[],
    foldedPoints: [
      [0.006, 0.165, 0],
      [0.006 + side * 0.003, 0.173, 0.001],
      [0.006 + side * 0.005, 0.178, 0.002],
    ] as Vec3[],
    radius: 0.0032,
    endRadius: 0.0021,
    color: "#dfd4e6",
  })),
  ...Array.from({ length: 5 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 5;
    return {
      name: "calyx bristle",
      cluster: 0,
      points: [
        [Math.sin(angle) * 0.02, -0.022, Math.cos(angle) * 0.02],
        [Math.sin(angle) * 0.056, 0.008, Math.cos(angle) * 0.056],
        [Math.sin(angle) * 0.092, 0.078, Math.cos(angle) * 0.092],
      ] as Vec3[],
      foldedPoints: [
        [Math.sin(angle) * 0.02, -0.022, Math.cos(angle) * 0.02],
        [Math.sin(angle) * 0.031, 0.018, Math.cos(angle) * 0.031],
        [Math.sin(angle) * 0.041, 0.09, Math.cos(angle) * 0.041],
      ] as Vec3[],
      radius: 0.0026,
      endRadius: 0.0009,
      color: "#675266",
    };
  }),
);
const innerCorolla: SpecimenSurface = {
  name: "small bilateral five-lobed inner corolla",
  cluster: 0,
  role: "tube",
  periodic: true,
  thickness: 0.006,
  tissue: "inner",
  sample: scabiosaCorolla,
};

export const SCABIOSA_MODEL: SpecimenModel = {
  clusters: [anchoredHeadCluster(0.72, -0.24, 1, 0.009)],
  surfaces: [
    ...SCABIOSA_MARGIN_POSES.map((_, i): SpecimenSurface => ({
      name: "enlarged marginal floret",
      cluster: 0,
      role: "tube",
      periodic: true,
      thickness: 0.007,
      flexible: true,
      delay: 0.075,
      cage: [12, 5],
      mobileCage: [6, 3],
      compliance: 0.000075,
      shapeCompliance: 0.00065,
      sample: (u, v, open) => marginPoint(i, scabiosaCorolla(u, v, open), open),
    })),
    ...Array.from({ length: 10 }, (_, i): SpecimenSurface => {
      const angle = (i * Math.PI * 2) / 10;
      return {
        name: "green involucral bract",
        cluster: 0,
        role: "calyx",
        thickness: 0.012,
        contactObstacle: true,
        cage: [3, 4],
        mobileCage: [1, 2],
        sample: (u, v, open) => {
          const width =
              (2 * u - 1) * (0.003 + 0.09 * Math.sin(v * Math.PI) ** 0.7),
            radius = 0.23 + v * (0.13 + 0.22 * open);
          return [
            Math.sin(angle) * radius + Math.cos(angle) * width,
            -0.085 + 0.045 * v + (1 - open) * 0.37 * v,
            Math.cos(angle) * radius - Math.sin(angle) * width,
          ];
        },
      };
    }),
    {
      name: "domed head receptacle",
      cluster: 0,
      role: "calyx",
      periodic: true,
      thickness: 0.016,
      contactObstacle: true,
      cage: [8, 3],
      mobileCage: [6, 2],
      sample: (u, v, open) => {
        const angle = u * Math.PI * 2,
          radius = 0.025 + v * (0.31 + 0.18 * open);
        return [
          Math.sin(angle) * radius,
          -0.155 + v * 0.19 - 0.055 * v ** 4,
          Math.cos(angle) * radius,
        ];
      },
    },
  ],
  organs: [
    {
      name: "head insertion stalk",
      cluster: 0,
      points: [
        [0, -0.24, 0],
        [0, -0.15, 0],
        [0, -0.076, 0],
      ],
      radius: 0.027,
      endRadius: 0.021,
      color: "#7a9567",
    },
  ],
  instances: [
    {
      name: "marginal four-stamen florets",
      cluster: 0,
      surfaces: SCABIOSA_TERMINAL_TISSUE,
      organs: fineOrgans,
      poses: SCABIOSA_MARGIN_POSES,
    },
    {
      name: "smaller central four-stamen florets",
      cluster: 0,
      surfaces: [
        innerCorolla,
        ...SCABIOSA_TERMINAL_TISSUE.map((surface) => ({
          ...surface,
          tissue: "inner" as const,
        })),
      ],
      organs: fineOrgans,
      poses: SCABIOSA_INNER_POSES,
    },
  ],
};

export const SCABIOSA_HEAD_CENTER = specimenClusterPoint(
  SCABIOSA_MODEL.clusters[0],
  [0, 0.13, 0],
);
