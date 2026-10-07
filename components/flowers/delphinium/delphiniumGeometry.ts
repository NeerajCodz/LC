import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
export function delphiniumSepal(i: number, young = false) {
  const a = (i * Math.PI * 2) / 5,
    length = i === 0 ? 0.76 : 0.66;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.12 : 1),
      w =
        (2 * u - 1) *
        (0.003 + 0.285 * Math.sin(Math.PI * v) ** 0.66) *
        (0.31 + 0.69 * open);
    const r =
      0.1 * (1 - v) +
      0.062 * Math.sin(Math.PI * v) * (1 - open) +
      0.53 * open * Math.sin(v * Math.PI * 0.53);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      0.08 +
        length * v * (0.82 - 0.62 * open) +
        0.07 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v) * open,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export function delphiniumInnerPetal(i: number, young = false) {
  const a =
      i < 2 ? (i === 0 ? -0.37 : 0.37) : Math.PI + (i === 2 ? -0.55 : 0.55),
    upper = i < 2;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.12 : 1),
      w =
        (2 * u - 1) *
        (0.002 + (upper ? 0.055 : 0.095) * Math.sin(Math.PI * v) ** 0.7),
      r = 0.045 + 0.22 * open * Math.sin(Math.PI * v * 0.6);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      0.1 +
        0.3 * v * (0.88 - 0.3 * open) -
        0.024 * Math.exp(-(((u - 0.5) / 0.2) ** 2)) * v ** 8,
      (upper ? 0.07 : 0) + Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const DELPHINIUM_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 12 }, (_, i) => ({
    position: [
      Math.sin(i * 2.399) * 0.26,
      -0.12 + i * 0.13,
      0.1 + Math.cos(i * 2.399) * 0.12,
    ] as Vec3,
    rotation: [1.1 + (i % 3) * 0.12, Math.sin(i * 2.399) * 0.35, 0] as Vec3,
    scale: i < 9 ? 0.43 - i * 0.01 : 0.27,
    nod: 0.016,
  })),
  surfaces: [],
  organs: [],
};
export const DELPHINIUM_STALKS: SpecimenOrgan[] = [
  {
    name: "continuous upper raceme",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.01, 0.75, 0],
      [0.012, 1.48, 0],
    ],
    radius: 0.024,
    endRadius: 0.014,
    color: "#658366",
  },
  ...DELPHINIUM_MODEL.clusters.map((c) => ({
    name: "flower pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] - 0.04, 0],
      [c.position[0] * 0.7, c.position[1] + 0.035, c.position[2] * 0.6],
      c.position,
    ] as Vec3[],
    radius: 0.011,
    endRadius: 0.008,
    color: "#85996f",
  })),
];
for (let c = 0; c < 12; c++) {
  const delay = c * 0.019,
    young = c >= 9;
  for (let i = 0; i < 5; i++)
    DELPHINIUM_MODEL.surfaces.push({
      name: "petaloid sepal",
      cluster: c,
      role: "petal",
      sample: delphiniumSepal(i, young),
      thickness: 0.011,
      flexible: true,
      cage: [3, 4],
      mobileCage: [1, 2],
      delay,
      compliance: 0.00006,
      shapeCompliance: 0.00055,
    });
  DELPHINIUM_MODEL.surfaces.push({
    name: "hollow dorsal spur",
    cluster: c,
    role: "bract",
    periodic: true,
    thickness: 0.007,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 2],
    delay,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.065 * (1 - v) + 0.01;
      return [
        Math.sin(a) * r,
        0.08 - 0.62 * v,
        0.175 + 0.12 * v + Math.cos(a) * r,
      ];
    },
  });
  for (let i = 0; i < 4; i++)
    DELPHINIUM_MODEL.surfaces.push({
      name: "inner petal",
      cluster: c,
      role: "petal",
      tissue: "inner",
      sample: delphiniumInnerPetal(i, young),
      thickness: 0.008,
      delay,
    });
  DELPHINIUM_MODEL.organs.push({
    name: "floral receptacle",
    cluster: c,
    points: [
      [0, -0.045, 0],
      [0, 0.025, 0],
      [0, 0.075, 0],
    ],
    radius: 0.045,
    endRadius: 0.1,
    color: "#8ca19b",
  });
  DELPHINIUM_MODEL.organs.push({
    name: "spur terminal cap",
    cluster: c,
    points: [
      [0, -0.53, 0.293],
      [0, -0.548, 0.296],
      [0, -0.565, 0.3],
    ],
    radius: 0.012,
    endRadius: 0.008,
    color: "#5578bb",
  });
  for (const side of [-1, 1])
    DELPHINIUM_MODEL.organs.push({
      name: "upper nectar petal spur",
      cluster: c,
      points: [
        [side * 0.016, 0.1, 0.112],
        [side * 0.015, -0.2, 0.22],
        [side * 0.009, -0.48, 0.283],
      ],
      radius: 0.005,
      endRadius: 0.004,
      color: "#dfd4b1",
    });
  for (let i = 0; i < 20; i++) {
    const a = i * 2.399,
      r = 0.045 + (i % 3) * 0.012,
      h = 0.24 + 0.03 * Math.sin(i * 0.7),
      x = Math.sin(a) * r,
      z = Math.cos(a) * r;
    DELPHINIUM_MODEL.organs.push({
      name: "stamen filament",
      cluster: c,
      points: [
        [x * 0.45, 0.065, z * 0.45],
        [x * 0.8, h * 0.7, z * 0.8],
        [x, h, z],
      ],
      foldedPoints: [
        [x * 0.4, 0.065, z * 0.4],
        [x * 0.4, 0.11, z * 0.4],
        [x * 0.5, 0.16, z * 0.5],
      ],
      radius: 0.0035,
      endRadius: 0.003,
      color: "#dad7b3",
    });
    DELPHINIUM_MODEL.organs.push({
      name: "stamen anther",
      cluster: c,
      points: [
        [x, h, z],
        [x, h + 0.012, z],
        [x, h + 0.026, z],
      ],
      foldedPoints: [
        [x * 0.5, 0.16, z * 0.5],
        [x * 0.5, 0.17, z * 0.5],
        [x * 0.5, 0.18, z * 0.5],
      ],
      radius: 0.008,
      endRadius: 0.006,
      flatten: 0.58,
      color: "#baa365",
    });
  }
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    DELPHINIUM_MODEL.organs.push({
      name: "carpel style",
      cluster: c,
      points: [
        [Math.sin(a) * 0.016, 0.06, Math.cos(a) * 0.016],
        [Math.sin(a) * 0.02, 0.22, Math.cos(a) * 0.02],
        [Math.sin(a) * 0.027, 0.315, Math.cos(a) * 0.027],
      ],
      foldedPoints: [
        [Math.sin(a) * 0.012, 0.06, Math.cos(a) * 0.012],
        [Math.sin(a) * 0.013, 0.13, Math.cos(a) * 0.013],
        [Math.sin(a) * 0.015, 0.19, Math.cos(a) * 0.015],
      ],
      radius: 0.007,
      endRadius: 0.004,
      color: "#adc19a",
    });
  }
  for (let i = 2; i < 4; i++)
    for (let k = 0; k < 14; k++) {
      const sample = delphiniumInnerPetal(i, young),
        p = sample(0.24 + (k % 5) * 0.13, 0.38 + Math.floor(k / 5) * 0.11, 1),
        b = sample(0.24 + (k % 5) * 0.13, 0.38 + Math.floor(k / 5) * 0.11, 0);
      DELPHINIUM_MODEL.organs.push({
        name: "lower petal beard hair",
        cluster: c,
        fine: true,
        points: [
          p,
          [p[0] + 0.003, p[1] + 0.012, p[2]],
          [p[0] + 0.004, p[1] + 0.022, p[2] - 0.003],
        ],
        foldedPoints: [
          b,
          [b[0] + 0.002, b[1] + 0.007, b[2]],
          [b[0] + 0.003, b[1] + 0.012, b[2] - 0.001],
        ],
        radius: 0.0017,
        endRadius: 0.0007,
        color: k % 3 ? "#e9e0b8" : "#cebd7f",
      });
    }
}
