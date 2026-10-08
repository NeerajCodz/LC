import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export const GARDENIA_MODEL: SpecimenModel = {
  clusters: [
    { position: [0, 0, 0], rotation: [0, 0, 0], scale: 0.86, nod: 0.008 },
    {
      position: [-0.48, 0.16, 0.24],
      rotation: [0.2, -0.3, 0.12],
      scale: 0.29,
      nod: 0.012,
    },
    {
      position: [0.46, 0.31, -0.12],
      rotation: [0.2, 0.3, -0.12],
      scale: 0.3,
      nod: 0.012,
    },
  ],
  surfaces: [],
  organs: [],
};
export const GARDENIA_STALKS: SpecimenOrgan[] = GARDENIA_MODEL.clusters
  .slice(1)
  .map((c) => ({
    name: "woody lateral bud shoot",
    cluster: 0,
    points: [
      [0, -0.48, 0],
      [c.position[0] * 0.6, -0.03, c.position[2] * 0.6],
      c.position,
    ] as Vec3[],
    radius: 0.028,
    endRadius: 0.019,
    color: "#7d7854",
  }));
for (let c = 0; c < 3; c++) {
  const age = c === 0 ? 1 : 0.1;
  GARDENIA_MODEL.surfaces.push({
    name: "inferior ovary",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.016,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.022 + 0.037 * Math.sin(v * Math.PI) ** 0.65;
      return [Math.sin(a) * r, -0.17 + 0.22 * v, Math.cos(a) * r];
    },
  });
  GARDENIA_MODEL.surfaces.push({
    name: "long fused corolla tube",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.016,
    contactObstacle: true,
    cage: [8, 5],
    mobileCage: [4, 4],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.032 + 0.044 * v * v;
      return [Math.sin(a) * r, 0.45 * v, Math.cos(a) * r];
    },
  });
  for (let i = 0; i < 6; i++) {
    const a = (i * Math.PI) / 3;
    GARDENIA_MODEL.surfaces.push({
      name: "pinwheel corolla lobe",
      cluster: c,
      role: "petal",
      thickness: 0.02,
      flexible: true,
      cage: [3, 5],
      mobileCage: [1, 3],
      compliance: 0.00003,
      shapeCompliance: 0.00038,
      delay: i * 0.004,
      sample: (u, v, stage) => {
        const open = stage * age,
          angle = a + 0.35 * v * open,
          w =
            (2 * u - 1) *
            (0.004 + 0.27 * Math.sin(v * Math.PI) ** 0.65) *
            (0.4 + 0.6 * open),
          r =
            0.074 * (1 - v * 0.65) +
            0.13 * (1 - open) * Math.sin(v * Math.PI) +
            0.64 * open * Math.sin(v * 1.35);
        return [
          Math.sin(angle) * r + Math.cos(angle) * w,
          0.44 +
            0.56 * v * (1 - 0.86 * open) +
            0.045 * (2 * u - 1) ** 2 * Math.sin(v * Math.PI) * open,
          Math.cos(angle) * r - Math.sin(angle) * w,
        ];
      },
    });
    GARDENIA_MODEL.surfaces.push({
      name: "calyx lobe",
      cluster: c,
      role: "calyx",
      thickness: 0.011,
      contactObstacle: true,
      cage: [2, 3],
      mobileCage: [1, 2],
      sample: (u, v, stage) => {
        const w = (2 * u - 1) * (0.003 + 0.036 * Math.sin(v * Math.PI)),
          r = 0.043 + (0.042 + 0.05 * stage * age) * v;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          -0.085 + 0.34 * v,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  GARDENIA_MODEL.organs.push(
    ...floralStamens({
      count: 6,
      cluster: c,
      radius: 0.058,
      height: 0.4,
      base: 0.34,
      foldedHeight: 0.4,
      filament: "#e9dfbd",
      anther: "#d4b253",
      filamentRadius: 0.0045,
      antherLength: 0.073,
    }),
  );
  GARDENIA_MODEL.organs.push({
    name: "central style",
    cluster: c,
    points: [
      [0, -0.04, 0],
      [0, 0.24, 0],
      [0, 0.44, 0],
    ],
    radius: 0.008,
    endRadius: 0.012,
    color: "#d7d3a8",
  });
  for (const side of [-1, 1])
    GARDENIA_MODEL.organs.push({
      name: "included stigma lobe",
      cluster: c,
      points: [
        [0, 0.433, 0],
        [side * 0.012, 0.458, 0],
        [side * 0.019, 0.477, 0],
      ],
      radius: 0.013,
      endRadius: 0.015,
      flatten: 0.65,
      color: "#c9cda0",
    });
}
