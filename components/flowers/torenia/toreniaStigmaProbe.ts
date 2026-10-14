import {
  Raycaster,
  Vector3,
  type Intersection,
  type Mesh,
  type Object3D,
  type Ray,
} from "three";
import { petalOpenness } from "@/lib/three/easing";
import type { RefObject } from "react";
import type { FlowerOrganRayProbe } from "@/components/flowers/FloralParts";
import { specimenOrganCarrier } from "@/lib/three/specimenModel";
import {
  isInnerToreniaStigmaHit,
  TORENIA_RENDER_MODEL,
} from "./toreniaStigmaGeometry";

const carriers = TORENIA_RENDER_MODEL.clusters.map((_, cluster) =>
  specimenOrganCarrier(TORENIA_RENDER_MODEL, cluster),
);
const nearestFirst = (a: Intersection, b: Intersection) =>
  a.distance - b.distance;
/** Explicit imperative ref registration with ownership-safe cleanup. */
export function registerToreniaStigmaProbe(
  slot: RefObject<FlowerOrganRayProbe | null>,
  probe: FlowerOrganRayProbe,
) {
  slot.current = probe;
  return () => {
    if (slot.current === probe) slot.current = null;
  };
}
export function createToreniaStigmaProbeScratch() {
  return {
    raycaster: new Raycaster(),
    point: new Vector3(),
    normal: new Vector3(),
    hits: [] as Intersection[],
    occlusion: [] as Intersection[],
    result: { cluster: 0, lobe: 0 as 0 | 1 },
  };
}

/** Small actual lamella query first; whole anatomical occlusion only for a qualifying inner face. */
export function probeToreniaStigmaRay(
  ray: Ray,
  meshes: readonly (Mesh | null)[],
  bloom: number,
  organs: Object3D | null,
  scratch: ReturnType<typeof createToreniaStigmaProbeScratch>,
) {
  if (!organs || !Number.isFinite(bloom) || bloom < 0.65) return false;
  const { raycaster, hits, point, normal, occlusion } = scratch;
  raycaster.ray.copy(ray);
  hits.length = 0;
  // Persistent young buds never enter the query.
  for (let i = 0; i < 6; i++) meshes[i]?.raycast(raycaster, hits);
  if (!hits.length) return false;
  hits.sort(nearestFirst);
  const hit = hits[0],
    index = meshes.indexOf(hit.object as Mesh),
    cluster = Math.floor(index / 2),
    lobe = (index % 2) as 0 | 1,
    mesh = meshes[index];
  if (
    index < 0 ||
    !mesh ||
    !hit.face ||
    hit.faceIndex == null ||
    petalOpenness(bloom, carriers[cluster].delay, carriers[cluster].phase) <
      0.65
  )
    return false;
  mesh.worldToLocal(point.copy(hit.point));
  normal.copy(hit.face.normal);
  if (
    !isInnerToreniaStigmaHit(mesh.geometry, lobe, hit.faceIndex, point, normal)
  )
    return false;
  occlusion.length = 0;
  raycaster.intersectObject(organs, true, occlusion);
  if (occlusion.length && occlusion[0].distance < hit.distance - 1e-5)
    return false;
  scratch.result.cluster = cluster;
  scratch.result.lobe = lobe;
  return true;
}
