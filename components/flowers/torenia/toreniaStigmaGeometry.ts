import type { BufferGeometry, Vector3 } from "three";
import type { Quality } from "@/lib/flowers/types";
import {
  specimenGeometry,
  type SpecimenModel,
} from "@/lib/three/specimenModel";
import { TORENIA_MODEL, toreniaStigma } from "./toreniaGeometry";

/** Sensitive lamellae have their own contact state and are drawn exactly once. */
export const TORENIA_RENDER_MODEL: SpecimenModel = {
  ...TORENIA_MODEL,
  surfaces: TORENIA_MODEL.surfaces.filter(
    (surface) => surface.name !== "bilamellate torenia stigma",
  ),
};

export function createToreniaStigmaGeometry(
  cluster: number,
  lobe: 0 | 1,
  quality: Quality,
) {
  const surface = TORENIA_MODEL.surfaces.filter(
    (part) =>
      part.cluster === cluster && part.name === "bilamellate torenia stigma",
  )[lobe];
  if (!surface) throw new Error("Missing Torenia stigma lamella");
  return specimenGeometry(
    {
      ...surface,
      pressureSample: (u, v, open) =>
        toreniaStigma(u, v, open * (cluster >= 3 ? 0.05 : 1), lobe, 1),
    },
    quality,
  );
}

/** Classifies the actual sealed-mesh triangle, rejecting outer faces and cut walls. */
export function isInnerToreniaStigmaHit(
  geometry: BufferGeometry,
  lobe: 0 | 1,
  faceIndex: number,
  localPoint: Vector3,
  faceNormal: Vector3,
) {
  const index = geometry.index,
    count = geometry.getAttribute("position").count,
    base = faceIndex * 3;
  if (
    !index ||
    !Number.isInteger(faceIndex) ||
    faceIndex < 0 ||
    base + 2 >= index.count ||
    !Number.isFinite(localPoint.x + localPoint.y + localPoint.z) ||
    Math.abs(localPoint.x) > 0.034 ||
    localPoint.y < 0.01 ||
    localPoint.y > 0.19 ||
    localPoint.z < 0.48 ||
    localPoint.z > 0.612
  )
    return false;
  const back = index.getX(base) >= count / 2;
  if (
    index.getX(base + 1) >= count / 2 !== back ||
    index.getX(base + 2) >= count / 2 !== back
  )
    return false;
  // du × dv points down. The lower lamella's inner face is its back surface.
  return back === (lobe === 0) && faceNormal.y * (lobe ? -1 : 1) > 0.1;
}
