import { useEffect, useMemo } from "react";
import {
  MeshDepthMaterial,
  MeshDistanceMaterial,
  RGBADepthPacking,
  type Mesh,
} from "three";
import type { FlowerType } from "@/lib/flowers/types";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
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

/** Distant shells share submissions; selected contact meshes remain individual. */
export function OverviewSurfaces({
  group,
  type,
  color,
  assign,
}: {
  group: SurfaceBatchGroup;
  type: FlowerType;
  color?: string;
  assign: (draw: OverviewDraw | null) => void;
}) {
  const geometry = useMemo(() => createSurfaceBatch(group.entries), [group]);
  const uniforms = useMemo<SurfaceBatchUniforms>(
    () => ({ uBatchBloom: { value: 1 }, uBatchPressure: { value: 0 } }),
    [],
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
      ref={(mesh) => assign(mesh ? { mesh, group, uniforms } : null)}
      geometry={geometry}
      material={materials.tissue}
      customDepthMaterial={materials.depth}
      customDistanceMaterial={materials.distance}
      castShadow
      receiveShadow
    />
  );
}
