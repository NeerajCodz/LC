import { useMemo } from "react";
import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import {
  FloralSurfacePart,
  OrganAssembly,
  type FlowerOrgansProps,
} from "../FloralParts";
import { joinOrgans, stamenRing, organTube } from "@/lib/three/floralOrgans";
export const daffodilStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.7,
  stemRadius: 0.023,
  leafCount: 3,
  roughness: 0.59,
  layers: [
    whorl(
      3,
      0.025,
      0,
      1.12,
      {
        length: 0.94,
        width: 0.61,
        cup: 0.03,
        curl: 0.05,
        edge: 0.045,
        thickness: 0.014,
      },
      { offset: 0.1 },
    ),
    whorl(
      3,
      0.018,
      0.015,
      1.08,
      {
        length: 0.88,
        width: 0.59,
        cup: 0.08,
        curl: 0.06,
        edge: 0.055,
        thickness: 0.012,
      },
      { offset: Math.PI / 3 + 0.1, delay: 0.04 },
    ),
  ],
};
function DaffodilHeart(props: FlowerOrgansProps) {
  const geometry = useMemo(
    () =>
      joinOrgans([
        ...stamenRing(6, 0.1, 0.43, props.quality, "#f1d06b", "#c49028"),
        organTube(
          [
            [0, 0, 0],
            [0, 0.3, 0],
            [0, 0.5, 0.012],
          ],
          0.018,
          "#e9d686",
          props.quality,
        ),
      ]),
    [props.quality],
  );
  return (
    <>
      <FloralSurfacePart
        {...props}
        kind="corona"
        color="#e8b42f"
        delay={0.12}
      />
      <OrganAssembly geometry={geometry} bloom={props.bloom} />
    </>
  );
}
export function Daffodil(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="daffodil"
      structure={daffodilStructure}
      Organs={DaffodilHeart}
    />
  );
}
