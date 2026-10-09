import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  radialTube,
  type SpecimenModel,
  anchoredHeadCluster,
  specimenClusterPoint,
} from "@/lib/three/specimenModel";

/** Nested double-form cups have narrow rolled inner blades and spreading outer blades. */
export function ranunculusPetal(index: number) {
  const layer = Math.floor(index / 12),
    local = index % 12;
  const a = (local * Math.PI) / 6 + layer * 0.27;
  const length = 0.88 - layer * 0.13,
    width = 0.31 - layer * 0.045;
  const root = 0.15 - layer * 0.031;
  return (u: number, v: number, stage: number): Vec3 => {
    const open = stage * (1 - layer * 0.15),
      w = 2 * u - 1;
    const cross =
      w *
      (0.004 + width * Math.sin(Math.PI * v) ** 0.66) *
      (0.29 + 0.71 * open);
    const roll = a + 0.13 * Math.sin(v * Math.PI) * (1 - open);
    const radius =
      root * (1 - v * 0.75) +
      (0.14 + 0.1 * (1 - stage)) * (1 - open) * Math.sin(v * Math.PI) +
      length * open * Math.sin(v * 1.18);
    const y =
      length * v * (0.62 + 0.38 * stage - open * 0.74) +
      0.14 * v * v * open +
      0.12 * w * w * Math.sin(v * Math.PI) * open +
      0.01 * Math.sin(v * 37 + index) * open;
    return [
      Math.sin(roll) * radius + Math.cos(roll) * cross,
      y + layer * 0.035,
      Math.cos(roll) * radius - Math.sin(roll) * cross,
    ];
  };
}
export const RANUNCULUS_MODEL: SpecimenModel = {
  clusters: [SINGLE_CLUSTER],
  surfaces: [],
  organs: [],
};
for (let i = 0; i < 48; i++) {
  const layer = Math.floor(i / 12);
  RANUNCULUS_MODEL.surfaces.push({
    name: "cupped petal",
    cluster: 0,
    role: "petal",
    sample: ranunculusPetal(i),
    thickness: 0.009 + layer * 0.0005,
    flexible: true,
    cage: [3, 5],
    mobileCage: [1, 3],
    delay: layer * 0.045,
    compliance: 0.000045,
    shapeCompliance: 0.00065,
  });
}
for (let i = 0; i < 5; i++) {
  const a = (i * Math.PI * 2) / 5;
  RANUNCULUS_MODEL.surfaces.push({
    name: "protective sepal",
    cluster: 0,
    role: "calyx",
    thickness: 0.011,
    contactObstacle: true,
    cage: [2, 3],
    mobileCage: [1, 2],
    sample: (u, v, stage) => {
      const width =
        (2 * u - 1) * (0.004 + (0.24 - 0.125 * stage) * Math.sin(v * Math.PI));
      const closed =
        0.12 * (1 - v * 0.55) + 0.29 * Math.sin(v * Math.PI) ** 0.78;
      const r = closed * (1 - stage) + (0.1 + 0.37 * v) * stage;
      return [
        Math.sin(a) * r + Math.cos(a) * width,
        -0.07 + v * (0.61 - 0.76 * stage),
        Math.cos(a) * r - Math.sin(a) * width,
      ];
    },
  });
}
RANUNCULUS_MODEL.surfaces.push({
  name: "floral receptacle",
  cluster: 0,
  role: "calyx",
  sample: radialTube(0.105, 0.045, 5),
  periodic: true,
  thickness: 0.012,
});
for (let i = 0; i < 12; i++) {
  const a = i * 2.399,
    r = 0.023 + 0.02 * Math.sqrt(i / 12);
  RANUNCULUS_MODEL.organs.push({
    name: "enclosed carpel",
    cluster: 0,
    points: [
      [Math.sin(a) * r, 0.035, Math.cos(a) * r],
      [Math.sin(a) * r, 0.105, Math.cos(a) * r],
      [Math.sin(a) * r * 1.3, 0.16, Math.cos(a) * r * 1.3],
    ],
    foldedPoints: [
      [Math.sin(a) * r, 0.035, Math.cos(a) * r],
      [Math.sin(a) * r, 0.08, Math.cos(a) * r],
      [Math.sin(a) * r * 1.1, 0.12, Math.cos(a) * r * 1.1],
    ],
    radius: 0.009,
    endRadius: 0.003,
    color: "#7c9862",
  });
}

RANUNCULUS_MODEL.clusters[0] = anchoredHeadCluster(0.8, 0, 1, 0.015);
export const RANUNCULUS_HEAD_CENTER = specimenClusterPoint(
  RANUNCULUS_MODEL.clusters[0],
  [0, 0.34, 0],
);
