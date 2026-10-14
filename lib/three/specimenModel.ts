import type { Quality, Vec3 } from "../flowers/types";
import { createParametricShell } from "./parametricShell";
import { createOrganicTube } from "./organicTube";
import {
  Float32BufferAttribute,
  Euler,
  Matrix4,
  Vector3,
  type BufferGeometry,
} from "three";
import {
  createCagePatch,
  type ClosedCohesion,
  type PetalDynamics,
} from "./petalDynamics";
export type SpecimenTissue = "inner" | "guide" | "disc" | "leaf";
export interface SpecimenSurface {
  tissue?: SpecimenTissue;
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
  /** Authored angular landmarks or a smooth circumference in the distant grid. */
  overviewColumns?: number;
  /** Axial landmarks that must survive the distant overview grid. */
  overviewRows?: number;
  cage?: [number, number];
  mobileCage?: [number, number];
  /** Same-cluster valvate tissue shares row motion only while closed. */
  closedCohesion?: ClosedCohesion;
  /** Attached tissue shares this same-cluster carrier's cage; its v=0 root follows the real sampled wall. */
  cageAttachment?: {
    surface: SpecimenSurface;
    uv: (u: number, v: number) => [number, number];
  };
}
export interface SpecimenCluster {
  position: Vec3;
  rotation: Vec3;
  scale: number;
  nod: number;
}
/** Authored head pose rotates about its insertion, keeping the rooted shoot intact. */
export function anchoredHeadCluster(
  angle: number,
  anchorY = 0,
  scale = 1,
  nod = 0.015,
): SpecimenCluster {
  return {
    position: [
      0,
      anchorY * scale * (1 - Math.cos(angle)),
      -anchorY * scale * Math.sin(angle),
    ],
    rotation: [angle, 0, 0],
    scale,
    nod,
  };
}
/** One-time anatomical framing calculation, never used in a frame callback. */
export function specimenClusterPoint(
  cluster: SpecimenCluster,
  point: Vec3,
): Vec3 {
  const matrix = new Matrix4()
      .makeRotationFromEuler(new Euler(...cluster.rotation))
      .scale(new Vector3(cluster.scale, cluster.scale, cluster.scale))
      .setPosition(...cluster.position),
    p = new Vector3(...point).applyMatrix4(matrix);
  return [p.x, p.y, p.z];
}
export interface SpecimenOrgan {
  fine?: boolean;
  /** Explicit distant cross-section detail; the carrier's axial samples remain. */
  overviewSides?: number;
  /** Explicit carrier membership for reproductive organs with nonlegacy names. */
  bloomMorph?: boolean;
  cluster: number;
  name: string;
  points: Vec3[];
  foldedPoints?: Vec3[];
  foldedRadius?: number;
  radius: number;
  endRadius?: number;
  color: string;
  flatten?: number;
  /** Rotate flattened tissue about its carrier tangent, in radians. */
  sectionRoll?: number;
}
export interface SpecimenModel {
  clusters: SpecimenCluster[];
  surfaces: SpecimenSurface[];
  organs: SpecimenOrgan[];
  instances?: SpecimenInstanceGroup[];
}
export interface SpecimenInstancePose {
  position: Vec3;
  foldedPosition?: Vec3;
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
function specimenGrid(surface: SpecimenSurface, quality: Quality) {
  const resolution = {
    overview: [6, 6],
    low: [12, 16],
    medium: [20, 24],
    high: [32, 32],
    ultra: [48, 44],
  }[quality];
  // Distant shells use fewer axial strips; the focused tiers retain their curves.
  // Fused corollas keep their angular samples so five/six lobes remain distinct.
  const columns =
    quality === "overview"
      ? (surface.overviewColumns ?? (surface.periodic ? 24 : resolution[0]))
      : resolution[0];
  const rows =
    quality === "overview"
      ? (surface.overviewRows ?? resolution[1])
      : resolution[1];
  return { columns, rows };
}

/** Interpolate the same two triangles used by the carrier's real shell grid. */
function specimenGridPoint(
  surface: SpecimenSurface,
  quality: Quality,
  u: number,
  v: number,
  open: number,
): Vec3 {
  const { columns, rows } = specimenGrid(surface, quality),
    su =
      (surface.periodic ? ((u % 1) + 1) % 1 : Math.max(0, Math.min(1, u))) *
      columns,
    sv = Math.max(0, Math.min(1, v)) * rows,
    column = Math.min(columns - 1, Math.floor(su)),
    row = Math.min(rows - 1, Math.floor(sv)),
    x = su - column,
    y = sv - row,
    right = surface.periodic ? (column + 1) % columns : column + 1,
    a = surface.sample(column / columns, row / rows, open),
    d = surface.sample(right / columns, (row + 1) / rows, open),
    middle =
      y <= x
        ? surface.sample(right / columns, row / rows, open)
        : surface.sample(column / columns, (row + 1) / rows, open),
    wa = 1 - Math.max(x, y),
    wd = Math.min(x, y),
    wm = Math.abs(x - y);
  return [
    a[0] * wa + d[0] * wd + middle[0] * wm,
    a[1] * wa + d[1] * wd + middle[1] * wm,
    a[2] * wa + d[2] * wd + middle[2] * wm,
  ];
}

export function specimenGeometry(surface: SpecimenSurface, quality: Quality) {
  const { columns, rows } = specimenGrid(surface, quality),
    attachment = surface.cageAttachment;
  const sample = attachment
    ? (u: number, v: number, open: number): Vec3 => {
        const point = surface.sample(u, v, open),
          blend = Math.max(0, 1 - v * 4) ** 2;
        if (!blend) return point;
        const [cu, cv] = attachment.uv(u, 0),
          root = specimenGridPoint(attachment.surface, quality, cu, cv, open),
          authored = surface.sample(u, 0, open);
        return [
          point[0] + (root[0] - authored[0]) * blend,
          point[1] + (root[1] - authored[1]) * blend,
          point[2] + (root[2] - authored[2]) * blend,
        ];
      }
    : surface.sample;
  const g = createParametricShell({
    columns,
    rows,
    ...surface,
    sample,
  });
  const side = new Float32Array(g.getAttribute("position").count);
  for (let i = 0; i < side.length; i++) side[i] = i < side.length / 2 ? 1 : -1;
  g.setAttribute("tissueSide", new Float32BufferAttribute(side, 1));
  if (surface.pressureSample) {
    const pressed = createParametricShell({
      columns,
      rows,
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
  const closedClusters = new Map<number, number>();
  for (const surface of model.surfaces) {
    if (surface.closedCohesion) {
      const group = surface.closedCohesion.group,
        cluster = closedClusters.get(group);
      if (
        !surface.flexible ||
        surface.cageAttachment ||
        surface.pinMidrib ||
        (cluster !== undefined && cluster !== surface.cluster)
      )
        throw new Error(
          "Closed cohesion requires flexible tissue in the same cluster without independent pins or attachments",
        );
      closedClusters.set(group, surface.cluster);
    }
    const carrier = surface.cageAttachment?.surface;
    if (
      carrier &&
      (!model.surfaces.includes(carrier) ||
        !carrier.flexible ||
        carrier.cageAttachment ||
        carrier.pressureSample ||
        carrier.cluster !== surface.cluster ||
        surface.flexible ||
        surface.contactObstacle ||
        surface.pressureSample)
    )
      throw new Error(
        "Attached cage tissue requires one flexible carrier in the same cluster without an independent pressure morph",
      );
  }
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

/** Additional botanical midribs use the same authored cage indices everywhere. */
export function applySpecimenPins(
  simulation: Pick<PetalDynamics, "patches" | "offsets" | "inverseMass">,
  model: Pick<SpecimenModel, "surfaces">,
  indices: readonly number[],
) {
  for (let i = 0; i < indices.length; i++) {
    if (!model.surfaces[indices[i]].pinMidrib) continue;
    const patch = simulation.patches[i],
      stride = patch.periodic ? patch.columns : patch.columns + 1;
    for (let row = 0; row <= patch.rows; row++)
      simulation.inverseMass[
        simulation.offsets[i] + row * stride + Math.floor(stride / 2)
      ] = 0;
  }
}
export function specimenOrganGeometry(organ: SpecimenOrgan, quality: Quality) {
  const options = {
    ...organ,
    segments:
      quality === "overview"
        ? Math.max(4, organ.points.length)
        : quality === "low"
          ? 10
          : 24,
    sides:
      quality === "overview"
        ? (organ.overviewSides ?? 4)
        : quality === "low"
          ? 7
          : 12,
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

/** Reproductive tissue follows its flower's bloom; axes and attachments remain fixed. */
export function specimenOrganFollowsBloom(
  organ: Pick<SpecimenOrgan, "name" | "bloomMorph">,
) {
  return (
    organ.bloomMorph ??
    /stamen|anther|style|pistil|stigma|hair/.test(organ.name)
  );
}

/** The renderer's real partition and matched morph attributes, prepared once per quality. */
export function specimenOrganParts(
  model: SpecimenModel,
  cluster: number,
  quality: Quality,
  included: boolean,
): { organ: SpecimenOrgan; geometry: BufferGeometry }[] {
  const parts = model.organs.flatMap((organ, i) =>
    organ.cluster === cluster &&
    specimenOrganFollowsBloom(organ) === included &&
    (!organ.fine || quality === "high" || quality === "ultra" || i % 3 === 0)
      ? [{ organ, geometry: specimenOrganGeometry(organ, quality) }]
      : [],
  );
  if (parts.some(({ geometry }) => geometry.morphAttributes.position?.length))
    for (const { geometry } of parts)
      if (!geometry.morphAttributes.position?.length) {
        geometry.morphAttributes.position = [
          geometry.getAttribute("position").clone(),
        ];
        geometry.morphAttributes.normal = [
          geometry.getAttribute("normal").clone(),
        ];
      }
  return parts;
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
