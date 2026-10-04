import { useEffect, useMemo, useRef } from "react";
import { Group } from "three";
import { createOrganicTube } from "@/lib/three/organicTube";
import { joinOrgans } from "@/lib/three/floralOrgans";
import { supportedBendWeight, supportedBendSlope } from "@/lib/flowers/wind";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import type { Vec3 } from "@/lib/flowers/types";
import { LeafSprig } from "./LeafSprig";
import type { StemProps } from "./Stem";

export interface StemAnatomy {
  color: string;
  nodes: { t: number; angle: number; scale?: number }[];
  swollen?: boolean;
  winged?: boolean;
  extras?: {
    points: Vec3[];
    radius: number;
    endRadius?: number;
    color: string;
  }[];
}
/** Sealed shoot and all attachments follow one anchored, clamped bend curve. */
export function BotanicalStem({
  anatomy,
  type,
  structure,
  quality,
  growth,
  time,
  wind,
  motion,
  leaves,
}: StemProps & { anatomy: StemAnatomy }) {
  const groups = useRef<(Group | null)[]>([]),
    length = structure.stemLength,
    support = structure.supportHeight ?? 0;
  const geometry = useMemo(() => {
    const g = createOrganicTube({
      points: [
        [0, -length, 0],
        [0.025, -length * 0.55, 0],
        [0, 0, 0],
      ],
      radius: structure.stemRadius * 1.2,
      endRadius: structure.stemRadius,
      color: anatomy.color,
      segments: quality === "low" ? 40 : 80,
      sides: quality === "low" ? 10 : 18,
      grain: 0.05,
    });
    const p = g.getAttribute("position");
    if (anatomy.winged)
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i),
          z = p.getZ(i);
        p.setXYZ(
          i,
          x + Math.sign(x) * 0.018 * Math.exp(-Math.abs(z) * 100),
          p.getY(i),
          z,
        );
      }
    g.computeVertexNormals();
    const parts = [g];
    if (anatomy.swollen)
      for (const n of anatomy.nodes.filter((_, i) => i % 2 === 0))
        parts.push(
          createOrganicTube({
            points: [
              [0, -length + length * n.t - 0.03, 0],
              [0.02, -length + length * n.t, 0],
              [0.02, -length + length * n.t + 0.03, 0],
            ],
            radius: structure.stemRadius * 1.7,
            endRadius: structure.stemRadius * 1.5,
            color: anatomy.color,
            segments: 10,
            sides: 10,
          }),
        );
    for (const extra of anatomy.extras ?? [])
      parts.push(
        createOrganicTube({
          ...extra,
          segments: quality === "low" ? 22 : 44,
          sides: quality === "low" ? 6 : 10,
          grain: 0.06,
        }),
      );
    const stem = joinOrgans(parts);
    return {
      stem,
      positions: Float32Array.from(stem.getAttribute("position").array),
      normals: Float32Array.from(stem.getAttribute("normal").array),
    };
  }, [anatomy, length, quality, structure.stemRadius]);
  useEffect(() => () => geometry.stem.dispose(), [geometry]);
  useActiveFrame(() => {
    const p = geometry.stem.getAttribute("position"),
      n = geometry.stem.getAttribute("normal"),
      g = Math.max(0.03, growth.current);
    for (let i = 0; i < p.count; i++) {
      const k = i * 3,
        t = Math.max(
          0,
          Math.min(1, (geometry.positions[k + 1] + length) / length),
        ),
        w = supportedBendWeight(t, support),
        s = supportedBendSlope(t, support) / length;
      p.setXYZ(
        i,
        geometry.positions[k] + motion.current.x * w,
        -length +
          (geometry.positions[k + 1] + length) * g -
          motion.current.drop * w,
        geometry.positions[k + 2] + motion.current.z * w,
      );
      const nx = geometry.normals[k],
        nz = geometry.normals[k + 2],
        ny =
          (geometry.normals[k + 1] -
            s * (nx * motion.current.x + nz * motion.current.z)) /
          Math.max(0.02, g - motion.current.drop * s),
        inv = 1 / Math.hypot(nx, ny, nz);
      n.setXYZ(i, nx * inv, ny * inv, nz * inv);
    }
    p.needsUpdate = n.needsUpdate = true;
    anatomy.nodes.forEach((node, i) => {
      const group = groups.current[i];
      if (!group) return;
      const w = supportedBendWeight(node.t, support);
      group.position.set(
        0.025 * Math.sin(node.t * Math.PI) + motion.current.x * w,
        -length + length * node.t * g - motion.current.drop * w,
        motion.current.z * w,
      );
      group.rotation.set(
        0.9 + Math.sin(time.current * 1.3 + i) * 0.035 * wind,
        node.angle,
        0.1,
      );
      group.scale.setScalar(
        (node.scale ?? 1) * Math.max(0.03, Math.min(1, (g - 0.15) / 0.85)),
      );
    });
  });
  return (
    <group>
      <mesh geometry={geometry.stem} castShadow receiveShadow>
        <meshStandardMaterial vertexColors roughness={0.83} />
      </mesh>
      {support > 0 && (
        <mesh position={[-0.12, -length * 0.55, 0.015]}>
          <cylinderGeometry args={[0.018, 0.025, length * 0.9, 8]} />
          <meshStandardMaterial color="#8b8167" roughness={0.9} />
        </mesh>
      )}
      {leaves &&
        anatomy.nodes.map((node, i) => (
          <group
            ref={(g) => {
              groups.current[i] = g;
            }}
            key={i}
          >
            <LeafSprig type={type} quality={quality} />
          </group>
        ))}
    </group>
  );
}
