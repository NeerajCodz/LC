import { useEffect, useMemo } from "react";
import { createOrganicTube } from "@/lib/three/organicTube";
import { createPetalGeometry, PETAL } from "@/lib/three/geometry";
import type { FlowerType, Quality } from "@/lib/flowers/types";

export function Calyx({
  type,
  quality,
}: {
  type: FlowerType;
  quality: Quality;
}) {
  const collar = useMemo(
    () =>
      createOrganicTube({
        points: [
          [0, -0.15, 0],
          [0, -0.04, 0],
          [0, 0.025, 0],
        ],
        radius: 0.045,
        endRadius: 0.075,
        color: "#405a32",
        tipColor: "#5d7040",
        segments: 24,
        sides: 24,
      }),
    [],
  );
  const sepal = useMemo(
    () =>
      createPetalGeometry(
        {
          ...PETAL,
          length: 0.27,
          width: 0.11,
          cup: 0.08,
          curl: 0.18,
          edge: 0.02,
          taper: 1.25,
          thickness: 0.006,
        },
        32,
        quality,
      ),
    [quality],
  );
  useEffect(
    () => () => {
      collar.dispose();
      sepal.dispose();
    },
    [collar, sepal],
  );
  const sepals = type === "rose" || type === "hibiscus" || type === "peony";
  return (
    <group>
      <mesh geometry={collar} castShadow>
        <meshStandardMaterial vertexColors roughness={0.83} />
      </mesh>
      {sepals &&
        Array.from({ length: 5 }, (_, i) => (
          <group
            key={i}
            position={[0, -0.045, 0]}
            rotation={[0, (i / 5) * Math.PI * 2, 0]}
          >
            <mesh
              geometry={sepal}
              onUpdate={(mesh) => mesh.updateMorphTargets()}
              rotation={[1.8, 0, 0]}
              castShadow
            >
              <meshStandardMaterial
                color="#4a6237"
                roughness={0.8}
                vertexColors
              />
            </mesh>
          </group>
        ))}
    </group>
  );
}
