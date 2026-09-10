import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { PETAL } from "@/lib/three/geometry";
import { FlowerPlant } from "../FlowerPlant";
import {
  FloralSurfacePart,
  BladePart,
  type FlowerOrgansProps,
} from "../FloralParts";
export const birdOfParadiseStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.14,
  headCenter: [0.25, 0.5, 0],
  headRadius: 1.55,
  stemLength: 2.45,
  stemRadius: 0.04,
  leafCount: 3,
  roughness: 0.48,
  layers: [],
};
const SEPAL = {
  ...PETAL,
  length: 1.35,
  width: 0.29,
  cup: 0.04,
  curl: 0.04,
  edge: 0.015,
  thickness: 0.02,
  taper: 0.85,
};
const BLUE = {
  ...PETAL,
  length: 0.95,
  width: 0.14,
  cup: 0.03,
  curl: 0.05,
  edge: 0.025,
  thickness: 0.015,
  taper: 0.6,
};
function BirdOrgans(props: FlowerOrgansProps) {
  return (
    <>
      <FloralSurfacePart
        {...props}
        kind="boat"
        color="#557047"
        position={[-0.1, 0, 0]}
        roughness={0.42}
      />
      {[0, 1, 2].map((i) => (
        <BladePart
          {...props}
          key={i}
          profile={SEPAL}
          color={props.color ?? "#e98720"}
          position={[-0.2 + i * 0.22, 0.05, 0]}
          rotation={[0.08 + i * 0.09, 0.12, i * 0.38 - 0.32]}
          delay={i * 0.16}
        />
      ))}
      {[-1, 1].map((side) => (
        <BladePart
          {...props}
          key={side}
          profile={BLUE}
          color="#3d459d"
          position={[0.3, 0.12, side * 0.027]}
          rotation={[0.16, side * 0.12, -1.05]}
          delay={0.22}
        />
      ))}
    </>
  );
}
export function BirdOfParadise(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="bird-of-paradise"
      structure={birdOfParadiseStructure}
      Organs={BirdOrgans}
    />
  );
}
