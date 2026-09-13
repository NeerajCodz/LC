import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, MeshPhysicalMaterial, MeshStandardMaterial } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { supportedBendSlope, supportedBendWeight } from "@/lib/flowers/wind";
import { createOrganicTube } from "@/lib/three/organicTube";
import { createPetalGeometry, PETAL } from "@/lib/three/geometry";
import type { StemProps } from "../Stem";
import {
  createPassionLeaf,
  createPassionPetiole,
  createPassionTendril,
} from "./passionflowerGeometry";

const NODES = [0.24, 0.43, 0.62];
const vineX = (t: number) => Math.sin(t * Math.PI * 4) * 0.025;

/** A short climbing shoot secured to a woody support; only its peduncle is free. */
export function PassionVine({
  structure,
  quality,
  growth,
  time,
  wind,
  motion,
  leaves,
}: StemProps) {
  const nodes = useRef<(Group | null)[]>([]),
    leafPivots = useRef<(Group | null)[]>([]),
    blades = useRef<(Mesh | null)[]>([]);
  const length = structure.stemLength;
  const support = structure.supportHeight ?? 0;
  const geometry = useMemo(() => {
    const stem = createOrganicTube({
      points: Array.from({ length: 25 }, (_, i) => {
        const t = i / 24;
        return [vineX(t), -length + t * length, 0];
      }),
      radius: structure.stemRadius,
      endRadius: structure.stemRadius * 0.75,
      color: "#52734e",
      tipColor: "#7d945e",
      segments: quality === "low" ? 36 : 64,
      sides: quality === "low" ? 10 : 20,
      grain: 0.045,
    });
    const position = stem.getAttribute("position");
    // Longitudinal striae on a subtly subangular section, not decorative noise.
    for (let i = 0; i < position.count; i++) {
      const y = position.getY(i),
        t = (y + length) / length;
      const x = position.getX(i) - vineX(t),
        z = position.getZ(i);
      const a = Math.atan2(z, x),
        relief = 1 + 0.055 * Math.cos(a * 5);
      position.setXYZ(i, vineX(t) + x * relief, y, z * relief);
    }
    stem.computeVertexNormals();
    return {
      stem,
      support: createOrganicTube({
        points: [
          [-0.17, -length, 0.045],
          [-0.17, -length * 0.5, 0.045],
          [-0.17, -length * 0.18, 0.045],
        ],
        radius: 0.028,
        endRadius: 0.021,
        color: "#6c6550",
        tipColor: "#827a61",
        grain: 0.16,
        segments: 32,
        sides: 10,
      }),
      leaf: createPassionLeaf(quality),
      petiole: createPassionPetiole(quality),
      lowerTendril: createPassionTendril(quality, 736, vineX(NODES[0])),
      middleTendril: createPassionTendril(quality, 737, vineX(NODES[1])),
      upperTendril: createPassionTendril(quality, 738, vineX(NODES[2])),
      stipule: createPetalGeometry(
        {
          ...PETAL,
          length: 0.15,
          width: 0.15,
          basalLobes: true,
          thickness: 0.006,
          cup: 0.05,
          curl: 0.03,
          ripple: 0.003,
        },
        902,
        quality === "ultra" ? "high" : "low",
      ),
    };
  }, [quality, length, structure.stemRadius]);
  const original = useMemo(
    () => ({
      position: Float32Array.from(geometry.stem.getAttribute("position").array),
      normal: Float32Array.from(geometry.stem.getAttribute("normal").array),
    }),
    [geometry],
  );
  const material = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.72 }),
    [],
  );
  const leafMaterial = useMemo(
    () =>
      new MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.48,
        clearcoat: 0.055,
        clearcoatRoughness: 0.6,
        sheen: 0.08,
      }),
    [],
  );
  useEffect(
    () => () => {
      Object.values(geometry).forEach((g) => g.dispose());
      material.dispose();
      leafMaterial.dispose();
    },
    [geometry, material, leafMaterial],
  );
  useActiveFrame(() => {
    const g = Math.max(0.03, growth.current),
      m = motion.current;
    const position = geometry.stem.getAttribute("position"),
      normal = geometry.stem.getAttribute("normal");
    for (let i = 0; i < position.count; i++) {
      const t = Math.max(
        0,
        Math.min(1, (original.position[i * 3 + 1] + length) / length),
      );
      const weight = supportedBendWeight(t, support),
        slope = supportedBendSlope(t, support) / length;
      position.setXYZ(
        i,
        original.position[i * 3] + m.x * weight,
        -length + (original.position[i * 3 + 1] + length) * g - m.drop * weight,
        original.position[i * 3 + 2] + m.z * weight,
      );
      const nx = original.normal[i * 3],
        nz = original.normal[i * 3 + 2];
      const ny =
        (original.normal[i * 3 + 1] - slope * (m.x * nx + m.z * nz)) /
        Math.max(0.02, g - m.drop * slope);
      const inverse = 1 / Math.hypot(nx, ny, nz);
      normal.setXYZ(i, nx * inverse, ny * inverse, nz * inverse);
    }
    position.needsUpdate = true;
    normal.needsUpdate = true;
    for (let i = 0; i < NODES.length; i++) {
      const node = nodes.current[i],
        leaf = leafPivots.current[i],
        blade = blades.current[i],
        t = NODES[i];
      if (node) {
        node.position.set(vineX(t), -length + t * length * g, 0);
        node.scale.setScalar(Math.max(0.025, Math.min(1, (g - 0.15) / 0.85)));
      }
      const unfold = Math.max(0, Math.min(1, (g - 0.3) / 0.7));
      if (leaf)
        leaf.rotation.x =
          0.22 +
          unfold * 0.72 +
          Math.sin(time.current * 1.5 - i * 1.7) *
            0.026 *
            wind *
            (1 + m.air * 0.2);
      if (blade?.morphTargetInfluences)
        blade.morphTargetInfluences[0] = 1 - unfold;
    }
  });
  return (
    <group>
      <mesh geometry={geometry.support} material={material} castShadow />
      <mesh
        geometry={geometry.stem}
        material={material}
        castShadow
        frustumCulled={false}
      />
      {NODES.map((t, i) => (
        <group
          key={t}
          ref={(g) => {
            nodes.current[i] = g;
          }}
          position={[vineX(t), -length + t * length, 0]}
        >
          <mesh
            geometry={
              [
                geometry.lowerTendril,
                geometry.middleTendril,
                geometry.upperTendril,
              ][i]
            }
            material={material}
            castShadow
          />
          {leaves && (
            <>
              {[-1, 1].map((side) => (
                <mesh
                  key={side}
                  geometry={geometry.stipule}
                  onUpdate={(m) => m.updateMorphTargets()}
                  position={[side * 0.02, -0.035, 0]}
                  rotation={[0.5, side * 0.5, side * 0.7]}
                  castShadow
                >
                  <meshStandardMaterial color="#738750" roughness={0.66} />
                </mesh>
              ))}
              <group rotation={[0, i * 2.4 + 0.7, 0]}>
                <group
                  ref={(g) => {
                    leafPivots.current[i] = g;
                  }}
                  scale={0.83 + i * 0.08}
                >
                  <mesh
                    geometry={geometry.petiole}
                    material={material}
                    castShadow
                  />
                  <mesh
                    ref={(m) => {
                      blades.current[i] = m;
                    }}
                    geometry={geometry.leaf}
                    material={leafMaterial}
                    position={[0, 0.3, 0]}
                    onUpdate={(m) => m.updateMorphTargets()}
                    castShadow
                    receiveShadow
                  />
                </group>
              </group>
            </>
          )}
        </group>
      ))}
    </group>
  );
}
