import { useMemo, useEffect, useRef, type RefObject } from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import { Color, Group, InstancedMesh, Object3D } from "three";
import { GOLDEN_ANGLE, seededRandom } from "@/lib/three/noise";
import type { FlowerStructure, FlowerType, Quality } from "@/lib/flowers/types";
import { LotusHeart } from "./lotus/LotusHeart";
import { StamenHeart } from "./StamenHeart";

export function FlowerCore({
  type,
  structure,
  bloom,
  quality,
}: {
  type: FlowerType;
  structure: FlowerStructure;
  bloom: RefObject<number>;
  quality: Quality;
}) {
  if (type === "lily" || type === "tulip" || type === "hibiscus")
    return <StamenHeart type={type} quality={quality} bloom={bloom} />;
  if (structure.center === "pod")
    return (
      <LotusHeart
        bloom={bloom}
        radius={structure.centerRadius}
        height={structure.centerHeight}
        quality={quality}
      />
    );
  return <StandardFlowerCore structure={structure} bloom={bloom} />;
}

function StandardFlowerCore({
  structure,
  bloom,
}: {
  structure: FlowerStructure;
  bloom: RefObject<number>;
}) {
  const group = useRef<Group>(null);
  const mesh = useRef<InstancedMesh>(null);
  const filaments = useRef<InstancedMesh>(null);
  const {
    center,
    centerRadius: r,
    centerHeight: h,
    stamenLength = 0.46,
    stamenCount,
    antherColor = "#e8b951",
  } = structure;
  const count =
    center === "seeds"
      ? 610
      : center === "florets"
        ? 230
        : center === "column"
          ? 65
          : center === "stamens"
            ? (stamenCount ?? (r > 0.23 ? 6 : 27))
            : 0;
  const stamens = center === "stamens" || center === "column";
  const data = useMemo(() => {
    const random = seededRandom(825);
    const dummy = new Object3D();
    return Array.from({ length: count }, (_, i) => {
      const radius = Math.sqrt((i + 0.5) / count) * r,
        a = i * GOLDEN_ANGLE;
      const y =
        center === "column"
          ? h + (i / count) * 0.48
          : h +
            (stamens
              ? stamenLength * (0.3 + random() * 0.7)
              : Math.sqrt(1 - (radius * radius) / (r * r)) * r * 0.31);
      const x = Math.cos(a) * radius,
        z = Math.sin(a) * radius;
      dummy.position.set(x, y, z);
      dummy.rotation.set(stamens ? 0.25 : radius * 0.5, a, 0);
      const size = stamens
        ? Math.min(0.032, stamenLength * 0.12)
        : (r / Math.sqrt(count)) * 0.83;
      dummy.scale.set(
        size,
        size * (stamens ? 1.8 : 0.85 + random() * 0.5),
        size * 0.7,
      );
      dummy.updateMatrix();
      return { matrix: dummy.matrix.clone(), x, y, z, shade: random() };
    });
  }, [count, r, h, stamens, center, stamenLength]);
  useEffect(() => {
    const dummy = new Object3D(),
      tint = new Color();
    data.forEach((d, i) => {
      mesh.current?.setMatrixAt(i, d.matrix);
      mesh.current?.setColorAt(
        i,
        tint
          .set(center === "seeds" ? "#32201a" : antherColor)
          .multiplyScalar(0.6 + d.shade * 0.6),
      );
      dummy.position.set(d.x * 0.5, d.y * 0.5, d.z * 0.5);
      dummy.rotation.set(Math.atan2(d.z, d.y), 0, -Math.atan2(d.x, d.y));
      dummy.scale.set(
        Math.min(0.008, stamenLength * 0.026),
        Math.sqrt(d.x * d.x + d.y * d.y + d.z * d.z),
        Math.min(0.008, stamenLength * 0.026),
      );
      dummy.updateMatrix();
      filaments.current?.setMatrixAt(i, dummy.matrix);
    });
    if (mesh.current) {
      mesh.current.instanceMatrix.needsUpdate = true;
      if (mesh.current.instanceColor)
        mesh.current.instanceColor.needsUpdate = true;
    }
    if (filaments.current) filaments.current.instanceMatrix.needsUpdate = true;
  }, [data, center, antherColor, stamenLength]);
  // Keep instance bounds valid after initialization without allocating per frame.
  useFrame(() => {
    if (mesh.current && !mesh.current.boundingSphere)
      mesh.current.computeBoundingSphere();
    if (group.current)
      group.current.scale.set(
        0.13 + 0.87 * bloom.current,
        0.2 + 0.8 * bloom.current,
        0.13 + 0.87 * bloom.current,
      );
  });
  if (!count) return null;
  return (
    <group ref={group}>
      {(center === "seeds" || center === "florets") && (
        <mesh
          position={[0, h - 0.025, 0]}
          scale={[r, 0.11, r]}
          castShadow
          receiveShadow
        >
          <sphereGeometry args={[1, 40, 20]} />
          <meshStandardMaterial
            color={center === "seeds" ? "#291d12" : "#b78720"}
            roughness={0.92}
          />
        </mesh>
      )}
      {center === "column" && (
        <mesh position={[0, h * 0.5 + 0.15, 0]}>
          <cylinderGeometry args={[0.025, 0.044, h + 0.3, 12]} />
          <meshStandardMaterial color="#f0b5a2" roughness={0.67} />
        </mesh>
      )}
      <instancedMesh
        ref={mesh}
        args={[undefined, undefined, count]}
        castShadow
        frustumCulled={false}
      >
        <sphereGeometry args={[1, 20, 14]} />
        <meshStandardMaterial roughness={0.86} />
      </instancedMesh>
      {stamens && (
        <instancedMesh ref={filaments} args={[undefined, undefined, count]}>
          <cylinderGeometry args={[0.65, 1, 1, 12, 3]} />
          <meshStandardMaterial color="#e4c8ad" roughness={0.7} />
        </instancedMesh>
      )}
    </group>
  );
}
