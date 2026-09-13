import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  Group,
  InstancedMesh,
  Mesh,
  Object3D,
  MeshPhysicalMaterial,
} from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { petalOpenness } from "@/lib/three/easing";
import { seededRandom } from "@/lib/three/noise";
import type { FlowerOrgansProps } from "../FloralParts";
import { createPassionOrganMaterial } from "./passionflowerMaterial";
import {
  createCoronaFilament,
  createPassionAxis,
  createPassionStamen,
  createPassionStyle,
  PASSION_CORONA,
} from "./passionflowerGeometry";

function CoronaRing({
  ring,
  bloom,
  quality,
  time,
  wind,
  pulse,
  interaction,
}: FlowerOrgansProps & { ring: number }) {
  const ref = useRef<InstancedMesh>(null);
  const spec = PASSION_CORONA[ring];
  const geometry = useMemo(
    () => createCoronaFilament(quality, ring),
    [quality, ring],
  );
  const material = useMemo(
    () =>
      new MeshPhysicalMaterial({
        vertexColors: true,
        roughness: 0.62,
        sheen: 0.15,
        sheenColor: "#c7c6da",
        sheenRoughness: 0.8,
      }),
    [],
  );
  const morph = useRef<Mesh | null>(null);
  useLayoutEffect(() => {
    const instance = ref.current;
    const target = new Mesh(geometry, material);
    morph.current = target;
    if (instance && target.morphTargetInfluences) {
      target.morphTargetInfluences[0] = 1;
      for (let i = 0; i < spec.count; i++) instance.setMorphAt(i, target);
    }
    return () => {
      instance?.morphTexture?.dispose();
      morph.current = null;
    };
  }, [geometry, material, spec]);
  const dummy = useMemo(() => new Object3D(), []);
  const variations = useMemo(() => {
    const random = seededRandom(615 + ring * 29);
    return Array.from({ length: spec.count }, (_, i) => ({
      angle:
        (i / spec.count) * Math.PI * 2 +
        ring * 0.031 +
        (random() - 0.5) * 0.015,
      length: 0.94 + random() * 0.12,
      phase: random() * 6.28,
    }));
  }, [ring, spec]);
  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );
  useActiveFrame(() => {
    const target = morph.current;
    if (!ref.current || !target?.morphTargetInfluences) return;
    for (let i = 0; i < variations.length; i++) {
      const v = variations[i];
      const open = petalOpenness(bloom.current, 0.14 + ring * 0.025, v.phase);
      const radius = 0.075 + (spec.radius - 0.075) * open;
      dummy.position.set(
        Math.sin(v.angle) * radius,
        spec.height + (1 - open) * 0.05,
        Math.cos(v.angle) * radius,
      );
      dummy.rotation.set(0, v.angle, 0);
      dummy.rotateX(
        (Math.sin(time.current * 1.6 + v.phase) * 0.018 * wind +
          (pulse?.current ?? 0) * 0.045 +
          Math.max(0, Math.cos(v.angle - (interaction?.current.angle ?? 0))) *
            (interaction?.current.proximity ?? 0) *
            0.025) *
          open,
      );
      dummy.scale.set(1, v.length, v.length);
      dummy.updateMatrix();
      ref.current.setMatrixAt(i, dummy.matrix);
      target.morphTargetInfluences[0] = 1 - open;
      ref.current.setMorphAt(i, target);
    }
    ref.current.instanceMatrix.needsUpdate = true;
    if (ref.current.morphTexture) ref.current.morphTexture.needsUpdate = true;
  });
  return (
    <instancedMesh
      ref={ref}
      args={[geometry, material, spec.count]}
      castShadow
      receiveShadow
      frustumCulled={false}
    />
  );
}

function ReproductiveAxis({ bloom, quality, time, wind }: FlowerOrgansProps) {
  const group = useRef<Group>(null),
    stamens = useRef<(Group | null)[]>([]),
    styles = useRef<(Group | null)[]>([]);
  const geometry = useMemo(
    () => ({
      axis: createPassionAxis(quality),
      stamen: createPassionStamen(quality),
      style: createPassionStyle(quality),
    }),
    [quality],
  );
  const material = useMemo(() => createPassionOrganMaterial(), []);
  useEffect(
    () => () => {
      Object.values(geometry).forEach((g) => g.dispose());
      material.dispose();
    },
    [geometry, material],
  );
  useActiveFrame(() => {
    const open = petalOpenness(bloom.current, 0.09, 0.2);
    if (group.current)
      group.current.scale.set(
        0.65 + open * 0.35,
        0.65 + open * 0.35,
        0.65 + open * 0.35,
      );
    stamens.current.forEach((g, i) => {
      if (g)
        g.rotation.x =
          -(1 - open) * 1.2 +
          Math.sin(time.current * 1.3 + i) * 0.009 * wind * open;
    });
    styles.current.forEach((g, i) => {
      if (g)
        g.rotation.x =
          -(1 - open) * 0.9 +
          Math.sin(time.current * 1.1 + i * 3) * 0.006 * wind * open;
    });
  });
  return (
    <group ref={group}>
      <mesh
        geometry={geometry.axis}
        material={material}
        castShadow
        receiveShadow
      />
      {Array.from({ length: 5 }, (_, i) => (
        <group
          key={i}
          rotation={[0, (i * Math.PI * 2) / 5 + 0.2, 0]}
          position={[0, 0.48, 0]}
        >
          <group
            ref={(g) => {
              stamens.current[i] = g;
            }}
          >
            <mesh
              geometry={geometry.stamen}
              material={material}
              castShadow
              receiveShadow
            />
          </group>
        </group>
      ))}
      {Array.from({ length: 3 }, (_, i) => (
        <group
          key={i}
          rotation={[0, (i * Math.PI * 2) / 3 + 0.42, 0]}
          position={[0, 0.63, 0]}
        >
          <group
            ref={(g) => {
              styles.current[i] = g;
            }}
          >
            <mesh
              geometry={geometry.style}
              material={material}
              castShadow
              receiveShadow
            />
          </group>
        </group>
      ))}
    </group>
  );
}

export function PassionHeart(props: FlowerOrgansProps) {
  return (
    <>
      <ReproductiveAxis {...props} />
      {PASSION_CORONA.map((_, ring) => (
        <CoronaRing key={ring} ring={ring} {...props} />
      ))}
    </>
  );
}
