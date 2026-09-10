import { useMemo } from "react";
import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import {
  FloralSurfacePart,
  OrganAssembly,
  type FlowerOrgansProps,
} from "../FloralParts";
import { createSpadix } from "@/lib/three/floralOrgans";
export const callaLilyStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.23,
  headCenter: [0, 0.6, 0],
  headRadius: 1.05,
  leafCount: 3,
  roughness: 0.46,
  layers: [],
};
function CallaLilyOrgans(props: FlowerOrgansProps) {
  const geometry = useMemo(
    () => createSpadix(props.quality, false),
    [props.quality],
  );
  return (
    <group scale={0.9}>
      <FloralSurfacePart
        {...props}
        kind="calla"
        rotation={[0, Math.PI, 0]}
        scale={0.72}
        color={props.color ?? "#f5eee1"}
        roughness={0.46}
      />
      <OrganAssembly geometry={geometry} bloom={props.bloom} roughness={0.72} />
    </group>
  );
}
export function CallaLily(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="calla-lily"
      structure={callaLilyStructure}
      Organs={CallaLilyOrgans}
    />
  );
}
