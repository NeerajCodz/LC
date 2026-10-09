import { useEffect, useMemo, useRef } from "react";
import { Group, MeshStandardMaterial } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { supportedBendSlope, supportedBendWeight } from "@/lib/flowers/wind";
import { createOrganicTube } from "@/lib/three/organicTube";
import type { StemProps } from "../Stem";
import { LeafSprig } from "../LeafSprig";
import { createMorningShoot, morningVinePoint } from "./morningGloryGeometry";

const NODES = [0.22, 0.41, 0.62];
export function MorningVine({
  structure,
  quality,
  growth,
  time,
  wind,
  motion,
  leaves,
}: StemProps) {
  const nodes = useRef<(Group | null)[]>([]),
    blades = useRef<(Group | null)[]>([]);
  const length = structure.stemLength,
    support = structure.supportHeight ?? 0;
  const nodePositions = useMemo(
    () => NODES.map((t) => morningVinePoint(t, length)),
    [length],
  );
  const geometry = useMemo(
    () => ({
      shoot: createMorningShoot(quality, length),
      support: createOrganicTube({
        points: [
          [0, -length, 0],
          [0.008, -length * 0.65, 0],
          [0, -length * 0.25, 0],
        ],
        radius: 0.027,
        endRadius: 0.025,
        color: "#6c6149",
        grain: 0.18,
        segments: 32,
        sides: 10,
      }),
      petiole: createOrganicTube({
        points: [
          [0, 0, 0],
          [0, 0.16, 0.02],
          [0, 0.37, 0.04],
        ],
        radius: 0.012,
        endRadius: 0.007,
        color: "#75834e",
        segments: quality === "overview" || quality === "low" ? 12 : 24,
        sides: 7,
      }),
    }),
    [quality, length],
  );
  const original = useMemo(
    () => ({
      position: Float32Array.from(
        geometry.shoot.getAttribute("position").array,
      ),
      normal: Float32Array.from(geometry.shoot.getAttribute("normal").array),
    }),
    [geometry],
  );
  const material = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.83 }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geometry).forEach((g) => g.dispose());
      material.dispose();
    },
    [geometry, material],
  );
  useActiveFrame(() => {
    const g = Math.max(0.03, growth.current),
      m = motion.current,
      p = geometry.shoot.getAttribute("position"),
      n = geometry.shoot.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      const t = Math.max(
        0,
        Math.min(1, (original.position[i * 3 + 1] + length) / length),
      );
      const w = supportedBendWeight(t, support),
        s = supportedBendSlope(t, support) / length;
      p.setXYZ(
        i,
        original.position[i * 3] + m.x * w,
        -length + (original.position[i * 3 + 1] + length) * g - m.drop * w,
        original.position[i * 3 + 2] + m.z * w,
      );
      const nx = original.normal[i * 3],
        nz = original.normal[i * 3 + 2],
        ny =
          (original.normal[i * 3 + 1] - s * (m.x * nx + m.z * nz)) /
          Math.max(0.02, g - m.drop * s),
        inverse = 1 / Math.hypot(nx, ny, nz);
      n.setXYZ(i, nx * inverse, ny * inverse, nz * inverse);
    }
    p.needsUpdate = n.needsUpdate = true;
    for (let i = 0; i < NODES.length; i++) {
      const t = NODES[i],
        position = nodePositions[i],
        node = nodes.current[i],
        blade = blades.current[i];
      if (node) {
        node.position.set(position[0], -length + t * length * g, position[2]);
        node.scale.setScalar(Math.max(0.025, Math.min(1, (g - 0.14) / 0.86)));
      }
      if (blade)
        blade.rotation.x =
          0.18 +
          Math.min(1, Math.max(0, (g - 0.25) / 0.75)) * 1.02 +
          Math.sin(time.current * 1.65 - i * 2.1) * 0.032 * wind;
    }
  });
  return (
    <group>
      <mesh geometry={geometry.support} material={material} castShadow />
      <mesh
        geometry={geometry.shoot}
        material={material}
        castShadow
        frustumCulled={false}
      />
      {leaves &&
        NODES.map((t, i) => (
          <group
            key={t}
            ref={(g) => {
              nodes.current[i] = g;
            }}
            position={morningVinePoint(t, length)}
            rotation={[0, i * 2.4 + 0.3, 0]}
          >
            <group
              ref={(g) => {
                blades.current[i] = g;
              }}
              scale={0.84 + i * 0.07}
            >
              <mesh
                geometry={geometry.petiole}
                material={material}
                castShadow
              />
              <group position={[0, 0.37, 0.04]}>
                <LeafSprig type="morning-glory" quality={quality} />
              </group>
            </group>
          </group>
        ))}
    </group>
  );
}
