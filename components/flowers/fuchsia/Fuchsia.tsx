import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { FuchsiaOrgans } from "./FuchsiaOrgans";
import { FuchsiaStem } from "./FuchsiaStem";

export const fuchsiaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.8,
  headCenter: [0.96, -1.1, 0.02],
  previewScale: 1.25,
  headTilt: 0,
  stemLength: 2.6,
  stemRadius: 0.035,
  leafCount: 3,
  calyx: false,
  roughness: 0.57,
};
export function Fuchsia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="fuchsia"
      structure={fuchsiaStructure}
      Organs={FuchsiaOrgans}
      StemComponent={FuchsiaStem}
    />
  );
}
