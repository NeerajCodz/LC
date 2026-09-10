import { useMemo } from "react";
import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import {
  FloralSurfacePart,
  OrganAssembly,
  type FlowerOrgansProps,
} from "../FloralParts";
import { joinOrgans, stamenRing } from "@/lib/three/floralOrgans";
export const columbineStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 2.35,
  headCenter: [0, 0.2, 0],
  headRadius: 1.05,
  stemLength: 2.6,
  stemRadius: 0.018,
  leafCount: 3,
  roughness: 0.64,
  layers: [
    whorl(
      5,
      0.15,
      0.04,
      1.1,
      { length: 0.87, width: 0.33, cup: 0.02, curl: 0.16, thickness: 0.012 },
      { offset: 0.15 },
    ),
    whorl(
      5,
      0.15,
      0,
      0.42,
      {
        length: 0.46,
        width: 0.31,
        cup: 0.16,
        curl: 0.09,
        roundness: 0.25,
        thickness: 0.014,
      },
      { offset: Math.PI / 5 + 0.15, color: "#f1cf68", delay: 0.08 },
    ),
  ],
};
function ColumbineOrgans(props: FlowerOrgansProps) {
  const geometry = useMemo(
    () =>
      joinOrgans(
        stamenRing(34, 0.12, 0.78, props.quality, "#f0dca1", "#c9a137"),
      ),
    [props.quality],
  );
  return (
    <>
      {Array.from({ length: 5 }, (_, i) => {
        const a = (i * Math.PI * 2) / 5 + Math.PI / 5 + 0.15;
        return (
          <group key={i} rotation={[0, a, 0]}>
            <FloralSurfacePart
              {...props}
              kind="spur"
              color={props.color ?? "#b43939"}
              position={[0, 0.02, 0.2]}
              rotation={[Math.PI + 0.25, 0, 0]}
              delay={i * 0.013}
            />
          </group>
        );
      })}
      <OrganAssembly geometry={geometry} bloom={props.bloom} />
    </>
  );
}
export function Columbine(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="columbine"
      structure={columbineStructure}
      Organs={ColumbineOrgans}
    />
  );
}
