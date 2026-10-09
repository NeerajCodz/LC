import { useEffect, useMemo, useRef } from "react";
import { Group, Mesh, MeshStandardMaterial } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { createOrganicTube } from "@/lib/three/organicTube";
import { createPetalMaterial } from "@/lib/three/materials";
import { joinOrgans } from "@/lib/three/floralOrgans";
import { PETAL_PALETTES } from "@/lib/flowers/palettes";
import { petalOpenness } from "@/lib/three/easing";
import type { FlowerOrgansProps } from "../FloralParts";
import { LeafSprig } from "../LeafSprig";
import {
  createFuchsiaBlade,
  createFuchsiaHypanthium,
  createFuchsiaOvary,
  createFuchsiaPistil,
  createFuchsiaStamen,
  FUCHSIA_BRANCHES,
  FUCHSIA_FLOWERS,
} from "./fuchsiaGeometry";
import { stepFuchsiaPendant } from "./fuchsiaMotion";

function useFuchsiaResources(
  quality: FlowerOrgansProps["quality"],
  color?: string,
) {
  const geometry = useMemo(
    () => ({
      sepals: Array.from({ length: 4 }, (_, i) =>
        createFuchsiaBlade("sepal", quality, i),
      ),
      petals: Array.from({ length: 4 }, (_, i) =>
        createFuchsiaBlade("petal", quality, i),
      ),
      tube: createFuchsiaHypanthium(quality),
      ovary: createFuchsiaOvary(quality),
      pistil: createFuchsiaPistil(quality),
      stamens: joinOrgans(
        Array.from({ length: 8 }, (_, i) => createFuchsiaStamen(quality, i)),
      ),
      branches: joinOrgans(
        FUCHSIA_BRANCHES.map((points) =>
          createOrganicTube({
            points,
            radius: 0.024,
            endRadius: 0.009,
            color: "#88424e",
            tipColor: "#953852",
            segments: quality === "overview" || quality === "low" ? 24 : 48,
            sides: quality === "overview" || quality === "low" ? 8 : 14,
            grain: 0.07,
          }),
        ),
      ),
      pedicel: createOrganicTube({
        points: [
          [0, 0, 0],
          [0.025, -0.26, 0.015],
          [0, -0.67, 0],
        ],
        radius: 0.009,
        endRadius: 0.007,
        color: "#873d59",
        segments: quality === "overview" || quality === "low" ? 20 : 40,
        sides: quality === "overview" || quality === "low" ? 7 : 12,
      }),
    }),
    [quality],
  );
  const materials = useMemo(
    () => ({
      sepal: createPetalMaterial(
        color ?? "#c42b59",
        0.56,
        0.4,
        0,
        color ? undefined : PETAL_PALETTES.fuchsia,
      ),
      petal: createPetalMaterial("#57278d", 0.65, 0.46, 0, {
        root: "#3d2356",
        body: "#57278d",
        tip: "#7747a2",
        vein: "#431963",
        rootFalloff: 0.35,
        tipStart: 0.8,
        veinStrength: 0.07,
      }),
      organ: new MeshStandardMaterial({ vertexColors: true, roughness: 0.74 }),
    }),
    [color],
  );
  useEffect(
    () => () => {
      geometry.sepals.forEach((g) => g.dispose());
      geometry.petals.forEach((g) => g.dispose());
      geometry.tube.dispose();
      geometry.ovary.dispose();
      geometry.pistil.dispose();
      geometry.stamens.dispose();
      geometry.branches.dispose();
      geometry.pedicel.dispose();
    },
    [geometry],
  );
  useEffect(
    () => () => Object.values(materials).forEach((m) => m.dispose()),
    [materials],
  );
  return { geometry, materials };
}

function Pendant({
  resources,
  phase,
  ...props
}: FlowerOrgansProps & {
  resources: ReturnType<typeof useFuchsiaResources>;
  phase: number;
}) {
  const pivot = useRef<Group>(null),
    sepals = useRef<(Mesh | null)[]>([]),
    petals = useRef<(Mesh | null)[]>([]),
    stamens = useRef<Mesh>(null),
    pistil = useRef<Mesh>(null);
  const swing = useRef({
    x: { value: 0, velocity: 0 },
    z: { value: 0, velocity: 0 },
    last: 0,
  });
  useActiveFrame(() => {
    const t = props.time.current,
      dt = Math.max(0, t - swing.current.last);
    swing.current.last = t;
    const pointer = props.interaction?.current,
      pulse = props.pulse?.current ?? 0;
    const forcing =
      props.wind *
      (Math.sin(t * 1.2 + phase) * 0.026 + Math.sin(t * 2.3 + phase) * 0.01);
    stepFuchsiaPendant(
      swing.current.x,
      forcing +
        Math.sin(pointer?.angle ?? 0) * (pointer?.proximity ?? 0) * 0.035 +
        pulse * 0.025,
      dt,
    );
    stepFuchsiaPendant(
      swing.current.z,
      forcing * 0.65 +
        Math.cos(pointer?.angle ?? 0) * (pointer?.proximity ?? 0) * 0.035,
      dt,
      0.085,
    );
    if (pivot.current)
      pivot.current.rotation.set(
        swing.current.x.value,
        0,
        swing.current.z.value,
      );
    for (let i = 0; i < 4; i++) {
      const sepal = sepals.current[i],
        petal = petals.current[i];
      if (sepal?.morphTargetInfluences)
        sepal.morphTargetInfluences[0] =
          1 - petalOpenness(props.bloom.current, 0.018 * i, phase);
      if (petal?.morphTargetInfluences)
        petal.morphTargetInfluences[0] =
          1 - petalOpenness(props.bloom.current, 0.07 + i * 0.015, phase);
      if (sepal)
        sepal.rotation.x =
          Math.sin(t * 2.1 + phase + i) *
            0.005 *
            props.wind *
            props.bloom.current +
          pulse * 0.008;
    }
    const fold = 1 - petalOpenness(props.bloom.current, 0.12, phase);
    if (stamens.current?.morphTargetInfluences)
      stamens.current.morphTargetInfluences[0] = fold;
    if (pistil.current?.morphTargetInfluences)
      pistil.current.morphTargetInfluences[0] = fold;
  });
  const { geometry: g, materials: m } = resources;
  return (
    <group ref={pivot}>
      <mesh geometry={g.pedicel} material={m.organ} castShadow />
      <group position={[0, -0.67, 0]}>
        <mesh geometry={g.ovary} material={m.organ} castShadow />
        <mesh
          geometry={g.tube}
          material={m.sepal}
          onUpdate={(o) => o.updateMorphTargets()}
          castShadow
          receiveShadow
        />
        {g.sepals.map((geometry, i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2, 0]}>
            <mesh
              ref={(o) => {
                sepals.current[i] = o;
              }}
              geometry={geometry}
              material={m.sepal}
              onUpdate={(o) => o.updateMorphTargets()}
              castShadow
              receiveShadow
            />
          </group>
        ))}
        {g.petals.map((geometry, i) => (
          <group key={i} rotation={[0, (i * Math.PI) / 2 + Math.PI / 4, 0]}>
            <mesh
              ref={(o) => {
                petals.current[i] = o;
              }}
              geometry={geometry}
              material={m.petal}
              onUpdate={(o) => o.updateMorphTargets()}
              castShadow
              receiveShadow
            />
          </group>
        ))}
        <mesh
          ref={stamens}
          geometry={g.stamens}
          material={m.organ}
          onUpdate={(o) => o.updateMorphTargets()}
          castShadow
        />
        <mesh
          ref={pistil}
          geometry={g.pistil}
          material={m.organ}
          onUpdate={(o) => o.updateMorphTargets()}
          castShadow
        />
      </group>
    </group>
  );
}

export function FuchsiaOrgans(props: FlowerOrgansProps) {
  const resources = useFuchsiaResources(props.quality, props.color);
  return (
    <>
      <mesh
        geometry={resources.geometry.branches}
        material={resources.materials.organ}
        castShadow
      />
      {FUCHSIA_FLOWERS.map(({ position, scale, phase }, i) => (
        <group key={i} position={position} scale={scale}>
          {props.leaves &&
            [0, 1].map((side) => (
              <group
                key={side}
                rotation={[0, side * Math.PI + 0.5, 0]}
                scale={0.65}
              >
                <group rotation={[1.12, 0, 0]}>
                  <LeafSprig type="fuchsia" quality={props.quality} />
                </group>
              </group>
            ))}
          <group rotation={[0, i === 0 ? 0.62 : 1.05, 0]}>
            <Pendant {...props} resources={resources} phase={phase} />
          </group>
        </group>
      ))}
    </>
  );
}
