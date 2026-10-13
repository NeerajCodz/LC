import type { BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Quality } from "../flowers/types";
import { specimenInstanceGeometry } from "./floretInstances";
import type { SpecimenInstanceGroup, SpecimenSurface } from "./specimenModel";

export interface FloretSurfaceBatch {
  surface: SpecimenSurface;
  geometry: BufferGeometry;
  sourceIndices: number[];
}

function mergeParts(parts: BufferGeometry[]) {
  if (parts.length === 1) return parts[0];
  const merged = mergeGeometries(parts);
  parts.forEach((geometry) => geometry.dispose());
  if (!merged) throw new Error("Incompatible floret prototype attributes");
  merged.computeBoundingBox();
  merged.computeBoundingSphere();
  return merged;
}

/** Each pose carries the complete real anatomy through one shared bloom morph. */
export function specimenInstanceBatches(
  group: SpecimenInstanceGroup,
  quality: Quality,
) {
  const parts = specimenInstanceGeometry(group, quality);
  const surfaces: FloretSurfaceBatch[] = [];
  const byTissue = new Map<string, FloretSurfaceBatch>();
  group.surfaces.forEach((surface, i) => {
    // Focused tiers keep their existing buffers and their rendering path.
    const key =
      quality === "overview"
        ? `${surface.role}/${surface.tissue ?? "base"}`
        : String(i);
    let batch = byTissue.get(key);
    if (!batch) {
      batch = { surface, geometry: parts.surfaces[i], sourceIndices: [] };
      byTissue.set(key, batch);
      surfaces.push(batch);
    }
    batch.sourceIndices.push(i);
  });
  for (const batch of surfaces)
    batch.geometry = mergeParts(
      batch.sourceIndices.map((i) => parts.surfaces[i]),
    );
  // The existing organ material uses vertex colors for every reproductive part.
  const organs =
    quality === "overview" && parts.organs.length
      ? [mergeParts(parts.organs)]
      : parts.organs;
  return { surfaces, organs };
}
