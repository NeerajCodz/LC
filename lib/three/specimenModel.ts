import type { Quality, Vec3 } from "../flowers/types";
import { createParametricShell } from "./parametricShell";
import { createOrganicTube } from "./organicTube";
import { Float32BufferAttribute } from "three";
import { createCagePatch } from "./petalDynamics";
export interface SpecimenSurface {
  name: string;
  cluster: number;
  role: "petal" | "tube" | "calyx" | "bract" | "banner" | "wing" | "keel";
  sample: (u: number, v: number, open: number) => Vec3;
  pressureSample?: (u: number, v: number, open: number) => Vec3;
  thickness: number;
  periodic?: boolean;
  flexible?: boolean;
  contactObstacle?: boolean;
  delay?: number;
  compliance?: number;
  shapeCompliance?: number;
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
  foldedPoints?: Vec3[];
  foldedRadius?: number;
  radius: number;
  endRadius?: number;
  color: string;
  flatten?: number;
}
export interface SpecimenModel {
  clusters: SpecimenCluster[];
  surfaces: SpecimenSurface[];
  organs: SpecimenOrgan[];
  instances?: SpecimenInstanceGroup[];
}
export interface SpecimenInstancePose {
  position: Vec3;
  rotation: Vec3;
  scale: number;
  delay: number;
  phase: number;
}
/** Real sealed prototypes share draw resources, never simulation nodes. */
export interface SpecimenInstanceGroup {
  name: string;
  cluster: number;
  surfaces: SpecimenSurface[];
  organs: SpecimenOrgan[];
  poses: SpecimenInstancePose[];
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
  if (surface.pressureSample) {
    const pressed = createParametricShell({
      columns: resolution[0],
      rows: resolution[1],
      ...surface,
      sample: surface.pressureSample,
    });
    g.morphAttributes.position!.push(pressed.getAttribute("position"));
    g.morphAttributes.normal!.push(pressed.getAttribute("normal"));
    pressed.dispose();
  }
  return g;
}
export function specimenCages(model: SpecimenModel, constrained: boolean) {
  const indices = model.surfaces.flatMap((s, i) =>
    s.flexible || s.contactObstacle ? [i] : [],
  );
  const patches = indices.map((i) => {
    const s = model.surfaces[i],
      [columns, rows] = (constrained ? s.mobileCage : s.cage) ?? [3, 5];
    return createCagePatch({
      ...s,
      columns,
      rows,
      pinRows: s.flexible ? 1 : rows + 1,
      compliance: s.compliance ?? 0.00008,
    });
  });
  return { indices, patches };
}
export function specimenOrganGeometry(organ: SpecimenOrgan, quality: Quality) {
  const options = {
    ...organ,
    segments: quality === "low" ? 10 : 24,
    sides: quality === "low" ? 7 : 12,
    grain: 0.025,
  };
  const geometry = createOrganicTube(options);
  if (organ.foldedPoints) {
    const radius = organ.foldedRadius ?? organ.radius;
    const folded = createOrganicTube({
      ...options,
      points: organ.foldedPoints,
      radius,
      endRadius:
        ((organ.endRadius ?? organ.radius * 0.6) * radius) / organ.radius,
    });
    geometry.morphAttributes.position = [folded.getAttribute("position")];
    geometry.morphAttributes.normal = [folded.getAttribute("normal")];
    folded.dispose();
  }
  return geometry;
}

/** Included tissue follows its enclosing corolla/keel, not an earlier calyx. */
export function specimenOrganCarrier(model: SpecimenModel, cluster: number) {
  for (const role of [
    "tube",
    "keel",
    "petal",
    "banner",
    "wing",
    "bract",
    "calyx",
  ] as const) {
    const index = model.surfaces.findIndex(
      (s) => s.cluster === cluster && s.role === role,
    );
    if (index >= 0)
      return { delay: model.surfaces[index].delay ?? 0, phase: index * 0.31 };
  }
  return { delay: 0, phase: 0 };
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
