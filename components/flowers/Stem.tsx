import { useMemo, useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Group,
  MeshStandardMaterial,
} from "three";
import type { FlowerStructure, Quality } from "@/lib/flowers/types";
import { createPetalGeometry, PETAL } from "@/lib/three/geometry";
import { layeredWind, stemBend } from "@/lib/three/noise";
import { LotusFoliage } from "./lotus/LotusFoliage";

function stemGeometry(length: number, radius: number) {
  const p: number[] = [],
    uv: number[] = [],
    ix: number[] = [];
  for (let j = 0; j <= 28; j++)
    for (let i = 0; i <= 10; i++) {
      const t = j / 28,
        a = (i / 10) * Math.PI * 2,
        r = radius * (1.35 - 0.45 * t);
      p.push(
        Math.cos(a) * r + Math.sin(t * 3.14) * 0.07,
        -length * (1 - t),
        Math.sin(a) * r,
      );
      uv.push(i / 10, t);
      if (j < 28 && i < 10) {
        const k = j * 11 + i;
        ix.push(k, k + 1, k + 12, k, k + 12, k + 11);
      }
    }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(ix);
  g.computeVertexNormals();
  return g;
}
export function Stem({
  structure,
  quality,
  growth,
  time,
  wind,
  leaves,
}: {
  structure: FlowerStructure;
  quality: Quality;
  growth: RefObject<number>;
  time: RefObject<number>;
  wind: number;
  leaves: boolean;
}) {
  const root = useRef<Group>(null);
  const leafRefs = useRef<(Group | null)[]>([]);
  const geometry = useMemo(
    () => stemGeometry(structure.stemLength, structure.stemRadius),
    [structure],
  );
  const originalPositions = useMemo(
    () => Float32Array.from(geometry.getAttribute("position").array),
    [geometry],
  );
  const leaf = useMemo(
    () =>
      createPetalGeometry(
        {
          ...PETAL,
          length: structure.leafShape === "needle" ? 0.55 : 0.82,
          width:
            structure.leafShape === "broad"
              ? 0.68
              : structure.leafShape === "needle"
                ? 0.055
                : 0.37,
          taper: structure.leafShape === "round" ? 0.35 : 0.85,
          cup: 0.18,
          curl: 0.27,
          edge: 0.05,
          thickness: 0.009,
          ripple: structure.leafShape === "serrated" ? 0.014 : 0.003,
        },
        73,
        quality,
      ),
    [structure.leafShape, quality],
  );
  const material = useMemo(() => {
    const m = new MeshStandardMaterial({
      color: "#3d602b",
      roughness: 0.74,
      vertexColors: true,
    });
    m.onBeforeCompile = (s) => {
      s.vertexShader = s.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec2 vLeafUv;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvLeafUv = uv;",
        );
      s.fragmentShader = s.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec2 vLeafUv;",
        )
        .replace(
          "#include <color_fragment>",
          `#include <color_fragment>
        float midrib = exp(-abs(vLeafUv.x-.5)*120.);
        float veins = pow(abs(cos((vLeafUv.y - abs(vLeafUv.x-.5)*.5)*115.)),24.);
        diffuseColor.rgb *= .85 + midrib * .45 + veins * .14;`,
        );
    };
    return m;
  }, []);
  useEffect(
    () => () => {
      geometry.dispose();
      leaf.dispose();
      material.dispose();
    },
    [geometry, leaf, material],
  );
  useFrame(() => {
    if (root.current) {
      root.current.scale.y = 0.03 + 0.97 * growth.current;
      root.current.position.y =
        -(1 - root.current.scale.y) * structure.stemLength;
    }
    const position = geometry.getAttribute("position");
    for (let i = 0; i < position.count; i++) {
      const t =
        (originalPositions[i * 3 + 1] + structure.stemLength) /
        structure.stemLength;
      position.setX(
        i,
        originalPositions[i * 3] + stemBend(time.current, t, wind),
      );
    }
    position.needsUpdate = true;
    leafRefs.current.forEach((group, i) => {
      if (!group) return;
      const unfold = Math.max(
        0.025,
        Math.min(1, (growth.current - 0.25) / 0.75),
      );
      group.rotation.x =
        0.22 +
        unfold * 0.82 +
        layeredWind(time.current - i * 0.2, i * 2) * 0.045 * wind;
      group.scale.setScalar(unfold);
      if (group.parent)
        group.parent.position.x = stemBend(time.current, 0.68 - i * 0.19, wind);
    });
  });
  return (
    <group ref={root}>
      <mesh geometry={geometry} castShadow>
        <meshStandardMaterial color="#405335" roughness={0.88} />
      </mesh>
      {leaves && structure.leafShape === "round" && (
        <LotusFoliage
          quality={quality}
          length={structure.stemLength}
          growth={growth}
          time={time}
          wind={wind}
        />
      )}
      {leaves &&
        structure.leafShape !== "round" &&
        Array.from({ length: structure.leafCount }, (_, i) => (
          <group
            key={i}
            position={[0, -structure.stemLength * (0.32 + i * 0.19), 0]}
            rotation={[0, i * 2.4 + 0.7, 0]}
          >
            <group
              ref={(el) => {
                leafRefs.current[i] = el;
              }}
            >
              <mesh
                geometry={leaf}
                material={material}
                onUpdate={(m) => m.updateMorphTargets()}
                castShadow
                receiveShadow
              />
            </group>
          </group>
        ))}
    </group>
  );
}
