import { useMemo, useEffect, useRef, type RefObject } from "react";
import { useFrame } from "@react-three/fiber";
import { BufferGeometry, Float32BufferAttribute, Group } from "three";
import type { FlowerStructure, FlowerType, Quality } from "@/lib/flowers/types";
import { FOLIAGE } from "@/lib/flowers/foliage";
import { LeafSprig } from "./LeafSprig";
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
  type,
  structure,
  quality,
  growth,
  time,
  wind,
  leaves,
}: {
  type: FlowerType;
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
  useEffect(() => () => geometry.dispose(), [geometry]);
  const basal = FOLIAGE[type].basal;
  const opposite = FOLIAGE[type].opposite;
  const nodeIndex = (i: number) => (opposite ? Math.floor(i / 2) : i);
  const leafHeight = (i: number) =>
    opposite
      ? 0.35 + i * 0.13
      : basal
        ? 0.8 + i * 0.08
        : type === "sunflower"
          ? 0.48 + i * 0.16
          : 0.32 + i * 0.19;
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
        unfold * (basal ? 0.36 : 0.82) +
        layeredWind(time.current - i * 0.2, i * 2) * 0.045 * wind;
      group.scale.setScalar(unfold);
      if (group.parent)
        group.parent.position.x = stemBend(
          time.current,
          1 - leafHeight(nodeIndex(i)),
          wind,
        );
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
        Array.from(
          { length: structure.leafCount * (opposite ? 2 : 1) },
          (_, i) => (
            <group
              key={i}
              position={[
                0,
                -structure.stemLength * leafHeight(nodeIndex(i)),
                0,
              ]}
              rotation={[
                0,
                opposite
                  ? nodeIndex(i) * 1.5 + (i % 2) * Math.PI
                  : i * 2.4 + 0.7,
                0,
              ]}
            >
              <group
                ref={(el) => {
                  leafRefs.current[i] = el;
                }}
              >
                <LeafSprig type={type} quality={quality} />
              </group>
            </group>
          ),
        )}
    </group>
  );
}
