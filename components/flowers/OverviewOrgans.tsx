import { useEffect, useMemo } from "react";
import type { Mesh } from "three";
import {
  createOrganBatch,
  createOrganBatchMaterials,
  type OrganBatchGroup,
} from "@/lib/three/organBatch";
import type { SurfaceBatchUniforms } from "@/lib/three/surfaceBatch";
import {
  bindSurfaceBatchVertices,
  type SurfaceBatchPoses,
} from "@/lib/three/surfaceBatchPose";
import type { SpecimenModel } from "@/lib/three/specimenModel";

export interface OverviewOrganDraw {
  mesh: Mesh;
  uniforms: SurfaceBatchUniforms;
}

/** Ordinary distant organs retain their cluster insertion and independent carrier phase. */
export function OverviewOrgans({
  model,
  group,
  poses,
  assign,
}: {
  model: SpecimenModel;
  group: OrganBatchGroup;
  poses: SurfaceBatchPoses;
  assign: (draw: OverviewOrganDraw | null) => void;
}) {
  const geometry = useMemo(
    () => createOrganBatch(model, group),
    [model, group],
  );
  const uniforms = useMemo<SurfaceBatchUniforms>(
    () => ({
      uBatchBloom: { value: 1 },
      uBatchPressure: { value: 0 },
      uBatchPoses: { value: poses.texture },
      uBatchPoseRows: { value: model.clusters.length },
      uBatchHinge: { value: 0 },
    }),
    [poses, model],
  );
  const materials = useMemo(
    () => createOrganBatchMaterials(uniforms),
    [uniforms],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(
    () => () => {
      materials.tissue.dispose();
      materials.depth.dispose();
      materials.distance.dispose();
    },
    [materials],
  );
  return (
    <mesh
      ref={(mesh) => {
        if (mesh) bindSurfaceBatchVertices(mesh, uniforms);
        assign(mesh ? { mesh, uniforms } : null);
      }}
      geometry={geometry}
      material={materials.tissue}
      customDepthMaterial={materials.depth}
      customDistanceMaterial={materials.distance}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}
