import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { MAGNOLIA_MODEL } from "./magnoliaGeometry";
import { MagnoliaLeaf } from "./MagnoliaFoliage";
const anatomy: StemAnatomy = {
  color: "#80694f",
  leafTilt: -1.04,
  nodes: [
    { t: 0.16, angle: 0 },
    { t: 0.35, angle: 2.399963 },
    { t: 0.55, angle: 4.799926 },
    { t: 0.72, angle: 0.9, scale: 0.78 },
  ],
};
function MagnoliaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={MagnoliaLeaf} />
  );
}
export const magnoliaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.6,
  headCenter: [0, 0.49, 0],
  headTilt: 0,
  stemLength: 2.1,
  stemRadius: 0.075,
  leafCount: 4,
  previewScale: 1.14,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function MagnoliaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="magnolia" model={MAGNOLIA_MODEL} />;
}
export function Magnolia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="magnolia"
      structure={magnoliaStructure}
      Organs={MagnoliaOrgans}
      StemComponent={MagnoliaStem}
    />
  );
}
