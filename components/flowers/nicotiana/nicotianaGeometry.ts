import type { Vec3 } from "@/lib/flowers/types";
import { Euler } from "three";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

/** Fused cylindrical tube, gradual throat and spreading five-lobed limb, including its furled bud. */
export function nicotianaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.035 : 1),
    a = u * Math.PI * 2,
    limb = Math.max(0, (v - 0.78) / 0.22),
    lobe = (0.5 + 0.5 * Math.cos(5 * a)) ** 1.8,
    closed = 0.018 + 0.019 * Math.sin(Math.PI * v) + 0.005 * limb,
    full = 0.022 + 0.024 * v * v + limb ** 1.5 * (0.105 + 0.18 * lobe),
    r = closed * (1 - open) + full * open,
    // A modest bud twist keeps the two offset skins separated during linear unfolding.
    turn = a + 0.32 * (1 - open) * limb;
  return [
    Math.sin(turn) * r,
    Math.cos(turn) * r -
      0.065 * (0.5 + 0.5 * open) * Math.sin(Math.PI * Math.min(v / 0.78, 1)),
    (1.12 + 0.16 * open) * Math.min(v / 0.78, 1) +
      (0.1 - 0.085 * lobe * open) * limb +
      0.008 * Math.sin(10 * a) * limb ** 3 * open,
  ];
}
export const NICOTIANA_HEAD_CENTER: Vec3 = [0, 0.57, 0.29];
export const NICOTIANA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [
    SINGLE_CLUSTER,
    ...Array.from({ length: 7 }, (_, i) => {
      const a = [-0.6, 1.62, 3.5, 5.35, 7.6, 9.8, 12][i],
        radius = [0.19, 0.27, 0.16, 0.25, 0.15, 0.11, 0.075][i],
        pitch = [-0.24, 0.12, -0.1, 0.24, 0.05, 0.58, 0.72][i];
      return {
        position: [
          Math.sin(a) * radius,
          [0.12, 0.31, 0.47, 0.65, 0.83, 1.02, 1.16][i],
          Math.cos(a) * radius,
        ] as Vec3,
        rotation: (() => {
          const pose = new Euler(-pitch, a, 0, "YXZ").reorder("XYZ");
          return [pose.x, pose.y, pose.z] as Vec3;
        })(),
        scale: i >= 5 ? 0.48 : 0.76 - i * 0.018,
        nod: 0.016,
      };
    }),
  ],
  surfaces: [],
  organs: [],
};
export const NICOTIANA_STALKS: SpecimenOrgan[] = [
  {
    name: "nicotiana loose raceme axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0, 0.6, 0],
      [0, 1.2, 0],
    ],
    radius: 0.025,
    endRadius: 0.011,
    color: "#849860",
  },
  ...NICOTIANA_MODEL.clusters.slice(1).map((c): SpecimenOrgan => ({
    name: "nicotiana erect pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] - 0.06, 0],
      [c.position[0] * 0.6, c.position[1] - 0.02, c.position[2] * 0.6],
      c.position,
    ],
    radius: 0.011,
    endRadius: 0.007,
    color: "#91a86d",
  })),
];
NICOTIANA_MODEL.organs.push(...NICOTIANA_STALKS);
for (let c = 1; c < NICOTIANA_MODEL.clusters.length; c++) {
  const young = c >= 6,
    maturity = (o: number) => o * (young ? 0.035 : 1);
  NICOTIANA_MODEL.surfaces.push(
    {
      name: "continuous five-lobed nicotiana salver corolla",
      cluster: c,
      role: "tube",
      outerSide: -1,
      periodic: true,
      sample: (u, v, o) => nicotianaCorolla(u, v, o, young),
      thickness: 0.008,
      flexible: true,
      delay: (c - 1) * 0.025,
      cage: [15, 5],
      mobileCage: [10, 3],
      overviewColumns: 20,
      overviewRows: 9,
      minimumColumns: 20,
      minimumRows: 12,
      compliance: 0.000025,
      shapeCompliance: 0.00022,
    },
    {
      name: "five unequal pointed nicotiana calyx lobes",
      cluster: c,
      role: "calyx",
      periodic: true,
      thickness: 0.008,
      overviewColumns: 20,
      overviewRows: 5,
      minimumColumns: 20,
      sample: (u, v): Vec3 => {
        const a = u * Math.PI * 2,
          lobe = (0.5 + 0.5 * Math.cos(5 * a)) ** 3,
          r = 0.036 + 0.012 * Math.sin(Math.PI * v) + 0.004 * v;
        return [
          Math.sin(a) * r,
          Math.cos(a) * r,
          0.24 * v + v ** 3 * lobe * (0.11 + 0.025 * Math.sin(a)),
        ];
      },
    },
  );
  const add = (
    name: string,
    points: (o: number) => Vec3[],
    radius: number,
    color: string,
    endRadius = radius * 0.65,
  ) => {
    const bent = (o: number) =>
      points(o).map((p): Vec3 => {
        const t = Math.max(0, Math.min(1, p[2] / (1.12 + 0.16 * o)));
        return [
          p[0],
          p[1] - 0.065 * (0.5 + 0.5 * o) * Math.sin(Math.PI * t),
          p[2],
        ];
      });
    NICOTIANA_MODEL.organs.push({
      name,
      cluster: c,
      bloomMorph: true,
      points: bent(maturity(1)),
      foldedPoints: bent(0),
      radius,
      foldedRadius: radius * 0.8,
      endRadius,
      color,
    });
  };
  for (let j = 0; j < 5; j++) {
    const a = (j * Math.PI * 2) / 5,
      z = j === 4 ? 1.12 : 1.2;
    const tip = (o: number): Vec3 => [
      Math.sin(a) * 0.016,
      Math.cos(a) * 0.016,
      z * (0.875 + 0.125 * o),
    ];
    add(
      "included nicotiana filament",
      (o) => [
        [Math.sin(a) * 0.018, Math.cos(a) * 0.018, 0.86 * (0.875 + 0.125 * o)],
        [
          Math.sin(a) * 0.016,
          Math.cos(a) * 0.016,
          (z - 0.07) * (0.875 + 0.125 * o),
        ],
        tip(o),
      ],
      0.0035,
      "#dfdcc2",
    );
    add(
      "purple nicotiana anther",
      (o) => {
        const p = tip(o);
        return [[p[0], p[1], p[2] - 0.008], p, [p[0], p[1], p[2] + 0.014]];
      },
      0.01,
      "#706079",
      0.007,
    );
  }
  add(
    "included nicotiana style",
    (o) => [
      [0, 0, 0.035],
      [0, 0, 0.64 * (0.875 + 0.125 * o)],
      [0, 0, 1.21 * (0.875 + 0.125 * o)],
    ],
    0.004,
    "#dce0b6",
  );
  add(
    "capitate nicotiana stigma",
    (o) => [
      [0, 0, 1.2 * (0.875 + 0.125 * o)],
      [0, 0, 1.215 * (0.875 + 0.125 * o)],
    ],
    0.012,
    "#b6c58a",
    0.01,
  );
  add(
    "superior nicotiana ovary",
    () => [
      [0, 0, -0.015],
      [0, 0, 0.035],
      [0, 0, 0.075],
    ],
    0.028,
    "#a3b476",
    0.014,
  );
}
