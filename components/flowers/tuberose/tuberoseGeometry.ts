import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  type SpecimenModel,
  type SpecimenOrgan,
} from "@/lib/three/specimenModel";

export const TUBEROSE_PAIR_NODES: Vec3[] = Array.from({ length: 7 }, (_, i) => [
  0,
  0.12 + i * 0.235,
  0,
]);
export const TUBEROSE_FLOWER_POSITIONS: Vec3[] = TUBEROSE_PAIR_NODES.flatMap(
  (p, pair) =>
    [-1, 1].map((side) => {
      const a = pair * 2.399963229728653 + side * 0.26;
      return [Math.sin(a) * 0.07, p[1], Math.cos(a) * 0.07] as Vec3;
    }),
);
export function tuberoseCenter(v: number, open: number): Vec3 {
  return [
    0,
    (0.56 + 0.21 * open) * v,
    0.15 * (1 - Math.exp(-v * 10)) * (0.75 + 0.25 * open),
  ];
}
/** A single continuous bent wall includes the long tube and all six fleshy lobes. */
export function tuberosePerianth(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.055 : 1),
    a = u * Math.PI * 2,
    lobe = (0.5 + 0.5 * Math.cos(a * 6)) ** 1.25,
    limb = Math.max(0, (v - 0.68) / 0.32),
    // Small buds retain a smooth wall until the six fleshy lobes can spread.
    lobeOpen = open ** 3,
    full =
      0.04 +
      0.017 * Math.sin(Math.PI * v) +
      (0.026 + 0.187 * lobe) * limb ** 1.4,
    // The distal inner skin must remain outside the axis at full wall thickness.
    closed =
      0.006 +
      0.049 * Math.sin(Math.PI * v) +
      0.028 * (1 - v) +
      0.002 * limb ** 2,
    r =
      closed * (1 - open) +
      full * open -
      0.187 * lobe * limb ** 1.4 * (open - lobeOpen),
    center = tuberoseCenter(v, open);
  return [
    Math.cos(a) * r,
    center[1] - 0.098 * lobe * limb ** 2 * lobeOpen,
    center[2] + Math.sin(a) * r,
  ];
}
function innerWall(index: number, v: number, open: number): Vec3 {
  const a = (index * Math.PI) / 3,
    p = tuberosePerianth(index / 6, v, open);
  return [p[0] - Math.cos(a) * 0.006, p[1], p[2] - Math.sin(a) * 0.006];
}
export const TUBEROSE_STALKS: SpecimenOrgan[] = [
  {
    name: "erect tuberose flowering scape",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.01, 0.76, 0],
      [0, 1.68, 0],
    ],
    radius: 0.029,
    endRadius: 0.01,
    color: "#718d57",
  },
  ...TUBEROSE_FLOWER_POSITIONS.map((p, i): SpecimenOrgan => ({
    name: "paired tuberose flower attachment",
    cluster: 0,
    points: [
      TUBEROSE_PAIR_NODES[Math.floor(i / 2)],
      [p[0] * 0.6, p[1] + 0.025, p[2] * 0.6],
      p,
    ],
    radius: 0.014,
    endRadius: 0.008,
    color: "#8b9b64",
  })),
];
export const TUBEROSE_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...TUBEROSE_FLOWER_POSITIONS.map((position, i) => ({
      position,
      rotation: [
        i >= 12 ? 0.48 : 1.18,
        Math.floor(i / 2) * 2.399963229728653 + (i % 2 ? 0.26 : -0.26),
        0,
      ] as Vec3,
      scale: i >= 12 ? 0.32 : 0.57 - Math.floor(i / 2) * 0.015,
      nod: 0.019,
    })),
  ],
  surfaces: [],
  organs: [...TUBEROSE_STALKS],
};
for (let pair = 0; pair < 7; pair++) {
  const a = pair * 2.399963229728653,
    node = TUBEROSE_PAIR_NODES[pair];
  TUBEROSE_MODEL.surfaces.push({
    name: "shared two-flowered tuberose bract",
    cluster: 0,
    role: "bract",
    tissue: "leaf",
    thickness: 0.009,
    overviewColumns: 4,
    overviewRows: 3,
    sample: (u, v): Vec3 => {
      const w = (2 * u - 1) * (0.003 + 0.019 * Math.sin(Math.PI * v)),
        r = 0.022 + 0.045 * v;
      return [
        Math.sin(a) * r + Math.cos(a) * w,
        node[1] - 0.035 + 0.135 * v,
        Math.cos(a) * r - Math.sin(a) * w,
      ];
    },
  });
}
for (let i = 0; i < 14; i++) {
  const cluster = i + 1,
    young = i >= 12,
    maturity = (open: number) => open * (young ? 0.055 : 1);
  TUBEROSE_MODEL.surfaces.push({
    name: "continuous bent six-lobed tuberose perianth",
    cluster,
    role: "tube",
    periodic: true,
    sample: (u, v, open) => tuberosePerianth(u, v, open, young),
    thickness: 0.018,
    flexible: true,
    delay: Math.floor(i / 2) * 0.045,
    cage: [12, 4],
    mobileCage: [12, 1],
    overviewColumns: 12,
    overviewRows: 6,
    compliance: 0.00002,
    shapeCompliance: 0.0002,
  });
  const add = (
    name: string,
    points: (open: number) => Vec3[],
    radius: number,
    color: string,
    endRadius = radius * 0.7,
    flatten = 1,
  ) => {
    TUBEROSE_MODEL.organs.push({
      name,
      cluster,
      bloomMorph: true,
      points: points(maturity(1)),
      foldedPoints: points(0),
      radius,
      foldedRadius: radius * 0.65,
      endRadius,
      color,
      flatten,
    });
  };
  add(
    "inferior tuberose ovary",
    () => [
      [0, -0.125, 0],
      [0, -0.055, 0],
      [0, 0.012, 0],
    ],
    0.037,
    "#bac29d",
    0.029,
  );
  add(
    "included curved tuberose style",
    (open) => [
      [0, -0.048, 0],
      tuberoseCenter(0.36, open),
      tuberoseCenter(0.84, open),
    ],
    0.006,
    "#d9d6b7",
    0.0045,
  );
  for (let j = 0; j < 6; j++) {
    const a = (j * Math.PI) / 3,
      filament = (open: number): Vec3[] => {
        const root = innerWall(j, 0.53, open),
          middle = tuberoseCenter(0.63, open),
          top = tuberoseCenter(0.74, open),
          radius = 0.016 + 0.02 * open;
        return [
          root,
          [Math.cos(a) * radius, middle[1], middle[2] + Math.sin(a) * radius],
          [Math.cos(a) * radius, top[1], top[2] + Math.sin(a) * radius],
        ];
      };
    add(
      "upper-tube tuberose stamen filament",
      filament,
      0.004,
      "#ebe1c9",
      0.003,
    );
    for (const side of [-1, 1])
      add(
        "tuberose stamen anther chamber",
        (open) => {
          const p = filament(open)[2],
            length = 0.032 + 0.02 * open;
          return [
            p,
            [
              p[0] - Math.sin(a) * side * 0.005,
              p[1] + length * 0.5,
              p[2] + Math.cos(a) * side * 0.005,
            ],
            [
              p[0] - Math.sin(a) * side * 0.003,
              p[1] + length,
              p[2] + Math.cos(a) * side * 0.003,
            ],
          ];
        },
        0.007,
        "#ccb77a",
        0.004,
        0.7,
      );
  }
  for (let j = 0; j < 3; j++) {
    const a = (j * Math.PI * 2) / 3;
    add(
      "three-part tuberose stigma",
      (open) => {
        const p = tuberoseCenter(0.84, open),
          r = 0.009 + 0.011 * open;
        return [
          p,
          [Math.sin(a) * r * 0.6, p[1] + 0.012, p[2] + Math.cos(a) * r * 0.6],
          [Math.sin(a) * r, p[1] + 0.018, p[2] + Math.cos(a) * r],
        ];
      },
      0.006,
      "#c4c69e",
      0.004,
    );
  }
}
