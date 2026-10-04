import type { Quality, Vec3 } from "../flowers/types";
import { createParametricShell } from "./parametricShell";
import { createOrganicTube } from "./organicTube";
import { Float32BufferAttribute } from "three";
export interface SpecimenSurface {
  name: string;
  cluster: number;
  role: "petal" | "tube" | "calyx" | "bract" | "banner" | "wing" | "keel";
  sample: (u: number, v: number, open: number) => Vec3;
  thickness: number;
  periodic?: boolean;
  flexible?: boolean;
  delay?: number;
  compliance?: number;
  pinMidrib?: boolean;
  cage?: [number, number];
  mobileCage?: [number, number];
}
export interface SpecimenCluster {
  position: Vec3;
  rotation: Vec3;
  scale: number;
  nod: number;
}
export interface SpecimenOrgan {
  fine?: boolean;
  cluster: number;
  name: string;
  points: Vec3[];
  radius: number;
  endRadius?: number;
  color: string;
  flatten?: number;
}
export interface SpecimenModel {
  clusters: SpecimenCluster[];
  surfaces: SpecimenSurface[];
  organs: SpecimenOrgan[];
}
export function specimenGeometry(surface: SpecimenSurface, quality: Quality) {
  const resolution = {
    low: [12, 16],
    medium: [20, 24],
    high: [32, 32],
    ultra: [48, 44],
  }[quality];
  const g = createParametricShell({
    columns: resolution[0],
    rows: resolution[1],
    ...surface,
  });
  const side = new Float32Array(g.getAttribute("position").count);
  for (let i = 0; i < side.length; i++) side[i] = i < side.length / 2 ? 1 : -1;
  g.setAttribute("tissueSide", new Float32BufferAttribute(side, 1));
  return g;
}
export function specimenOrganGeometry(organ: SpecimenOrgan, quality: Quality) {
  return createOrganicTube({
    ...organ,
    segments: quality === "low" ? 10 : 24,
    sides: quality === "low" ? 7 : 12,
    grain: 0.025,
  });
}
export const SINGLE_CLUSTER: SpecimenCluster = {
  position: [0, 0, 0],
  rotation: [0, 0, 0],
  scale: 1,
  nod: 0.015,
};

export function radialTube(
  radius: number,
  length: number,
  lobes: number,
  openRadius = radius,
) {
  return (u: number, v: number, open: number): Vec3 => {
    const a = u * Math.PI * 2;
    const r = radius + (openRadius - radius) * v ** 3 * open;
    return [
      Math.cos(a) * r,
      length * v + 0.025 * Math.cos(a * lobes) * v ** 8,
      Math.sin(a) * r,
    ];
  };
}
