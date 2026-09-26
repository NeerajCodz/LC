import { useEffect, useMemo, useRef } from "react";
import { Group, MeshStandardMaterial } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { bendSlope, bendWeight } from "@/lib/flowers/wind";
import type { StemProps } from "../Stem";
import { LeafSprig } from "../LeafSprig";
import { createFuchsiaWood, fuchsiaStemPoint } from "./fuchsiaGeometry";

const NODES = [0.46, 0.7, 0.91];
export function FuchsiaStem({
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
  const length = structure.stemLength;
  const geometry = useMemo(
    () => createFuchsiaWood(quality, length),
    [quality, length],
  );
  const original = useMemo(
    () => ({
      position: Float32Array.from(geometry.getAttribute("position").array),
      normal: Float32Array.from(geometry.getAttribute("normal").array),
    }),
    [geometry],
  );
  const positions = useMemo(
    () => NODES.map((t) => fuchsiaStemPoint(t, length)),
    [length],
  );
  const material = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.86 }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  useActiveFrame(() => {
    const g = Math.max(0.03, growth.current),
      m = motion.current;
    const p = geometry.getAttribute("position"),
      n = geometry.getAttribute("normal");
    for (let i = 0; i < p.count; i++) {
      const t = Math.max(
          0,
          Math.min(1, (original.position[i * 3 + 1] + length) / length),
        ),
        w = bendWeight(t),
        s = bendSlope(t) / length;
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
      const node = nodes.current[i],
        t = NODES[i],
        p = positions[i],
        w = bendWeight(t);
      if (node) {
        node.position.set(
          p[0] + m.x * w,
          -length + t * length * g - m.drop * w,
          p[2] + m.z * w,
        );
        node.rotation.set(
          Math.atan2(m.z * bendSlope(t), length * g),
          i * 1.55,
          -Math.atan2(m.x * bendSlope(t), length * g),
        );
      }
      for (let side = 0; side < 2; side++) {
        const blade = blades.current[i * 2 + side];
        if (blade) {
          const unfold = Math.max(0.025, Math.min(1, (g - 0.2) / 0.8));
          blade.scale.setScalar(unfold * (0.94 - i * 0.13));
          blade.rotation.x =
            0.13 +
            unfold * 1.0 +
            Math.sin(time.current * 1.55 - i * 1.7 + side * 0.3) * 0.032 * wind;
        }
      }
    }
  });
  return (
    <group>
      <mesh
        geometry={geometry}
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
            position={positions[i]}
          >
            {[0, 1].map((side) => (
              <group key={side} rotation={[0, side * Math.PI, 0]}>
                <group
                  ref={(g) => {
                    blades.current[i * 2 + side] = g;
                  }}
                >
                  <LeafSprig type="fuchsia" quality={quality} />
                </group>
              </group>
            ))}
          </group>
        ))}
    </group>
  );
}
