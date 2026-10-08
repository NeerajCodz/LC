import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { ANEMONE_MODEL } from "./anemoneGeometry";
import { AnemoneLeaf } from "./AnemoneFoliage";
const anatomy: StemAnatomy = {
  color: "#718650",
  leafTilt: -1.0,
  nodes: [
    { t: 0.05, angle: 0 },
    { t: 0.07, angle: 2.3 },
    { t: 0.1, angle: 4.4 },
  ],
};
function AnemoneStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={AnemoneLeaf} />
  );
}
export const anemoneStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.22,
  headCenter: [0, 0.19, 0],
  headTilt: 0,
  stemLength: 1.9,
  stemRadius: 0.023,
  leafCount: 3,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function AnemoneOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="anemone" model={ANEMONE_MODEL} />;
}
export function Anemone(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="anemone"
      structure={anemoneStructure}
      Organs={AnemoneOrgans}
      StemComponent={AnemoneStem}
    />
  );
}
