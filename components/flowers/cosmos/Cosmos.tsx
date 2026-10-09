import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { COSMOS_MODEL } from "./cosmosGeometry";
import { CosmosLeaf } from "./CosmosFoliage";
import { COSMOS_HEAD_CENTER } from "./cosmosGeometry";
const anatomy: StemAnatomy = {
  color: "#758c53",
  leafTilt: -0.92,
  nodes: [
    { t: 0.18, angle: 0 },
    { t: 0.18, angle: 3.141592653589793 },
    { t: 0.41, angle: 0.5 },
    { t: 0.41, angle: 3.641592653589793 },
    { t: 0.65, angle: 0.9, scale: 0.78 },
    { t: 0.65, angle: 4.041592653589793, scale: 0.78 },
  ],
};
function CosmosStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={CosmosLeaf} />
  );
}
export const cosmosStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.15,
  headCenter: COSMOS_HEAD_CENTER,
  headTilt: 0,
  stemLength: 2.05,
  stemRadius: 0.025,
  leafCount: 6,
  previewScale: 1.03,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function CosmosOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="cosmos" model={COSMOS_MODEL} />;
}
export function Cosmos(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="cosmos"
      structure={cosmosStructure}
      Organs={CosmosOrgans}
      StemComponent={CosmosStem}
    />
  );
}
