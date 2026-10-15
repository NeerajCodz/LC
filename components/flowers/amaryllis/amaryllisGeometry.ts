import { Euler, Matrix4, Quaternion, Vector3 } from "three";
import type { Vec3 } from "@/lib/flowers/types";
import {
  specimenClusterPoint,
  type SpecimenCluster,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

const lengths = [1.2, 1.27, 1.18, 1.22, 1.19, 1.25],
  widths = [0.37, 0.315, 0.365, 0.245, 0.36, 0.32];

/** Six curved overlapping segments join a short tube; the lower inner is narrower. */
export function amaryllisTepal(index: number, young = false) {
  const angle = (index * Math.PI) / 3;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = young ? 0 : stage,
      w = 2 * u - 1,
      root = 0.105 + (index % 2) * 0.002,
      expanded = root * (1 - v) + 0.77 * Math.sin(v * Math.PI * 0.5),
      folded =
        root * (1 - v) + 0.145 * Math.sin(Math.PI * v) ** 0.82 - 0.006 * v ** 8,
      radius = expanded * open + folded * (1 - open),
      spread = Math.atan2(
        0.065 * (1 - v) ** 3 +
          0.004 +
          widths[index] * Math.sin(Math.PI * v) ** 0.7,
        Math.max(0.04, expanded),
      ),
      wrapped =
        0.56 * (1 - v) ** 3 + 0.67 * Math.sin(Math.PI * v) ** 0.35 + 0.025 * v,
      a =
        angle +
        w * (spread * open + wrapped * (1 - open)) +
        0.16 * v * (1 - open),
      capWeight = Math.max(0, (v - 0.8) / 0.2) ** 2 * (1 - open),
      pointedWidth = w * (0.005 + 0.028 * Math.sin(Math.PI * v)) * capWeight,
      centerAngle = angle + 0.16 * v * (1 - open),
      y =
        0.26 +
        (1.25 * (1 - open) + lengths[index] * 0.76 * open) * v -
        0.055 * v ** 3 * open +
        0.075 * w * w * Math.sin(Math.PI * v) * open +
        0.008 * Math.sin(w * 15 + index) * v ** 3 * open;
    return [
      Math.sin(a) * radius + Math.cos(centerAngle) * pointedWidth,
      y,
      Math.cos(a) * radius - Math.sin(centerAngle) * pointedWidth,
    ];
  };
}

function flowerPose(
  position: Vec3,
  direction: Vec3,
  scale: number,
  nod: number,
): SpecimenCluster {
  const orientation = new Euler().setFromQuaternion(
    new Quaternion().setFromUnitVectors(
      new Vector3(0, 1, 0),
      new Vector3(...direction).normalize(),
    ),
  );
  return {
    position,
    rotation: [orientation.x, orientation.y, orientation.z],
    scale,
    nod,
  };
}

export const AMARYLLIS_MODEL: SpecimenModel = {
  clusters: [
    flowerPose([-0.27, 0.19, 0.07], [-0.5, 0.09, 0.865], 0.87, 0.025),
    flowerPose([0.3, 0.33, -0.025], [0.67, 0.07, 0.735], 0.83, 0.022),
    flowerPose([0.045, 0.37, -0.12], [0.12, 0.94, -0.32], 0.48, 0.018),
  ],
  surfaces: [],
  organs: [],
};

export const AMARYLLIS_INSERTION: Vec3 = [0, 0, 0];
export const AMARYLLIS_STALKS: SpecimenOrgan[] = AMARYLLIS_MODEL.clusters.map(
  (c, i) => {
    const end = specimenClusterPoint(c, [0, -0.19, 0]);
    return {
      name: "umbel pedicel",
      cluster: 0,
      points: [
        AMARYLLIS_INSERTION,
        [end[0] * 0.55, end[1] * 0.52 + 0.025, end[2] * 0.55],
        end,
      ],
      radius: i === 2 ? 0.032 : 0.039,
      endRadius: i === 2 ? 0.024 : 0.031,
      color: "#8d9c68",
    };
  },
);

for (let cluster = 0; cluster < 3; cluster++) {
  const young = cluster === 2,
    delay = cluster * 0.032;
  AMARYLLIS_MODEL.surfaces.push({
    name: "short fused basal perianth tube",
    cluster,
    role: "tube",
    tissue: "inner",
    periodic: true,
    thickness: 0.025,
    flexible: true,
    cage: [8, 3],
    mobileCage: [6, 2],
    delay,
    compliance: 0.000018,
    shapeCompliance: 0.00015,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.046 + 0.059 * v ** 1.8;
      return [Math.sin(a) * r, 0.26 * v, Math.cos(a) * r];
    },
  });
  for (let i = 0; i < 6; i++) {
    AMARYLLIS_MODEL.surfaces.push({
      name: "trumpet tepal",
      cluster,
      role: "petal",
      sample: amaryllisTepal(i, young),
      thickness: 0.023,
      flexible: true,
      cage: [4, 7],
      mobileCage: [2, 4],
      delay,
      compliance: 0.000038,
      shapeCompliance: 0.00035,
    });
    const a = (i * Math.PI) / 3;
    AMARYLLIS_MODEL.surfaces.push({
      name: "minute throat scale",
      cluster,
      role: "bract",
      tissue: "inner",
      thickness: 0.009,
      sample: (u, v) => {
        const w = (2 * u - 1) * (0.002 + 0.024 * Math.sin(Math.PI * v)),
          r = 0.094 - 0.035 * v;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          0.245 + 0.064 * v - 0.008 * Math.cos(u * Math.PI * 8) * v ** 6,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  AMARYLLIS_MODEL.surfaces.push({
    name: "inferior cylindrical ovary",
    overviewColumns: 12,
    cluster,
    role: "calyx",
    periodic: true,
    thickness: 0.024,
    contactObstacle: true,
    cage: [6, 2],
    mobileCage: [4, 1],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r =
          (0.048 + 0.019 * Math.sin(Math.PI * v)) *
          (1 + 0.045 * Math.cos(a * 3));
      return [Math.sin(a) * r, -0.19 + 0.195 * v, Math.cos(a) * r];
    },
  });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3,
      x = Math.sin(a) * 0.066,
      z = Math.cos(a) * 0.066,
      height = 0.89 + (i % 3) * 0.028,
      full: Vec3[] = [
        [x, 0.25, z],
        [x * 1.4, 0.5, z * 0.6 + 0.14],
        [x * 1.65, height - 0.15, 0.21],
        [x * 1.75, height, 0.14],
      ],
      folded: Vec3[] = [
        [x * 0.75, 0.25, z * 0.75],
        [x * 0.6, 0.5, z * 0.5],
        [x * 0.35, 0.77, z * 0.35],
        [x * 0.3, 0.96, z * 0.3],
      ];
    AMARYLLIS_MODEL.organs.push({
      name: "arched stamen filament",
      overviewSides: 3,
      cluster,
      points: young ? folded : full,
      foldedPoints: folded,
      radius: 0.01,
      endRadius: 0.007,
      color: "#f0d4a2",
    });
    for (const side of [-1, 1]) {
      const chamber = (p: Vec3, length: number): Vec3[] => [
        [p[0] - length * 0.5, p[1] - 0.018, p[2] + side * 0.009],
        [p[0], p[1] + 0.003, p[2] + side * 0.013],
        [p[0] + length * 0.5, p[1] + 0.017, p[2] + side * 0.009],
      ];
      AMARYLLIS_MODEL.organs.push({
        name: "dorsifixed anther chamber",
        cluster,
        points: chamber(young ? folded[3] : full[3], young ? 0.065 : 0.11),
        foldedPoints: chamber(folded[3], 0.065),
        radius: 0.014,
        endRadius: 0.008,
        flatten: 0.66,
        color: "#d0a451",
      });
    }
  }
  const style: Vec3[] = [
      [0, -0.015, 0],
      [0.005, 0.45, 0.13],
      [0.013, 0.85, 0.24],
      [0.018, 1.105, 0.14],
    ],
    foldedStyle: Vec3[] = [
      [0, -0.015, 0],
      [0.003, 0.4, 0.02],
      [0.006, 0.84, 0.026],
      [0.008, 1.13, 0.026],
    ];
  AMARYLLIS_MODEL.organs.push({
    name: "declinate central style",
    overviewSides: 3,
    cluster,
    points: young ? foldedStyle : style,
    foldedPoints: foldedStyle,
    radius: 0.011,
    endRadius: 0.012,
    color: "#e6dbb7",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3,
      tip = style[3],
      foldedTip = foldedStyle[3],
      branch = (p: Vec3, spread: number): Vec3[] => [
        p,
        [
          p[0] + Math.sin(a) * spread * 0.55,
          p[1] + 0.029,
          p[2] + Math.cos(a) * spread * 0.55,
        ],
        [
          p[0] + Math.sin(a) * spread,
          p[1] + 0.047,
          p[2] + Math.cos(a) * spread,
        ],
      ];
    AMARYLLIS_MODEL.organs.push({
      name: "three-branched stigma tip",
      overviewSides: 3,
      cluster,
      points: branch(young ? foldedTip : tip, young ? 0.011 : 0.037),
      foldedPoints: branch(foldedTip, 0.011),
      radius: 0.012,
      endRadius: 0.015,
      color: "#ebe3c4",
    });
  }
}

// These are two umbel-enclosing spathes, not a separate pair for every flower.
const first = AMARYLLIS_MODEL.clusters[0],
  inverse = new Matrix4()
    .makeRotationFromEuler(new Euler(...first.rotation))
    .scale(new Vector3(first.scale, first.scale, first.scale))
    .setPosition(...first.position)
    .invert().elements;
function clusterLocal(p: Vec3): Vec3 {
  return [
    inverse[0] * p[0] + inverse[4] * p[1] + inverse[8] * p[2] + inverse[12],
    inverse[1] * p[0] + inverse[5] * p[1] + inverse[9] * p[2] + inverse[13],
    inverse[2] * p[0] + inverse[6] * p[1] + inverse[10] * p[2] + inverse[14],
  ];
}
for (const side of [-1, 1])
  AMARYLLIS_MODEL.surfaces.push({
    name: "enclosing umbel spathe",
    cluster: 0,
    role: "bract",
    tissue: "disc",
    thickness: 0.017,
    flexible: true,
    cage: [3, 4],
    mobileCage: [2, 3],
    compliance: 0.000027,
    shapeCompliance: 0.0002,
    sample: (u, v, open) => {
      const w = 2 * u - 1,
        x = w * (0.004 + 0.126 * Math.sin(Math.PI * v) ** 0.62);
      return clusterLocal([
        x,
        -0.025 + 0.41 * v * (1 - 0.3 * open),
        side * (0.032 + 0.22 * v ** 1.7 * open + 0.038 * w * w),
      ]);
    },
  });
