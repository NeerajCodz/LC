import { useEffect, useMemo, useRef } from "react";
import { Group } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import {
  FloralSurfacePart,
  OrganicPart,
  type FlowerOrgansProps,
} from "../FloralParts";
import { joinOrgans, organTube } from "@/lib/three/floralOrgans";
export const bleedingHeartStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0,
  headCenter: [0.35, 0.3, 0],
  headRadius: 1.55,
  stemLength: 2.25,
  stemRadius: 0.024,
  leafCount: 3,
  roughness: 0.52,
  layers: [],
};
const ARC: Vec3[] = [
  [0, 0, 0],
  [-0.3, 0.6, 0],
  [-0.4, 0.709, 0],
  [0.1, 0.75, 0],
  [0.8, 0.669, 0],
  [1.3, 0.513, 0],
];
function Pendant({ index, ...props }: FlowerOrgansProps & { index: number }) {
  const pivot = useRef<Group>(null),
    x = -0.4 + index * 0.39,
    y = 0.76 - 0.3 * ((x - 0.1) / 1.35) ** 2;
  useActiveFrame(() => {
    if (pivot.current)
      pivot.current.rotation.z =
        Math.sin(props.time.current * 1.25 - index * 0.5) * 0.035 * props.wind;
  });
  return (
    <group ref={pivot} position={[x, y, 0]}>
      <OrganicPart
        points={[
          [0, 0, 0],
          [0.01, -0.12, 0],
          [0, -0.22, 0],
        ]}
        radius={0.008}
        color="#6f8c55"
        quality={props.quality}
      />
      <group position={[0, -0.2, 0]}>
        <FloralSurfacePart
          {...props}
          kind="pouch"
          color={props.color ?? "#d45380"}
          scale={0.58}
          delay={index * 0.035}
        />
        <OrganicPart
          points={[
            [0, -0.35, 0.015],
            [0, -0.49, 0.045],
            [0, -0.6, 0.025],
          ]}
          radius={0.055}
          endRadius={0.008}
          flatten={0.55}
          color="#f4ecdf"
          quality={props.quality}
        />
      </group>
    </group>
  );
}
function BleedingHeartOrgans(props: FlowerOrgansProps) {
  const geometry = useMemo(
    () => joinOrgans([organTube(ARC, 0.022, "#738b57", props.quality, 0.01)]),
    [props.quality],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <>
      <mesh geometry={geometry} dispose={null}>
        <meshStandardMaterial vertexColors roughness={0.75} />
      </mesh>
      {Array.from({ length: 5 }, (_, i) => (
        <Pendant {...props} index={i} key={i} />
      ))}
    </>
  );
}
export function BleedingHeart(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="bleeding-heart"
      structure={bleedingHeartStructure}
      Organs={BleedingHeartOrgans}
    />
  );
}
