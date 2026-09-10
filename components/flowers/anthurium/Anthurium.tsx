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
export const anthuriumStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.18,
  headCenter: [0, 0.65, 0.12],
  headRadius: 1.15,
  leafCount: 3,
  roughness: 0.32,
  layers: [],
};
function AnthuriumOrgans(props: FlowerOrgansProps) {
  const geometry = useMemo(
    () => createSpadix(props.quality, true),
    [props.quality],
  );
  return (
    <>
      <FloralSurfacePart
        {...props}
        kind="anthurium"
        color={props.color ?? "#b5273b"}
        roughness={0.32}
      />
      <OrganAssembly geometry={geometry} bloom={props.bloom} roughness={0.72} />
    </>
  );
}
export function Anthurium(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="anthurium"
      structure={anthuriumStructure}
      Organs={AnthuriumOrgans}
    />
  );
}
