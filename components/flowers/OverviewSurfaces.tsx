import { useEffect, useMemo } from "react";
import {
  MeshDepthMaterial,
  MeshDistanceMaterial,
  RGBADepthPacking,
  type Mesh,
} from "three";
import type { FlowerType, Quality } from "@/lib/flowers/types";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
import type { SpecimenModel } from "@/lib/three/specimenModel";
import {
  bindSurfaceBatchVertices,
  type SurfaceBatchPoses,
} from "@/lib/three/surfaceBatchPose";
import {
  bindSurfaceBatch,
  createSurfaceBatch,
  type SurfaceBatchGroup,
  type SurfaceBatchUniforms,
} from "@/lib/three/surfaceBatch";

export interface OverviewDraw {
  mesh: Mesh;
  group: SurfaceBatchGroup;
  uniforms: SurfaceBatchUniforms;
}

/** Ambient shells share submissions at their requested quality; contact meshes stay individual. */
export function OverviewSurfaces({
  group,
  type,
  color,
  assign,
  clusters,
  poses,
  quality = "overview",
}: {
  group: SurfaceBatchGroup;
  type: FlowerType;
  color?: string;
  assign: (draw: OverviewDraw | null) => void;
  clusters: SpecimenModel["clusters"];
  poses: SurfaceBatchPoses;
  quality?: Quality;
}) {
  const geometry = useMemo(
    () => createSurfaceBatch(group.entries, clusters, quality),
    [group, clusters, quality],
  );
  const uniforms = useMemo<SurfaceBatchUniforms>(
    () => ({
      uBatchBloom: { value: 1 },
      uBatchPressure: { value: 0 },
      uBatchPoses: { value: poses.texture },
      uBatchPoseRows: { value: clusters.length },
      uBatchHinge: {
        value: group.role === "wing" || group.role === "keel" ? 1 : 0,
      },
    }),
    [poses, clusters, group.role],
  );
  const materials = useMemo(() => {
    const tissue = createSpecimenMaterial(
      type,
      group.role,
      color,
      group.tissue,
    );
    const depth = new MeshDepthMaterial({ depthPacking: RGBADepthPacking });
    const distance = new MeshDistanceMaterial();
    for (const m of [tissue, depth, distance])
      bindSurfaceBatch(m, uniforms, group.pressure);
    return { tissue, depth, distance };
  }, [type, group, color, uniforms]);
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
        assign(mesh ? { mesh, group, uniforms } : null);
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
