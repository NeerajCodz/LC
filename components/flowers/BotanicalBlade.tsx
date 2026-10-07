import { useEffect, useMemo } from "react";
import type { BufferGeometry } from "three";
import type { FlowerType, Quality, Vec3 } from "@/lib/flowers/types";
import {
  createBotanicalBladeMaterial,
  type BladePigment,
} from "@/lib/three/botanicalBladeMaterial";
export type { BladePigment } from "@/lib/three/botanicalBladeMaterial";
export interface BladePose {
  position: Vec3;
  rotation: Vec3;
  scale: number;
}
const SINGLE_BLADE: BladePose[] = [
  { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1 },
];
/** Geometry and pigment are supplied by each species, with shared retention and cleanup. */
export function BotanicalBlade({
  type,
  quality,
  create,
  pigment,
  poses = SINGLE_BLADE,
}: {
  type: FlowerType;
  quality: Quality;
  create: (q: Quality) => BufferGeometry;
  pigment: BladePigment;
  poses?: BladePose[];
}) {
  const geometry = useMemo(() => create(quality), [create, quality]);
  const material = useMemo(
    () => createBotanicalBladeMaterial(type, pigment),
    [type, pigment],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group dispose={null}>
      {poses.map((pose, i) => (
        <mesh
          key={i}
          position={pose.position}
          rotation={pose.rotation}
          scale={pose.scale}
          geometry={geometry}
          material={material}
          onUpdate={(m) => m.updateMorphTargets()}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
