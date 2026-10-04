import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { PLUMERIA_MODEL } from "./plumeriaGeometry";
export const plumeriaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.5,
  headCenter: [0.08, 0.5, 0.18],
  previewScale: 1.08,
  headTilt: 0,
  stemLength: 2.1,
  stemRadius: 0.11,
  leafCount: 4,
  calyx: false,
  airbornePollen: false,
};
const anatomy: StemAnatomy = {
  color: "#858577",
  nodes: [
    { t: 0.48, angle: 0 },
    { t: 0.64, angle: 2.5 },
    { t: 0.76, angle: 4.3 },
    { t: 0.88, angle: 1.4 },
  ],
  extras: [
    {
      points: [
        [0, -0.6, 0],
        [0.21, -0.35, 0.02],
        [0.32, -0.18, 0.04],
      ],
      radius: 0.07,
      endRadius: 0.035,
      color: "#8e9080",
    },
  ],
};
function PlumeriaStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
function PlumeriaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="plumeria" model={PLUMERIA_MODEL} />;
}
export function Plumeria(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="plumeria"
      structure={plumeriaStructure}
      Organs={PlumeriaOrgans}
      StemComponent={PlumeriaStem}
    />
  );
}
