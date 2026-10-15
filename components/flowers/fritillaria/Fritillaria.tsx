import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { FRITILLARIA_MODEL } from "./fritillariaGeometry";
import {
  FRITILLARIA_LEAF_TILT,
  FRITILLARIA_FOLIAGE_NODES,
} from "./fritillariaLeaf";
import { FritillariaLeaf } from "./FritillariaFoliage";
export const fritillariaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.05,
  headCenter: [0, 0.34, 0],
  headTilt: 0,
  stemLength: 2.2,
  stemRadius: 0.042,
  leafCount: 18,
  previewScale: 1.15,
  portraitBounds: { min: [-0.88, -2.25, -0.88], max: [0.88, 1.23, 0.88] },
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#73904f",
  leafTilt: FRITILLARIA_LEAF_TILT,
  nodes: FRITILLARIA_FOLIAGE_NODES,
};
function FritillariaStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={FritillariaLeaf}
    />
  );
}
function FritillariaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="fritillaria" model={FRITILLARIA_MODEL} />
  );
}
export function Fritillaria(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="fritillaria"
      structure={fritillariaStructure}
      Organs={FritillariaOrgans}
      StemComponent={FritillariaStem}
    />
  );
}
