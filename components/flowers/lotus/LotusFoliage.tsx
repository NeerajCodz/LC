import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import { Group } from "three";
import type { Quality } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { layeredWind } from "@/lib/three/noise";
import { createLotusLeaf } from "./lotusLeafGeometry";

export function LotusFoliage({
  quality,
  length,
  growth,
  time,
  wind,
}: {
  quality: Quality;
  length: number;
  growth: RefObject<number>;
  time: RefObject<number>;
  wind: number;
}) {
  const blade = useRef<Group>(null),
    root = useRef<Group>(null);
  const leaf = useMemo(() => createLotusLeaf(quality), [quality]);
  const petiole = useMemo(
    () =>
      createOrganicTube({
        points: [
          [-0.15, -length, -0.1],
          [-0.36, -length * 0.74, -0.2],
          [-0.65, -0.99, -0.3],
          [-0.78, -0.72, -0.32],
        ],
        radius: 0.018,
        endRadius: 0.013,
        color: "#466b4a",
        tipColor: "#5c8060",
        segments: 48,
        sides: 16,
      }),
    [length],
  );
  useEffect(
    () => () => {
      leaf.dispose();
      petiole.dispose();
    },
    [leaf, petiole],
  );
  useFrame(() => {
    const sway = layeredWind(time.current - 0.35, 2.6) * wind;
    if (root.current) root.current.rotation.z = sway * 0.015;
    if (blade.current) {
      const unfold = Math.max(0.015, Math.min(1, (growth.current - 0.2) / 0.8));
      blade.current.scale.set(unfold, 0.25 + 0.75 * unfold, unfold);
      blade.current.rotation.set(
        0.25 + sway * 0.025,
        0,
        -0.16 + (1 - unfold) * 0.8,
      );
    }
  });
  return (
    <group ref={root}>
      <mesh geometry={petiole} castShadow>
        <meshStandardMaterial vertexColors roughness={0.82} />
      </mesh>
      <group ref={blade} position={[-0.78, -0.72, -0.32]}>
        <mesh geometry={leaf} castShadow receiveShadow>
          <meshPhysicalMaterial
            vertexColors
            roughness={0.58}
            sheen={0.25}
            sheenRoughness={0.85}
          />
        </mesh>
      </group>
    </group>
  );
}
