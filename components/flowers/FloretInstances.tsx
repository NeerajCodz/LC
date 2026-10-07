import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  type BufferGeometry,
  type Material,
} from "three";
import type { SpecimenInstanceGroup } from "@/lib/three/specimenModel";
import {
  specimenInstanceGeometry,
  updateFloretInstances,
} from "@/lib/three/floretInstances";
import { createSpecimenMaterial } from "@/lib/three/specimenMaterials";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import type { FlowerType } from "@/lib/flowers/types";
import type { FlowerOrgansProps } from "./FloralParts";

function Instances({
  geometry,
  material,
  group,
  bloom,
  time,
  wind,
  reducedMotion = false,
}: FlowerOrgansProps & {
  geometry: BufferGeometry;
  material: Material;
  group: SpecimenInstanceGroup;
}) {
  const ref = useRef<InstancedMesh>(null);
  const target = useMemo(
    () => new Mesh(geometry, material),
    [geometry, material],
  );
  const dummy = useMemo(() => new Object3D(), []);
  useLayoutEffect(() => {
    const mesh = ref.current!;
    updateFloretInstances(
      mesh,
      target,
      group.poses,
      bloom.current,
      time.current,
      wind,
      reducedMotion,
      dummy,
    );
    return () => {
      mesh.morphTexture?.dispose();
      mesh.morphTexture = null;
      mesh.dispose();
    };
    // Initialization precedes the first draw; changing controls never recreates textures.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geometry, material, group, target, dummy]);
  useActiveFrame(() => {
    if (ref.current)
      updateFloretInstances(
        ref.current,
        target,
        group.poses,
        bloom.current,
        time.current,
        wind,
        reducedMotion,
        dummy,
      );
  });
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, group.poses.length]}
      castShadow
      receiveShadow
      frustumCulled={false}
      dispose={null}
    />
  );
}
export function FloretInstances({
  group,
  type,
  ...props
}: FlowerOrgansProps & { group: SpecimenInstanceGroup; type: FlowerType }) {
  const geometry = useMemo(
    () => specimenInstanceGeometry(group, props.quality),
    [group, props.quality],
  );
  const materials = useMemo(
    () => ({
      surfaces: group.surfaces.map((s) =>
        createSpecimenMaterial(type, s.role, props.color, s.tissue),
      ),
      organs: new MeshStandardMaterial({ vertexColors: true, roughness: 0.65 }),
    }),
    [group, type, props.color],
  );
  useEffect(
    () => () => {
      [...geometry.surfaces, ...geometry.organs].forEach((g) => g.dispose());
    },
    [geometry],
  );
  useEffect(
    () => () => {
      materials.surfaces.forEach((m) => m.dispose());
      materials.organs.dispose();
    },
    [materials],
  );
  return (
    <group>
      {geometry.surfaces.map((g, i) => (
        <Instances
          key={`surface-${i}`}
          {...props}
          group={group}
          geometry={g}
          material={materials.surfaces[i]}
        />
      ))}
      {geometry.organs.map((g, i) => (
        <Instances
          key={`organ-${i}`}
          {...props}
          group={group}
          geometry={g}
          material={materials.organs}
        />
      ))}
    </group>
  );
}
