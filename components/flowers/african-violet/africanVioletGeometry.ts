import type { Vec3 } from "@/lib/flowers/types";
import type {
  SpecimenModel,
  SpecimenOrgan,
  SpecimenSurface,
} from "@/lib/three/specimenModel";
export const AFRICAN_VIOLET_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 6 }, (_, i) => ({
    position: [
      Math.sin(i * 2.399) * 0.34,
      0.12 + (i % 3) * 0.11,
      Math.cos(i * 2.399) * 0.25,
    ] as Vec3,
    rotation: [
      1.02 + (i % 2) * 0.15,
      ((i % 3) - 1) * 0.15,
      ((i % 2) - 0.5) * 0.13,
    ] as Vec3,
    scale: i === 5 ? 0.34 : 0.68,
    nod: 0.024,
  })),
  surfaces: [],
  organs: [],
  instances: [],
};
export const AFRICAN_VIOLET_STALKS: SpecimenOrgan[] =
  AFRICAN_VIOLET_MODEL.clusters.map((c) => ({
    name: "dichasial flower stalk",
    cluster: 0,
    points: [
      [0, -0.54, 0],
      [c.position[0] * 0.65, -0.05, c.position[2] * 0.55],
      c.position,
    ],
    radius: 0.013,
    endRadius: 0.009,
    color: "#8a976f",
  }));
for (let c = 0; c < 6; c++) {
  AFRICAN_VIOLET_MODEL.surfaces.push({
    name: "bilateral fused corolla",
    cluster: c,
    role: "petal",
    periodic: true,
    thickness: 0.014,
    flexible: true,
    cage: [10, 5],
    mobileCage: [6, 3],
    compliance: 0.000055,
    shapeCompliance: 0.0007,
    sample: (u, v, stage) => {
      const open = c === 5 ? stage * 0.008 : stage,
        a = u * Math.PI * 2,
        lobe = 0.5 + 0.5 * Math.cos(a * 5),
        upper = Math.max(0, -Math.cos(a)),
        edge = 0.76 + 0.24 * lobe,
        limb = Math.max(0, (v - 0.17) / 0.83),
        fullRadius = 0.046 + 0.43 * limb ** 0.72 * edge * (1 - 0.2 * upper),
        // Keep the narrow basal tube, tapering the closed limb to a rounded apex.
        // Its finite radius stays wider than the normal-offset inner shell.
        foldedRadius =
          0.046 * (1 - v) + 0.008 * v + 0.09 * Math.sin(v * Math.PI),
        r = fullRadius * open + foldedRadius * (1 - open),
        h =
          0.07 * Math.min(1, v / 0.17) +
          0.37 * (1 - open) * limb +
          0.08 * open * Math.sin(limb * Math.PI) +
          0.008 * Math.sin(a * 17) * limb * open;
      return [Math.sin(a) * r, h, Math.cos(a) * r];
    },
  });
  {
    const corolla = AFRICAN_VIOLET_MODEL.surfaces.at(-1)!;
    const tips: SpecimenSurface[] = [];
    for (let i = 0; i < 5; i++) {
      const a = (i * Math.PI * 2) / 5;
      tips.push({
        name: "imbricated corolla apex tissue",
        cluster: c,
        role: "petal",
        thickness: 0.011,
        sample: (u, v, stage) => {
          const across = 2 * u - 1,
            angle = (a + across * 0.68) / (Math.PI * 2),
            rim = corolla.sample(angle, 1, c === 5 ? stage : 0),
            width = across * (0.004 + 0.006 * Math.sin(v * Math.PI));
          // Five real lobe ends continue from the narrow rim and overlap past
          // its axis; finite distal widths avoid a collapsed parametric pole.
          const folded: Vec3 = [
            rim[0] * (1 - v) + v * (-Math.sin(a) * 0.005 + Math.cos(a) * width),
            rim[1] + (0.025 + i * 0.0008) * v,
            rim[2] * (1 - v) + v * (-Math.cos(a) * 0.005 - Math.sin(a) * width),
          ];
          if (c === 5) return folded;
          const unfolded = corolla.sample(angle, 0.9 + 0.085 * v, 1);
          return folded.map(
            (p, axis) => p * (1 - stage) + unfolded[axis] * stage,
          ) as Vec3;
        },
      });
    }
    AFRICAN_VIOLET_MODEL.instances!.push({
      name: "five imbricated perianth tips",
      cluster: c,
      surfaces: tips,
      organs: [],
      poses: [
        {
          position: [0, 0, 0],
          rotation: [0, 0, 0],
          scale: 1,
          delay: 0,
          phase: c * 6 * 0.31,
        },
      ],
    });
  }
  for (let i = 0; i < 5; i++) {
    const a = (i * Math.PI * 2) / 5;
    AFRICAN_VIOLET_MODEL.surfaces.push({
      name: "free pubescent sepal",
      cluster: c,
      role: "calyx",
      thickness: 0.012,
      sample: (u, v, open) => {
        const r = 0.05 + 0.14 * v * (0.5 + open * 0.5),
          w = (2 * u - 1) * (0.004 + 0.034 * Math.sin(v * Math.PI));
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          -0.03 - 0.045 * v,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    });
  }
  for (const sign of [-1, 1]) {
    AFRICAN_VIOLET_MODEL.organs.push({
      name: "connivent stamen filament",
      cluster: c,
      points: [
        [sign * 0.037, 0.035, 0.018],
        [sign * 0.034, 0.105, 0.025],
        [sign * 0.018, 0.155, 0.036],
      ],
      radius: 0.009,
      endRadius: 0.008,
      color: "#e5dbb2",
    });
    for (const chamber of [-1, 1]) {
      const x = sign * 0.018 + chamber * 0.009;
      AFRICAN_VIOLET_MODEL.organs.push({
        name: "joined yellow anther chamber",
        cluster: c,
        points: [
          [x, 0.145, 0.035],
          [x, 0.169, 0.045],
          [x, 0.185, 0.036],
        ],
        radius: 0.017,
        endRadius: 0.009,
        color: "#e4bc42",
      });
    }
    AFRICAN_VIOLET_MODEL.organs.push({
      name: "staminodial peg",
      cluster: c,
      points: [
        [sign * 0.03, 0.036, -0.025],
        [sign * 0.04, 0.06, -0.025],
      ],
      radius: 0.008,
      endRadius: 0.005,
      color: "#bcb892",
    });
  }
  AFRICAN_VIOLET_MODEL.organs.push({
    name: "laterally exserted style",
    cluster: c,
    points: [
      [0, 0.025, -0.01],
      [0.055, 0.095, -0.005],
      [0.085, 0.2, 0],
    ],
    radius: 0.009,
    endRadius: 0.014,
    color: "#d5cbb8",
  });
}
