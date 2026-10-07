import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { BEGONIA_MODEL } from "./begoniaGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import { BegoniaLeaf } from "./BegoniaFoliage";
const anatomy: StemAnatomy = {
  color: "#b57167",
  leafTilt: -0.85,
  stipules: true,
  nodes: [
    { t: 0.22, angle: 0.1 },
    { t: 0.45, angle: 2.5 },
    { t: 0.65, angle: 4.9 },
  ],
  extras: [
    {
      points: [
        [0, -1.9, 0],
        [0.035, -0.9, 0],
        [0.03, -0.15, 0],
      ],
      radius: 0.016,
      color: "#b5796d",
    },
  ],
};
function BegoniaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={BegoniaLeaf} />
  );
}
export const hardyBegoniaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.2,
  headCenter: [0, 0.1, 0.2],
  headTilt: 0.12,
  stemLength: 2.15,
  stemRadius: 0.028,
  leafCount: 3,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function BegoniaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="hardy-begonia" model={BEGONIA_MODEL} />
  );
}
export function HardyBegonia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="hardy-begonia"
      structure={hardyBegoniaStructure}
      Organs={BegoniaOrgans}
      StemComponent={BegoniaStem}
    />
  );
}
