import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export const CROCUS_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 4 }, (_, i) => ({
    position: [
      Math.sin(i * 2.399) * 0.32,
      (i % 3) * 0.12,
      Math.cos(i * 2.399) * 0.27,
    ] as Vec3,
    rotation: [0.12 + (i % 2) * 0.12, i * 0.24, 0] as Vec3,
    scale: i === 3 ? 0.32 : 0.56,
    nod: 0.012,
  })),
  surfaces: [],
  organs: [],
};
export const CROCUS_STALKS: SpecimenOrgan[] = CROCUS_MODEL.clusters.flatMap(
  (c, i) => [
    {
      name: "inferior basal ovary",
      cluster: 0,
      points: [
        [i * 0.018, -0.55, 0],
        [i * 0.018, -0.49, 0],
        [i * 0.018, -0.45, 0],
      ] as Vec3[],
      radius: 0.032,
      endRadius: 0.022,
      color: "#81956a",
    },
    {
      name: "perianth stalk",
      cluster: 0,
      points: [
        [i * 0.018, -0.45, 0],
        [c.position[0] * 0.4, -0.22, c.position[2] * 0.4],
        c.position,
      ] as Vec3[],
      radius: 0.016,
      endRadius: 0.019,
      color: "#bac8a1",
    },
  ],
);
for (let c = 0; c < 4; c++) {
  const young = c === 3,
    delay = c * 0.025;
  CROCUS_MODEL.surfaces.push({
    name: "basal perianth tube",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.012,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 2],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.025 + 0.033 * v * v;
      return [Math.sin(a) * r, 0.38 * v, Math.cos(a) * r];
    },
  });
  for (let i = 0; i < 6; i++) {
    const inner = i >= 3,
      a = ((i % 3) * Math.PI * 2) / 3 + (inner ? Math.PI / 3 : 0),
      length = inner ? 0.58 : 0.64;
    CROCUS_MODEL.surfaces.push({
      name: "perianth tepal",
      cluster: c,
      role: "petal",
      thickness: inner ? 0.013 : 0.016,
      flexible: true,
      cage: [3, 5],
      mobileCage: [2, 3],
      delay,
      compliance: 0.000045,
      shapeCompliance: 0.00045,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.12 : 1),
          w =
            (2 * u - 1) *
            (0.004 + 0.18 * Math.sin(v * Math.PI) ** 0.66) *
            (0.4 + 0.6 * open),
          r =
            0.05 * (1 - v * 0.75) +
            0.115 * (1 - open) * Math.sin(v * Math.PI) +
            0.39 * open * Math.sin(v * 1.13);
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          0.36 +
            length * v * (1 - 0.43 * open) +
            0.045 * (2 * u - 1) ** 2 * Math.sin(v * Math.PI) * open,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  CROCUS_MODEL.organs.push(
    ...floralStamens({
      count: 3,
      cluster: c,
      radius: 0.061,
      height: 0.62,
      base: 0.39,
      foldedHeight: 0.56,
      filament: "#efe7b9",
      anther: "#e9b434",
      filamentRadius: 0.006,
      antherLength: 0.11,
    }),
  );
  CROCUS_MODEL.organs.push({
    name: "central style",
    cluster: c,
    points: [
      [0, 0.38, 0],
      [0, 0.55, 0],
      [0, 0.68, 0],
    ],
    foldedPoints: [
      [0, 0.38, 0],
      [0, 0.52, 0],
      [0, 0.63, 0],
    ],
    radius: 0.006,
    endRadius: 0.007,
    color: "#e3c17c",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    CROCUS_MODEL.organs.push({
      name: "stigma branch",
      cluster: c,
      points: [
        [0, 0.67, 0],
        [Math.sin(a) * 0.024, 0.73, Math.cos(a) * 0.024],
        [Math.sin(a) * 0.049, 0.765, Math.cos(a) * 0.049],
      ],
      foldedPoints: [
        [0, 0.63, 0],
        [Math.sin(a) * 0.015, 0.65, Math.cos(a) * 0.015],
        [Math.sin(a) * 0.023, 0.67, Math.cos(a) * 0.023],
      ],
      radius: 0.011,
      endRadius: 0.014,
      color: "#dc923c",
    });
  }
}
