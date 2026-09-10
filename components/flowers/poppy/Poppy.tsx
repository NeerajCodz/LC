import { useMemo } from "react";
import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { OrganAssembly, type FlowerOrgansProps } from "../FloralParts";
import { PoppySepals } from "./PoppySepals";
import { createPoppyHeart } from "@/lib/three/floralOrgans";
export const poppyStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.48,
  stemRadius: 0.018,
  leafCount: 3,
  roughness: 0.76,
  sheen: 0.32,
  layers: [
    whorl(
      2,
      0.025,
      0,
      1.12,
      {
        length: 1.28,
        width: 1.5,
        cup: 0.07,
        curl: 0.09,
        ripple: 0.065,
        edge: 0.08,
        roundness: 0.48,
        thickness: 0.007,
        crinkle: 0.025,
      },
      { offset: 0.35, variation: 0.13 },
    ),
    whorl(
      2,
      0.03,
      0.02,
      1.02,
      {
        length: 1.2,
        width: 1.4,
        cup: 0.1,
        curl: 0.13,
        ripple: 0.075,
        edge: 0.075,
        roundness: 0.5,
        thickness: 0.007,
        crinkle: 0.025,
      },
      { offset: Math.PI / 2 + 0.35, delay: 0.07, variation: 0.15 },
    ),
  ],
};
function PoppyHeart({ quality, bloom }: FlowerOrgansProps) {
  const geometry = useMemo(() => createPoppyHeart(quality), [quality]);
  return (
    <>
      <OrganAssembly geometry={geometry} bloom={bloom} />
      <PoppySepals quality={quality} bloom={bloom} />
    </>
  );
}
export function Poppy(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="poppy"
      structure={poppyStructure}
      Organs={PoppyHeart}
    />
  );
}
