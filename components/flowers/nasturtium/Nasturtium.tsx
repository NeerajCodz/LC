import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { NASTURTIUM_MODEL, NASTURTIUM_STALKS } from "./nasturtiumGeometry";
import { NasturtiumLeaf } from "./NasturtiumFoliage";
const anatomy: StemAnatomy = {
  color: "#839956",
  leafTilt: -0.93,
  nodes: [
    { t: 0.12, angle: 0 },
    { t: 0.25, angle: 2.399963 },
    { t: 0.39, angle: 4.799926 },
    { t: 0.54, angle: 0.9 },
    { t: 0.7, angle: 3.2, scale: 0.75 },
  ],
  extras: NASTURTIUM_STALKS,
};
function NasturtiumStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={NasturtiumLeaf}
    />
  );
}
export const nasturtiumStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.65,
  headCenter: [0, 0.4, 0.24],
  headTilt: 0,
  stemLength: 1.95,
  stemRadius: 0.034,
  leafCount: 5,
  previewScale: 1.15,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function NasturtiumOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="nasturtium" model={NASTURTIUM_MODEL} />
  );
}
export function Nasturtium(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="nasturtium"
      structure={nasturtiumStructure}
      Organs={NasturtiumOrgans}
      StemComponent={NasturtiumStem}
    />
  );
}
