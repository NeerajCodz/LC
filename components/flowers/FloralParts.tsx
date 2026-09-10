import { useEffect, useMemo, useRef, type RefObject } from "react";
import { Group, Mesh, BufferGeometry } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import type { Quality, Vec3, PetalProfile } from "@/lib/flowers/types";
import {
  createFloralSurface,
  type FloralSurface,
} from "@/lib/three/floralSurfaces";
import { createPetalGeometry } from "@/lib/three/geometry";
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
  const material = useMemo(() => {
    const material = createPetalMaterial(color, roughness, 0.55);
    material.clearcoat = kind === "anthurium" ? 0.16 : 0.025;
    material.clearcoatRoughness = kind === "anthurium" ? 0.36 : 0.65;
    return material;
  }, [color, roughness, kind]);
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

/** Independently posed tepals for bilateral and sequential inflorescences. */
export function BladePart({
  profile,
  color,
  quality,
  bloom,
  time,
  wind,
  position,
  rotation,
  delay = 0,
}: FlowerOrgansProps & {
  profile: PetalProfile;
  color: string;
  position: Vec3;
  rotation: Vec3;
  delay?: number;
}) {
  const geometry = useMemo(
    () => createPetalGeometry(profile, Math.round(delay * 1000) + 173, quality),
    [profile, delay, quality],
  );
  const material = useMemo(
    () => createPetalMaterial(color, 0.55, 0.45),
    [color],
  );
  const mesh = useRef<Mesh>(null),
    group = useRef<Group>(null);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useActiveFrame(() => {
    const open = petalOpenness(bloom.current, delay, delay * 10);
    if (mesh.current?.morphTargetInfluences)
      mesh.current.morphTargetInfluences[0] = 1 - open;
    if (group.current) {
      group.current.scale.set(
        0.35 + 0.65 * open,
        0.4 + 0.6 * open,
        0.45 + 0.55 * open,
      );
      group.current.rotation.z =
        rotation[2] * open +
        (1 - open) * (-Math.PI / 2) +
        Math.sin(time.current + delay * 8) * 0.01 * wind * open;
    }
  });
  return (
    <group ref={group} position={position} rotation={rotation}>
      <mesh
        ref={mesh}
        geometry={geometry}
        material={material}
        onUpdate={(m) => m.updateMorphTargets()}
        castShadow
        receiveShadow
      />
    </group>
  );
}
