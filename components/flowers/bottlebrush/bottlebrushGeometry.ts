import { Euler, Quaternion, Vector3 } from "three";
import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenInstancePose,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";

export const BOTTLEBRUSH_STEM_LENGTH = 2.9;
export const BOTTLEBRUSH_SHOOT_POINTS: Vec3[] = [
  [0, -0.15, 0],
  [0.012, 0.92, 0],
  [0, 1.98, 0],
];

/** Authored twenty-four true flowers encircle a continuing woody shoot. */
export const BOTTLEBRUSH_FLOWER_POSES: SpecimenInstancePose[] = Array.from(
  { length: 24 },
  (_, i) => {
    const angle = i * 2.3999632297,
      height = 0.05 + (i / 23) * 1.55;
    return {
      position: [Math.sin(angle) * 0.065, height, Math.cos(angle) * 0.065],
      rotation: [Math.PI / 2, 0, -angle],
      scale: 1,
      delay: 0.1,
      phase: i * 1.63,
    };
  },
);

/** Rz(-angle) followed by Rx(pi/2) turns local flower Y away from the shoot. */
function flowerPoint(index: number, [x, y, z]: Vec3): Vec3 {
  const pose = BOTTLEBRUSH_FLOWER_POSES[index],
    angle = -pose.rotation[2],
    ca = Math.cos(angle),
    sa = Math.sin(angle);
  return [
    pose.position[0] + ca * x + sa * y,
    pose.position[1] - z,
    pose.position[2] - sa * x + ca * y,
  ];
}

export function bottlebrushHypanthium(
  u: number,
  v: number,
  open: number,
): Vec3 {
  const angle = u * Math.PI * 2,
    lobed = 1 + 0.09 * Math.cos(angle * 5) * v ** 6,
    radius = (0.027 + (0.022 + 0.012 * open) * v ** 2) * lobed;
  return [Math.cos(angle) * radius, 0.004 + 0.08 * v, Math.sin(angle) * radius];
}
const tinyPetals: SpecimenSurface[] = Array.from({ length: 5 }, (_, i) => {
  const angle = (i * Math.PI * 2) / 5;
  return {
    name: "tiny true-flower petal",
    overviewColumns: 4,
    cluster: 0,
    role: "petal",
    tissue: "inner",
    thickness: 0.0035,
    sample: (u, v, open) => {
      const width =
          (2 * u - 1) *
          (0.0015 + 0.018 * Math.sin(v * Math.PI * 0.97)) *
          (0.3 + 0.7 * open),
        radius = 0.045 + v * (0.003 + 0.043 * open);
      return [
        Math.sin(angle) * radius + Math.cos(angle) * width,
        0.073 + v * (0.055 * (1 - open) + 0.012 * open),
        Math.cos(angle) * radius - Math.sin(angle) * width,
      ];
    },
  };
});

/** One real filament and its two chambers are drawn at all 576 authored poses. */
export const BOTTLEBRUSH_STAMEN_POSES: SpecimenInstancePose[] =
  BOTTLEBRUSH_FLOWER_POSES.flatMap((flower, i) =>
    Array.from({ length: 24 }, (_, j) => {
      const angle = (j * Math.PI * 2) / 24,
        tilt = 0.1 + (0.62 * (j % 6)) / 5,
        q = new Quaternion().setFromEuler(new Euler(...flower.rotation));
      q.multiply(
        new Quaternion().setFromAxisAngle(
          new Vector3(Math.cos(angle), 0, -Math.sin(angle)),
          tilt,
        ),
      );
      const rotation = new Euler().setFromQuaternion(q);
      return {
        position: flowerPoint(i, [
          Math.sin(angle) * 0.033,
          0.058,
          Math.cos(angle) * 0.033,
        ]),
        rotation: [rotation.x, rotation.y, rotation.z],
        scale: 0.8 + 0.21 * Math.sin(i * 0.47 + j * 1.31) ** 2,
        delay: 0.1,
        phase: i * 1.63 + j * 0.73,
      };
    }),
  );

export const BOTTLEBRUSH_MODEL: SpecimenModel = {
  // A stiff continuing shoot and its upper foliage share the FlowerPlant head pose.
  clusters: [{ ...SINGLE_CLUSTER, nod: 0 }],
  surfaces: BOTTLEBRUSH_FLOWER_POSES.map((_, i) => ({
    name: "brush flower contact shell",
    cluster: 0,
    role: "calyx",
    thickness: 0.007,
    periodic: true,
    flexible: true,
    delay: 0.1,
    cage: [8, 3],
    mobileCage: [4, 2],
    compliance: 0.000026,
    shapeCompliance: 0.0002,
    sample: (u, v, open) => flowerPoint(i, bottlebrushHypanthium(u, v, open)),
  })),
  organs: [
    {
      name: "continuing woody flowering shoot",
      cluster: 0,
      points: BOTTLEBRUSH_SHOOT_POINTS,
      radius: 0.042,
      endRadius: 0.024,
      color: "#807354",
    },
    ...BOTTLEBRUSH_FLOWER_POSES.map((_, i) => ({
      name: "sessile flower insertion",
      cluster: 0,
      points: [
        flowerPoint(i, [0, -0.028, 0]),
        flowerPoint(i, [0, -0.008, 0]),
        flowerPoint(i, [0, 0.01, 0]),
      ],
      radius: 0.026,
      endRadius: 0.023,
      color: "#7d8755",
    })),
  ],
  instances: [
    {
      name: "true flowers with five tiny petals",
      cluster: 0,
      poses: BOTTLEBRUSH_FLOWER_POSES,
      surfaces: tinyPetals,
      organs: [
        {
          name: "true flower style",
          overviewSides: 3,
          cluster: 0,
          points: [
            [0, 0.04, 0],
            [0.003, 0.28, 0],
            [0.009, 0.58, 0],
          ],
          foldedPoints: [
            [0, 0.04, 0],
            [0.003, 0.1, 0],
            [0.004, 0.155, 0],
          ],
          radius: 0.0045,
          endRadius: 0.0055,
          color: "#b6313b",
        },
      ],
    },
    {
      name: "crimson stamens with dark paired anthers",
      cluster: 0,
      poses: BOTTLEBRUSH_STAMEN_POSES,
      surfaces: [],
      organs: [
        {
          name: "red stamen filament",
          overviewSides: 3,
          cluster: 0,
          points: [
            [0, 0, 0],
            [0.012, 0.29, 0.006],
            [0.027, 0.62, 0.013],
          ],
          foldedPoints: [
            [0, 0, 0],
            [0.006, 0.06, 0.004],
            [0.009, 0.115, 0.007],
          ],
          radius: 0.004,
          endRadius: 0.0028,
          color: "#c82e3c",
        },
        ...[-1, 1].map((side) => ({
          name: "dark stamen anther chamber",
          overviewSides: 3,
          cluster: 0,
          points: [
            [0.027 + side * 0.004, 0.614, 0.013],
            [0.027 + side * 0.0055, 0.625, 0.013],
            [0.027 + side * 0.003, 0.638, 0.013],
          ] as Vec3[],
          foldedPoints: [
            [0.009 + side * 0.003, 0.109, 0.007],
            [0.009 + side * 0.004, 0.119, 0.007],
            [0.009 + side * 0.002, 0.129, 0.007],
          ] as Vec3[],
          radius: 0.005,
          endRadius: 0.0035,
          flatten: 0.72,
          color: "#382729",
        })),
      ],
    },
  ],
};
