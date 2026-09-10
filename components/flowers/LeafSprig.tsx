import { useEffect, useMemo } from "react";
import { MeshPhysicalMaterial } from "three";
import type { FlowerType, Quality } from "@/lib/flowers/types";
import { FOLIAGE } from "@/lib/flowers/foliage";
import { createPetalGeometry, PETAL } from "@/lib/three/geometry";
import { createOrganicTube } from "@/lib/three/organicTube";

export function LeafSprig({
  type,
  quality,
}: {
  type: FlowerType;
  quality: Quality;
}) {
  const profile = FOLIAGE[type];
  const geometry = useMemo(
    () =>
      createPetalGeometry(
        {
          ...PETAL,
          length: profile.length,
          width: profile.width,
          taper: profile.parallel ? 0.58 : 0.72,
          cup: profile.basal ? 0.08 : 0.12,
          curl: profile.basal ? 0.24 : 0.12,
          edge: profile.parallel ? 0.035 : 0.05,
          thickness: type === "orchid" ? 0.013 : 0.005,
          ripple: 0.006,
          marginTeeth: profile.teeth,
          marginDepth: profile.depth,
          lobes: profile.lobes,
          basalLobes: profile.basalLobes,
        },
        73,
        quality,
      ),
    [profile, quality, type],
  );
  const rachis = useMemo(
    () =>
      profile.rachis
        ? createOrganicTube({
            points: [
              [0, 0, 0],
              [0, profile.rachis * 0.5, 0.01],
              [0, profile.rachis, 0.02],
            ],
            radius: 0.008,
            endRadius: 0.004,
            segments: 20,
            color: profile.color,
          })
        : null,
    [profile],
  );
  const material = useMemo(() => {
    const m = new MeshPhysicalMaterial({
      color: profile.color,
      roughness: profile.roughness ?? 0.72,
      vertexColors: true,
      sheen: 0.12,
      sheenRoughness: 0.85,
    });
    m.onBeforeCompile = (s) => {
      s.uniforms.uParallel = { value: profile.parallel ? 1 : 0 };
      s.vertexShader = s.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec2 vLeafUv;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvLeafUv=uv;",
        );
      s.fragmentShader = s.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec2 vLeafUv; uniform float uParallel;",
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
          float midrib=exp(-abs(vLeafUv.x-.5)*150.);
          float branchPhase=mix((vLeafUv.y-abs(vLeafUv.x-.5)*.62)*92.,vLeafUv.x*100.,uParallel);
          float veins=pow(.5+.5*cos(branchPhase),24.);
          diffuseColor.rgb*=.92+midrib*.3+veins*.085;`,
        );
    };
    m.customProgramCacheKey = () => "botanical-leaf-v2";
    return m;
  }, [profile]);
  useEffect(
    () => () => {
      geometry.dispose();
      rachis?.dispose();
      material.dispose();
    },
    [geometry, rachis, material],
  );
  const leaflets = useMemo(() => {
    const count = profile.leaflets ?? 1,
      pairs = (count - 1) / 2;
    return Array.from({ length: count }, (_, i) => {
      if (i === count - 1)
        return { x: 0, y: profile.rachis ?? 0, angle: 0, scale: 1 };
      const pair = Math.floor(i / 2),
        sign = i % 2 ? 1 : -1;
      return {
        x: sign * 0.005,
        y: 0.09 + (pair / Math.max(1, pairs)) * (profile.rachis ?? 0),
        angle: sign * (0.76 + pair * 0.035),
        scale: 0.83 + pair * 0.06,
      };
    });
  }, [profile]);
  return (
    <group>
      {rachis && (
        <mesh geometry={rachis} castShadow>
          <meshStandardMaterial vertexColors roughness={0.82} />
        </mesh>
      )}
      {leaflets.map((leaf, i) => (
        <mesh
          key={i}
          geometry={geometry}
          onUpdate={(mesh) => mesh.updateMorphTargets()}
          material={material}
          position={[leaf.x, leaf.y, leaf.y * 0.035]}
          rotation={[0, 0, leaf.angle]}
          scale={leaf.scale}
          castShadow
          receiveShadow
        />
      ))}
    </group>
  );
}
