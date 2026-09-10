import { useEffect, useMemo, useRef } from "react";
import { Mesh } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { createPetalGeometry, PETAL } from "@/lib/three/geometry";
import type { FlowerOrgansProps } from "../FloralParts";
/** Sepals part and retract as the crumpled corolla opens; reversal restores the bud. */
export function PoppySepals({
  quality,
  bloom,
}: Pick<FlowerOrgansProps, "quality" | "bloom">) {
  const refs = useRef<(Mesh | null)[]>([]);
  const geometry = useMemo(
    () =>
      createPetalGeometry(
        {
          ...PETAL,
          length: 1.32,
          width: 1.5,
          foldWrap: 1.85,
          cup: 0.1,
          curl: 0.12,
          thickness: 0.009,
        },
        741,
        quality,
      ),
    [quality],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useActiveFrame(() => {
    const b = bloom.current,
      t = Math.min(1, Math.max(0, (b - 0.06) / 0.32)),
      retract = t * t * (3 - 2 * t);
    for (const mesh of refs.current) {
      if (!mesh) continue;
      mesh.rotation.x = -0.12 + b * 2;
      mesh.scale.setScalar(1.055 * (1 - retract) + 0.0001);
      if (mesh.morphTargetInfluences)
        mesh.morphTargetInfluences[0] = 1 - Math.min(1, b * 3);
      mesh.visible = b < 0.4;
    }
  });
  return (
    <>
      {[0, 1].map((i) => (
        <group key={i} rotation={[0, i * Math.PI, 0]}>
          <mesh
            ref={(m) => {
              refs.current[i] = m;
            }}
            geometry={geometry}
            onUpdate={(m) => m.updateMorphTargets()}
            castShadow
          >
            <meshPhysicalMaterial
              color="#657743"
              vertexColors
              roughness={0.9}
            />
          </mesh>
        </group>
      ))}
    </>
  );
}
