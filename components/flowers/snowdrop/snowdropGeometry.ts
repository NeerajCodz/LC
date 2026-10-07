import { Euler, Vector3 } from "three";
import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
export function snowdropTepal(index: number, inner: boolean, young = false) {
  const a = (index * Math.PI * 2) / 3 + (inner ? Math.PI / 3 : 0),
    length = inner ? 0.47 : 0.94;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (young ? 0.14 : 1),
      w =
        (2 * u - 1) *
        (0.003 + (inner ? 0.105 : 0.21) * Math.sin(Math.PI * v) ** 0.55) *
        (inner ? 0.8 + 0.2 * open : 0.55 + 0.45 * open);
    const closed =
      0.04 * (1 - v) + (inner ? 0.057 : 0.09) * Math.sin(Math.PI * v) ** 0.7;
    const r =
      closed * (1 - open) +
      (inner ? 0.115 : 0.4) * open * Math.sin(v * Math.PI * 0.62);
    const notch = inner
      ? 0.055 * Math.exp(-(((u - 0.5) / 0.19) ** 2)) * v ** 9
      : 0;
    return [
      Math.sin(a) * r + Math.cos(a) * w,
      length * v * (1 - (inner ? 0.03 : 0.2) * open) -
        notch +
        0.045 * (2 * u - 1) ** 2 * Math.sin(Math.PI * v) * open,
      Math.cos(a) * r - Math.sin(a) * w,
    ];
  };
}
export const SNOWDROP_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.36, 0.1, 0.1],
      rotation: [2.83, -0.12, 0.06],
      scale: 0.64,
      nod: 0.022,
    },
    {
      position: [0.35, 0.28, 0.07],
      rotation: [2.78, 0.15, -0.04],
      scale: 0.6,
      nod: 0.024,
    },
    {
      position: [0.02, 0.53, -0.22],
      rotation: [2.3, 0.15, 0.06],
      scale: 0.39,
      nod: 0.026,
    },
  ],
  surfaces: [],
  organs: [],
};
export const SNOWDROP_STALKS: SpecimenOrgan[] = SNOWDROP_MODEL.clusters.flatMap(
  (c, i) => {
    const top = new Vector3(0, -0.15, 0)
      .applyEuler(new Euler(...c.rotation))
      .multiplyScalar(c.scale)
      .add(new Vector3(...c.position))
      .toArray() as Vec3;
    return [
      {
        name: "solitary curved scape",
        cluster: 0,
        points: [
          [c.position[0] * 0.25, -1.65, c.position[2] * 0.25],
          [c.position[0] * 0.85, c.position[1] + 0.08, c.position[2] - 0.08],
          [top[0], top[1] + 0.15, top[2] - 0.08],
          top,
        ],
        radius: 0.012,
        endRadius: 0.008,
        color: "#718965",
      },
      {
        name: "green scape spathe",
        cluster: 0,
        points: [
          [c.position[0] * 0.85, c.position[1] + 0.08, c.position[2] - 0.08],
          [c.position[0] * 0.8, c.position[1] + 0.22, c.position[2] - 0.08],
          [c.position[0] * 0.6, c.position[1] + 0.31, c.position[2] - 0.09],
        ],
        radius: 0.026,
        endRadius: 0.003,
        flatten: 0.3,
        color: i === 2 ? "#7c956b" : "#8b9e72",
      },
    ];
  },
);
for (let c = 0; c < 3; c++) {
  const delay = c * 0.025;
  for (let i = 0; i < 3; i++) {
    SNOWDROP_MODEL.surfaces.push({
      name: "outer tepal",
      cluster: c,
      role: "petal",
      sample: snowdropTepal(i, false, c === 2),
      thickness: 0.012,
      flexible: true,
      cage: [4, 5],
      mobileCage: [3, 4],
      delay,
      compliance: 0.00003,
      shapeCompliance: 0.0005,
    });
    SNOWDROP_MODEL.surfaces.push({
      name: "inner green-marked tepal",
      cluster: c,
      role: "petal",
      tissue: "inner",
      sample: snowdropTepal(i, true, c === 2),
      thickness: 0.015,
      flexible: true,
      cage: [4, 5],
      mobileCage: [3, 4],
      delay,
      compliance: 0.000016,
      shapeCompliance: 0.00018,
    });
  }
  SNOWDROP_MODEL.surfaces.push({
    name: "inferior ovary",
    cluster: c,
    role: "calyx",
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.027 + 0.042 * Math.sin(Math.PI * v);
      return [Math.cos(a) * r, -0.15 + 0.16 * v, Math.sin(a) * r];
    },
    periodic: true,
    thickness: 0.018,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 2],
  });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3,
      x = Math.sin(a) * 0.037,
      z = Math.cos(a) * 0.037;
    SNOWDROP_MODEL.organs.push({
      name: "included stamen filament",
      cluster: c,
      points: [
        [x * 0.5, 0.025, z * 0.5],
        [x * 0.9, 0.12, z * 0.9],
        [x, 0.19, z],
      ],
      foldedPoints: [
        [x * 0.4, 0.025, z * 0.4],
        [x * 0.6, 0.1, z * 0.6],
        [x * 0.65, 0.16, z * 0.65],
      ],
      radius: 0.004,
      endRadius: 0.003,
      color: "#dde0b5",
    });
    SNOWDROP_MODEL.organs.push({
      name: "included anther",
      cluster: c,
      points: [
        [x, 0.19, z],
        [x, 0.25, z],
        [x * 0.8, 0.31, z * 0.8],
      ],
      foldedPoints: [
        [x * 0.65, 0.16, z * 0.65],
        [x * 0.65, 0.22, z * 0.65],
        [x * 0.6, 0.28, z * 0.6],
      ],
      radius: 0.01,
      endRadius: 0.005,
      flatten: 0.56,
      color: "#c4b270",
    });
  }
  SNOWDROP_MODEL.organs.push({
    name: "pistil style",
    cluster: c,
    points: [
      [0, 0.015, 0],
      [0, 0.2, 0],
      [0, 0.34, 0],
    ],
    foldedPoints: [
      [0, 0.015, 0],
      [0, 0.17, 0],
      [0, 0.28, 0],
    ],
    radius: 0.005,
    endRadius: 0.006,
    color: "#c6d0a0",
  });
}
