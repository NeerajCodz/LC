import { useEffect, useMemo, useRef } from "react";
import { Mesh, MeshStandardMaterial } from "three";
import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { createPetalGeometry, PETAL } from "@/lib/three/geometry";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { petalOpenness } from "@/lib/three/easing";
import { FlowerPlant } from "../FlowerPlant";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  createMorningCorolla,
  createMorningReproductiveOrgans,
} from "./morningGloryGeometry";
import { createMorningCorollaMaterial } from "./morningGloryMaterial";
import { MorningVine } from "./MorningVine";
import { createPubescence } from "@/lib/three/pubescence";

export const morningGloryStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.45,
  previewScale: 1.3,
  headCenter: [0, 0.92, 0],
  headTilt: 1.0,
  stemLength: 2.35,
  stemRadius: 0.019,
  supportHeight: 0.72,
  calyx: false,
  leafCount: 3,
  roughness: 0.69,
};
function MorningOrgans({
  quality,
  bloom,
  time,
  wind,
  color,
  pulse,
  interaction,
}: FlowerOrgansProps) {
  const corolla = useRef<Mesh>(null);
  const geometry = useMemo(
    () => ({
      corolla: createMorningCorolla(quality),
      heart: createMorningReproductiveOrgans(quality),
      sepals: Array.from({ length: 5 }, (_, i) =>
        createPetalGeometry(
          {
            ...PETAL,
            length: 0.44 + (i % 2) * 0.055,
            width: 0.1 + i * 0.007,
            taper: 0.62,
            cup: 0.06,
            curl: -0.08,
            edge: 0.008,
            thickness: 0.008,
            ripple: 0.003,
            twist: 0.01,
          },
          531 + i,
          quality === "ultra" ? "high" : "low",
        ),
      ),
    }),
    [quality],
  );
  const tissue = useMemo(() => createMorningCorollaMaterial(color), [color]);
  const sepalHairs = useMemo(
    () =>
      geometry.sepals.map((g, i) =>
        createPubescence(g, quality, 0.018, 750 + i),
      ),
    [geometry, quality],
  );
  useEffect(() => () => sepalHairs.forEach((g) => g.dispose()), [sepalHairs]);
  const uniforms = useRef(tissue.uniforms);
  useEffect(() => {
    uniforms.current = tissue.uniforms;
  }, [tissue]);
  const organMaterial = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.78 }),
    [],
  );
  useEffect(
    () => () => {
      geometry.corolla.dispose();
      geometry.heart.dispose();
      geometry.sepals.forEach((g) => g.dispose());
      tissue.material.dispose();
      organMaterial.dispose();
    },
    [geometry, tissue, organMaterial],
  );
  useActiveFrame(() => {
    const open = petalOpenness(bloom.current, 0.03, 0.7);
    if (corolla.current?.morphTargetInfluences)
      corolla.current.morphTargetInfluences[0] = 1 - open;
    uniforms.current.uMorningTime.value = time.current;
    uniforms.current.uMorningWind.value = wind * open;
    uniforms.current.uMorningPulse.value = (pulse?.current ?? 0) * open;
    uniforms.current.uMorningCursor.value = interaction?.current.angle ?? 0;
    uniforms.current.uMorningProximity.value =
      (interaction?.current.proximity ?? 0) * open;
  });
  return (
    <>
      <mesh
        ref={corolla}
        geometry={geometry.corolla}
        material={tissue.material}
        onUpdate={(m) => m.updateMorphTargets()}
        castShadow
        receiveShadow
      />
      <mesh
        geometry={geometry.heart}
        material={organMaterial}
        castShadow
        receiveShadow
      />
      {geometry.sepals.map((g, i) => (
        <group key={i} rotation={[0, (i * Math.PI * 2) / 5 + 0.15, 0]}>
          <mesh
            geometry={g}
            position={[0, -0.015, 0.04]}
            rotation={[0.13 + i * 0.006, 0, 0]}
            onUpdate={(m) => m.updateMorphTargets()}
            castShadow
            receiveShadow
          >
            <meshPhysicalMaterial
              color={i % 2 ? "#70874a" : "#637d42"}
              roughness={0.82}
              sheen={0.1}
            />
            <mesh geometry={sepalHairs[i]} material={organMaterial} />
          </mesh>
        </group>
      ))}
    </>
  );
}
export function MorningGlory(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="morning-glory"
      structure={morningGloryStructure}
      Organs={MorningOrgans}
      StemComponent={MorningVine}
    />
  );
}
