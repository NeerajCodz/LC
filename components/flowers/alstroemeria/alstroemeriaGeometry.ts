import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
export function alstroemeriaTepal(i: number, young = false) {
  const a = (i * Math.PI) / 3,
    marked = i === 1 || i === 5,
    inner = i % 2 === 1,
    length = marked ? 0.98 : inner ? 0.83 : 0.9,
    width = inner ? 0.2 : 0.31;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.14 : 1),
      w =
        (2 * u - 1) *
        (0.003 + width * Math.sin(Math.PI * v) ** 0.68) *
        (0.35 + 0.65 * open);
    const r =
      0.058 * (1 - v) +
      0.105 * Math.sin(Math.PI * v) ** 0.8 * (1 - open) +
      (marked ? 0.48 : 0.55) * open * Math.sin(v * Math.PI * 0.57);
    const y =
      0.045 +
      length * v * (0.94 - 0.57 * open) -
      0.05 * open * v * v +
      0.08 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v) * open +
      (marked ? 0.07 * open * v : 0);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      y,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const ALSTROEMERIA_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.43, 0.1, 0.11],
      rotation: [1.05, -0.3, -0.08],
      scale: 0.61,
      nod: 0.019,
    },
    {
      position: [0.37, 0.3, 0.14],
      rotation: [0.95, 0.3, 0.06],
      scale: 0.59,
      nod: 0.019,
    },
    {
      position: [-0.02, 0.61, -0.2],
      rotation: [1.22, -0.12, 0],
      scale: 0.54,
      nod: 0.018,
    },
    {
      position: [0.48, 0.69, -0.12],
      rotation: [0.68, 0.28, 0.09],
      scale: 0.34,
      nod: 0.024,
    },
    {
      position: [-0.38, 0.66, -0.25],
      rotation: [0.75, -0.24, -0.12],
      scale: 0.34,
      nod: 0.024,
    },
  ],
  surfaces: [],
  organs: [],
};
// The negative local Z side projects upward when the flower faces the viewer.
ALSTROEMERIA_MODEL.clusters.forEach((c) => {
  c.rotation[1] += Math.PI;
});
export const ALSTROEMERIA_STALKS: SpecimenOrgan[] = [
  {
    name: "cyme upper axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.015, 0.4, -0.01],
      [0, 0.73, -0.025],
    ],
    radius: 0.024,
    endRadius: 0.012,
    color: "#618053",
  },
  ...ALSTROEMERIA_MODEL.clusters.map((c) => ({
    name: "cyme flower stalk",
    cluster: 0,
    points: [
      [0, c.position[1] * 0.65, 0],
      [c.position[0] * 0.5, c.position[1] + 0.05, c.position[2] * 0.5],
      c.position,
    ] as Vec3[],
    radius: 0.014,
    endRadius: 0.01,
    color: "#839265",
  })),
];
for (let c = 0; c < 5; c++) {
  const delay = c * 0.026;
  for (let i = 0; i < 6; i++)
    ALSTROEMERIA_MODEL.surfaces.push({
      name: "free tepal",
      cluster: c,
      role: "petal",
      tissue: i === 1 || i === 5 ? "inner" : undefined,
      sample: alstroemeriaTepal(i, c >= 3),
      thickness: 0.014,
      flexible: true,
      cage: [3, 5],
      mobileCage: [2, 3],
      delay,
      compliance: 0.000033,
      shapeCompliance: 0.0004,
    });
  ALSTROEMERIA_MODEL.surfaces.push({
    name: "inferior ovary",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.015,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 2],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.045 + 0.02 * Math.sin(Math.PI * v);
      return [Math.cos(a) * r, -0.14 + 0.18 * v, Math.sin(a) * r];
    },
  });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3,
      r = 0.042,
      x = Math.sin(a) * r,
      z = Math.cos(a) * r,
      h = 0.38 + (i % 3) * 0.018;
    ALSTROEMERIA_MODEL.organs.push({
      name: "stamen filament",
      cluster: c,
      points: [
        [x * 0.5, 0.035, z * 0.5],
        [x * 0.85, 0.22, z * 0.85],
        [x, h, z],
      ],
      foldedPoints: [
        [x * 0.35, 0.035, z * 0.35],
        [x * 0.45, 0.13, z * 0.45],
        [x * 0.55, 0.22, z * 0.55],
      ],
      radius: 0.005,
      endRadius: 0.004,
      color: "#dfc29b",
    });
    ALSTROEMERIA_MODEL.organs.push({
      name: "stamen anther",
      cluster: c,
      points: [
        [x, h, z],
        [x + 0.004, h + 0.024, z],
        [x + 0.007, h + 0.051, z],
      ],
      foldedPoints: [
        [x * 0.55, 0.22, z * 0.55],
        [x * 0.55, 0.239, z * 0.55],
        [x * 0.55 + 0.003, 0.255, z * 0.55],
      ],
      radius: 0.012,
      endRadius: 0.009,
      flatten: 0.5,
      color: "#8d6244",
    });
  }
  ALSTROEMERIA_MODEL.organs.push({
    name: "pistil style",
    cluster: c,
    points: [
      [0, 0.03, 0],
      [0, 0.27, 0],
      [0, 0.455, 0],
    ],
    foldedPoints: [
      [0, 0.03, 0],
      [0, 0.14, 0],
      [0, 0.28, 0],
    ],
    radius: 0.006,
    endRadius: 0.006,
    color: "#c8bd83",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    ALSTROEMERIA_MODEL.organs.push({
      name: "pistil style arm",
      cluster: c,
      points: [
        [0, 0.44, 0],
        [Math.sin(a) * 0.02, 0.477, Math.cos(a) * 0.02],
        [Math.sin(a) * 0.035, 0.488, Math.cos(a) * 0.035],
      ],
      foldedPoints: [
        [0, 0.27, 0],
        [Math.sin(a) * 0.009, 0.288, Math.cos(a) * 0.009],
        [Math.sin(a) * 0.015, 0.3, Math.cos(a) * 0.015],
      ],
      radius: 0.007,
      endRadius: 0.009,
      color: "#bdc17f",
    });
  }
}
