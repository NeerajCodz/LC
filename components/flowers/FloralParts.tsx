import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Group, Mesh, BufferGeometry } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import {
  createFloralSurface,
  type FloralSurface,
} from "@/lib/three/floralSurfaces";
import { createPetalMaterial } from "@/lib/three/materials";
import { createOrganicTube } from "@/lib/three/organicTube";
import { petalOpenness } from "@/lib/three/easing";
export interface FlowerOrgansProps {
  bloom: RefObject<number>;
  time: RefObject<number>;
  wind: number;
  quality: Quality;
  color?: string;
}
export function FloralSurfacePart({
  kind,
  color,
  quality,
  bloom,
  time,
  wind = 0,
  delay = 0,
  rotation = [0, 0, 0],
  position = [0, 0, 0],
  scale = 1,
  roughness = 0.58,
}: FlowerOrgansProps & {
  kind: FloralSurface;
  color: string;
  delay?: number;
  rotation?: Vec3;
  position?: Vec3;
  scale?: number;
  roughness?: number;
}) {
  const mesh = useRef<Mesh>(null),
    pivot = useRef<Group>(null);
  const geometry = useMemo(
    () => createFloralSurface(kind, quality),
    [kind, quality],
  );
  const material = useMemo(
    () => createPetalMaterial(color, roughness, 0.55),
    [color, roughness],
  );
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useActiveFrame(() => {
    const open = petalOpenness(bloom.current, delay, delay * 17);
    if (mesh.current?.morphTargetInfluences)
      mesh.current.morphTargetInfluences[0] = 1 - open;
    if (pivot.current)
      pivot.current.rotation.z =
        rotation[2] +
        Math.sin(time.current * 1.4 + delay * 20) * 0.012 * wind * open;
  });
  return (
    <group ref={pivot} position={position} rotation={rotation} scale={scale}>
      <mesh
        ref={mesh}
        geometry={geometry}
        onUpdate={(object) => object.updateMorphTargets()}
        material={material}
        castShadow
        receiveShadow
      />
    </group>
  );
}
export function OrganicPart({
  points,
  radius,
  color,
  endRadius = radius * 0.7,
  quality,
  flatten = 1,
}: {
  points: Vec3[];
  radius: number;
  color: string;
  endRadius?: number;
  quality: Quality;
  flatten?: number;
}) {
  const geometry = useMemo(
    () =>
      createOrganicTube({
        points,
        radius,
        endRadius,
        color,
        tipColor: color,
        segments: quality === "low" ? 14 : 32,
        sides: quality === "low" ? 8 : 16,
        flatten,
        grain: 0.015,
      }),
    [points, radius, endRadius, color, quality, flatten],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} castShadow receiveShadow>
      <meshStandardMaterial vertexColors roughness={0.65} />
    </mesh>
  );
}
export function OrganAssembly({
  geometry,
  bloom,
  roughness = 0.65,
}: {
  geometry: BufferGeometry;
  bloom: RefObject<number>;
  roughness?: number;
}) {
  const ref = useRef<Group>(null);
  useEffect(() => () => geometry.dispose(), [geometry]);
  useActiveFrame(() => {
    if (ref.current) {
      const open = bloom.current;
      ref.current.scale.set(
        0.16 + 0.84 * open,
        0.25 + 0.75 * open,
        0.16 + 0.84 * open,
      );
    }
  });
  return (
    <group ref={ref}>
      <mesh geometry={geometry} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={roughness} />
      </mesh>
    </group>
  );
}
