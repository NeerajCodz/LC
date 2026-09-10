import { useEffect, useMemo, useRef, type RefObject } from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import { Group } from "three";
import type { Quality } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { layeredWind } from "@/lib/three/noise";
import { createLotusLeaf } from "./lotusLeafGeometry";
import { bendWeight, bendSlope } from "@/lib/flowers/wind";

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
  const blade = useRef<Group>(null);
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
        segments: quality === "low" ? 24 : 48,
        sides: quality === "low" ? 8 : 16,
      }),
    [length, quality],
  );
  const original = useMemo(
    () => Float32Array.from(petiole.getAttribute("position").array),
    [petiole],
  );
  const originalNormals = useMemo(
    () => Float32Array.from(petiole.getAttribute("normal").array),
    [petiole],
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
    const g = Math.max(0.03, growth.current);
    const tip = sway * 0.085;
    const positions = petiole.getAttribute("position"),
      normals = petiole.getAttribute("normal");
    for (let i = 0; i < positions.count; i++) {
      const t = Math.max(
        0,
        Math.min(1, (original[i * 3 + 1] + length) / (length - 0.72)),
      );
      const weight = bendWeight(t),
        slope = bendSlope(t) / (length - 0.72);
      positions.setXYZ(
        i,
        original[i * 3] + tip * weight,
        -length + (original[i * 3 + 1] + length) * g,
        original[i * 3 + 2],
      );
      const nx = originalNormals[i * 3],
        nz = originalNormals[i * 3 + 2];
      const ny = (originalNormals[i * 3 + 1] - tip * slope * nx) / g;
      const inverse = 1 / Math.hypot(nx, ny, nz);
      normals.setXYZ(i, nx * inverse, ny * inverse, nz * inverse);
    }
    positions.needsUpdate = normals.needsUpdate = true;
    if (blade.current) {
      blade.current.position.set(
        -0.78 + tip,
        -length + (length - 0.72) * g,
        -0.32,
      );
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
    <group>
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
