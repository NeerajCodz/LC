import type { Vec3 } from "@/lib/flowers/types";
import { radialTube, type SpecimenModel } from "@/lib/three/specimenModel";

export function helleboreSepal(index: number, young = false) {
  const a = (index * Math.PI * 2) / 5 + 0.11;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.16 : 1),
      w =
        (2 * u - 1) *
        (0.004 + 0.35 * Math.sin(Math.PI * v) ** 0.65) *
        (0.15 + 0.85 * open);
    const r = 0.14 * (1 - v) + 0.67 * open * Math.sin(v * Math.PI * 0.51);
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      0.77 * v * (1 - 0.74 * open) +
        0.1 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v) * open,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const HELLEBORE_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.48, 0.08, 0.14],
      rotation: [1.8, -0.35, 0.12],
      scale: 0.56,
      nod: 0.018,
    },
    {
      position: [0.43, 0.3, 0.12],
      rotation: [1.68, 0.3, -0.15],
      scale: 0.58,
      nod: 0.02,
    },
    {
      position: [-0.05, 0.56, -0.2],
      rotation: [1.9, -0.15, 0.03],
      scale: 0.52,
      nod: 0.016,
    },
    {
      position: [0.26, 0.64, 0.37],
      rotation: [1.35, 0.15, 0.2],
      scale: 0.37,
      nod: 0.024,
    },
  ],
  surfaces: [],
  organs: [],
};
for (let c = 0; c < 4; c++) {
  const young = c === 3,
    delay = c * 0.025;
  for (let i = 0; i < 5; i++)
    HELLEBORE_MODEL.surfaces.push({
      name: "showy sepal",
      cluster: c,
      role: "petal",
      sample: helleboreSepal(i, young),
      thickness: 0.014,
      flexible: true,
      delay,
      cage: [3, 5],
      mobileCage: [2, 3],
      compliance: 0.000035,
      shapeCompliance: 0.0006,
    });
  HELLEBORE_MODEL.surfaces.push({
    name: "floral receptacle",
    cluster: c,
    role: "calyx",
    sample: radialTube(0.12, 0.07, 5),
    periodic: true,
    thickness: 0.015,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 2],
  });
  for (let i = 0; i < 10; i++) {
    const a = (i * Math.PI) / 5;
    HELLEBORE_MODEL.surfaces.push({
      name: "tubular nectary",
      cluster: c,
      role: "calyx",
      thickness: 0.005,
      periodic: true,
      delay,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.16 : 1),
          root = 0.043 + 0.1 * open,
          tube = 0.01 + 0.016 * open * v * v,
          theta = u * Math.PI * 2;
        return [
          Math.sin(a) * root + Math.cos(theta) * tube,
          0.06 + v * (0.08 + 0.13 * open),
          Math.cos(a) * root + Math.sin(theta) * tube,
        ];
      },
    });
  }
  for (let i = 0; i < 40; i++) {
    const a = i * 2.399,
      ring = Math.floor(i / 10),
      r = 0.045 + ring * 0.025,
      h = 0.28 + 0.04 * Math.sin(i * 0.73),
      age = young ? 0.45 : 1;
    const full: Vec3[] = [
      [Math.sin(a) * r, 0.055, Math.cos(a) * r],
      [Math.sin(a) * r * 1.25, h * 0.6 * age, Math.cos(a) * r * 1.25],
      [Math.sin(a) * r * 1.5, h * age, Math.cos(a) * r * 1.5],
    ];
    const folded: Vec3[] = [
      [Math.sin(a) * r * 0.5, 0.055, Math.cos(a) * r * 0.5],
      [Math.sin(a) * r * 0.48, 0.11, Math.cos(a) * r * 0.48],
      [Math.sin(a) * r * 0.42, 0.17, Math.cos(a) * r * 0.42],
    ];
    HELLEBORE_MODEL.organs.push({
      name: "stamen filament",
      cluster: c,
      points: full,
      foldedPoints: folded,
      radius: 0.0045,
      endRadius: 0.003,
      color: "#ebdfb8",
    });
    const tip = full[2],
      bud = folded[2];
    HELLEBORE_MODEL.organs.push({
      name: "stamen anther",
      cluster: c,
      points: [
        tip,
        [tip[0], tip[1] + 0.016, tip[2]],
        [tip[0] + 0.004, tip[1] + 0.034, tip[2]],
      ],
      foldedPoints: [
        bud,
        [bud[0], bud[1] + 0.009, bud[2]],
        [bud[0] + 0.002, bud[1] + 0.02, bud[2]],
      ],
      radius: 0.01,
      endRadius: 0.008,
      color: "#cfb359",
      flatten: 0.48,
    });
  }
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5,
      r = 0.026,
      h = young ? 0.16 : 0.34;
    HELLEBORE_MODEL.organs.push({
      name: "carpel style",
      cluster: c,
      points: [
        [Math.sin(a) * r, 0.045, Math.cos(a) * r],
        [Math.sin(a) * r * 1.15, h * 0.65, Math.cos(a) * r * 1.15],
        [Math.sin(a) * r * 1.8, h, Math.cos(a) * r * 1.8],
      ],
      foldedPoints: [
        [Math.sin(a) * r, 0.045, Math.cos(a) * r],
        [Math.sin(a) * r, 0.12, Math.cos(a) * r],
        [Math.sin(a) * r * 1.1, 0.19, Math.cos(a) * r * 1.1],
      ],
      radius: 0.011,
      endRadius: 0.004,
      color: "#89a267",
    });
  }
}
