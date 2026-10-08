import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
import { leafBlade } from "@/lib/three/botanicalBlades";

export function anemoneSepal(index: number) {
  const a = (index * Math.PI) / 4 + (index % 2) * 0.035;
  return (u: number, v: number, open: number): Vec3 => {
    const w =
      (2 * u - 1) *
      (0.004 + 0.38 * Math.sin(Math.PI * v) ** 0.68) *
      (0.34 + 0.66 * open);
    const r =
      0.12 * (1 - v * 0.45) +
      0.19 * (1 - open) * Math.sin(Math.PI * v) +
      0.83 * open * Math.sin(v * 1.25);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      0.63 * v * (1 - open * 0.82) +
        0.1 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v) * open +
        0.008 * Math.sin(v * 41 + index) * open,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const ANEMONE_MODEL: SpecimenModel = {
  clusters: [SINGLE_CLUSTER],
  surfaces: [],
  organs: [],
};
for (let i = 0; i < 8; i++)
  ANEMONE_MODEL.surfaces.push({
    name: "petaloid sepal",
    cluster: 0,
    role: "petal",
    sample: anemoneSepal(i),
    thickness: 0.011,
    flexible: true,
    cage: [4, 6],
    mobileCage: [2, 4],
    compliance: 0.000055,
    shapeCompliance: 0.00055,
  });
for (let i = 0; i < 3; i++) {
  const a = (i * Math.PI * 2) / 3,
    blade = leafBlade("involucral leaf", 0.48, 0.2, {
      teeth: 4,
      depth: 0.66,
      thickness: 0.009,
    });
  ANEMONE_MODEL.surfaces.push({
    ...blade,
    name: "involucral leaf",
    tissue: undefined,
    role: "calyx",
    sample: (u, v, stage) => {
      const [w, length, z] = blade.sample(u, v, 0.65 + stage * 0.35),
        r = 0.023 + length;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        -0.22 - length * 0.2 + z,
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
ANEMONE_MODEL.surfaces.push({
  name: "receptacular neck",
  cluster: 0,
  role: "calyx",
  periodic: true,
  thickness: 0.011,
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r = 0.023 + 0.1 * v;
    return [Math.sin(a) * r, -0.13 + 0.13 * v, Math.cos(a) * r];
  },
});
ANEMONE_MODEL.surfaces.push({
  name: "carpel receptacle",
  cluster: 0,
  role: "bract",
  tissue: "disc",
  thickness: 0.014,
  periodic: true,
  sample: (u, v) => {
    const a = u * Math.PI * 2,
      r = 0.004 + 0.16 * Math.sin(v * Math.PI);
    return [Math.sin(a) * r, 0.035 + 0.17 * v, Math.cos(a) * r];
  },
});
ANEMONE_MODEL.organs.push(
  ...floralStamens({
    count: 56,
    cluster: 0,
    radius: 0.25,
    height: 0.24,
    base: 0.045,
    filament: "#46304f",
    anther: "#201d31",
    filamentRadius: 0.004,
    antherLength: 0.043,
    spiral: true,
    foldedHeight: 0.19,
  }),
);
ANEMONE_MODEL.instances = [
  {
    name: "individual carpels",
    cluster: 0,
    surfaces: [],
    organs: [
      {
        name: "carpel ovary",
        cluster: 0,
        points: [
          [0, 0, 0],
          [0, 0.02, 0],
          [0, 0.04, 0],
        ],
        radius: 0.013,
        endRadius: 0.006,
        color: "#29243b",
      },
      {
        name: "carpel style",
        cluster: 0,
        points: [
          [0, 0.035, 0],
          [0.004, 0.058, 0],
          [0.01, 0.067, 0],
        ],
        radius: 0.0035,
        endRadius: 0.0025,
        color: "#4b3554",
      },
    ],
    poses: Array.from({ length: 48 }, (_, i) => {
      const a = i * 2.399963,
        r = 0.145 * Math.sqrt((i + 0.5) / 48);
      return {
        position: [
          Math.sin(a) * r,
          0.055 + 0.135 * (1 - r / 0.16),
          Math.cos(a) * r,
        ] as Vec3,
        foldedPosition: [
          Math.sin(a) * r * 0.6,
          0.07 + 0.06 * (1 - r / 0.16),
          Math.cos(a) * r * 0.6,
        ] as Vec3,
        rotation: [0, -a, 0] as Vec3,
        scale: 1,
        delay: 0,
        phase: i * 0.31,
      };
    }),
  },
];
