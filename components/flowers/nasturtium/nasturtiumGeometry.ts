import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
export const NASTURTIUM_MODEL: SpecimenModel = {
  clusters: [
    {
      position: [-0.46, 0.05, 0.07],
      rotation: [1.1, -0.28, 0.1],
      scale: 0.55,
      nod: 0.025,
    },
    {
      position: [0.43, 0.28, 0.09],
      rotation: [1.15, 0.25, -0.1],
      scale: 0.53,
      nod: 0.028,
    },
    {
      position: [-0.03, 0.58, -0.16],
      rotation: [1.05, 0, 0.08],
      scale: 0.51,
      nod: 0.024,
    },
    {
      position: [0.35, 0.6, 0.3],
      rotation: [0.6, 0.2, 0],
      scale: 0.29,
      nod: 0.022,
    },
  ],
  surfaces: [],
  organs: [],
};
export const NASTURTIUM_STALKS: SpecimenOrgan[] = NASTURTIUM_MODEL.clusters.map(
  (c) => ({
    name: "curved floral pedicel",
    cluster: 0,
    points: [
      [0, -0.5, 0],
      [c.position[0] * 0.7, c.position[1] - 0.18, c.position[2] * 0.7],
      c.position,
    ] as Vec3[],
    radius: 0.02,
    endRadius: 0.012,
    color: "#839956",
  }),
);
for (let c = 0; c < 4; c++) {
  const age = c === 3 ? 0.1 : 1;
  NASTURTIUM_MODEL.surfaces.push({
    name: "fused calyx cup",
    cluster: c,
    role: "bract",
    tissue: "inner",
    periodic: true,
    thickness: 0.013,
    contactObstacle: true,
    cage: [6, 3],
    mobileCage: [4, 2],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.04 + 0.062 * v;
      return [Math.sin(a) * r, -0.06 + 0.25 * v, Math.cos(a) * r];
    },
  });
  for (let i = 0; i < 5; i++) {
    const a = ((i * 2 + 1) * Math.PI) / 5;
    NASTURTIUM_MODEL.surfaces.push({
      name: "calyx sepal",
      cluster: c,
      role: "bract",
      tissue: "inner",
      thickness: 0.013,
      contactObstacle: true,
      cage: [2, 3],
      mobileCage: [1, 2],
      sample: (u, v, stage) => {
        const open = stage * age,
          w = (2 * u - 1) * (0.004 + 0.12 * Math.sin(v * Math.PI) ** 0.7),
          r = 0.086 + (0.04 + 0.25 * open) * v;
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          0.02 + 0.36 * v * (1 - 0.62 * open),
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  NASTURTIUM_MODEL.surfaces.push({
    name: "hollow dorsal spur",
    cluster: c,
    role: "bract",
    tissue: "inner",
    periodic: true,
    thickness: 0.01,
    contactObstacle: true,
    cage: [8, 6],
    mobileCage: [4, 3],
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.008 + 0.045 * (1 - v) ** 0.75;
      return [
        Math.sin(a) * r,
        0.07 + 0.1 * v + Math.cos(a) * r,
        -0.074 - 0.64 * v,
      ];
    },
  });
  NASTURTIUM_MODEL.organs.push({
    name: "sealed spur tip",
    cluster: c,
    points: [
      [0, 0.166, -0.69],
      [0, 0.17, -0.714],
      [0, 0.17, -0.736],
    ],
    radius: 0.01,
    endRadius: 0.005,
    color: "#ba9c5c",
  });
  for (let i = 0; i < 5; i++) {
    const upper = i < 2,
      a = upper ? Math.PI + (i === 0 ? -0.43 : 0.43) : (i - 3) * 0.72;
    NASTURTIUM_MODEL.surfaces.push({
      name: upper ? "upper guide petal" : "fringed lower petal",
      cluster: c,
      role: "petal",
      tissue: upper ? "guide" : undefined,
      thickness: 0.011,
      flexible: true,
      cage: [3, 5],
      mobileCage: [1, 3],
      compliance: upper ? 0.000045 : 0.00007,
      shapeCompliance: 0.00055,
      sample: (u, v, stage) => {
        const open = stage * age,
          broad = upper ? 1 : Math.max(0, Math.min(1, (v - 0.24) / 0.32)),
          fringe = upper
            ? 0
            : 0.032 *
              (0.5 + 0.5 * Math.cos(v * Math.PI * 18)) *
              (1 - Math.min(1, v / 0.46)) *
              Math.sin(v * Math.PI),
          width =
            0.004 +
            (upper ? 0.29 : 0.27) * Math.sin(v * Math.PI) ** 0.65 * broad +
            fringe,
          w = (2 * u - 1) * width * (0.38 + 0.62 * open),
          r =
            0.097 * (1 - v * 0.65) +
            0.13 * (1 - open) * Math.sin(v * Math.PI) +
            (upper ? 0.66 : 0.6) * open * Math.sin(v * 1.25);
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          0.06 +
            0.63 * v * (1 - 0.7 * open) +
            0.07 * (2 * u - 1) ** 2 * Math.sin(v * Math.PI) * open,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  NASTURTIUM_MODEL.organs.push(
    ...floralStamens({
      count: 8,
      cluster: c,
      radius: 0.059,
      height: 0.245,
      base: 0.07,
      foldedHeight: 0.22,
      filament: "#e6b063",
      anther: "#ba8241",
      filamentRadius: 0.0045,
      antherLength: 0.037,
    }),
  );
  NASTURTIUM_MODEL.organs.push({
    name: "central style",
    cluster: c,
    points: [
      [0, 0.025, 0],
      [0, 0.17, 0],
      [0, 0.29, 0],
    ],
    radius: 0.006,
    endRadius: 0.006,
    color: "#cbab6d",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    NASTURTIUM_MODEL.organs.push({
      name: "style branch",
      cluster: c,
      points: [
        [0, 0.285, 0],
        [Math.sin(a) * 0.017, 0.31, Math.cos(a) * 0.017],
        [Math.sin(a) * 0.024, 0.329, Math.cos(a) * 0.024],
      ],
      radius: 0.004,
      endRadius: 0.0045,
      color: "#c4ac77",
    });
  }
}
