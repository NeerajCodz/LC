import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  ALLIUM_MODEL,
  ALLIUM_HEAD_CENTER,
  ALLIUM_STALKS,
} from "./alliumGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import { ALLIUM_FOLIAGE_NODES, ALLIUM_LEAF_TILT } from "./alliumLeaf";
import { AlliumLeaf } from "./AlliumFoliage";
export const alliumStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.03,
  plantingRadius: 1.65,
  headTilt: 0,
  stemLength: 2.25,
  stemRadius: 0.034,
  leafCount: 4,
  previewScale: 1.1,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.8, -2.45, -1.8], max: [1.8, 1.3, 1.8] },
  headCenter: ALLIUM_HEAD_CENTER,
};
const anatomy: StemAnatomy = {
  headExtras: ALLIUM_STALKS,
  color: "#809160",
  nodes: ALLIUM_FOLIAGE_NODES,
  leafTilt: ALLIUM_LEAF_TILT,
};
function SpeciesStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={AlliumLeaf} />
  );
}
function Organs(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="allium"
      model={ALLIUM_MODEL}
      raycastCages
    />
  );
}
export function Allium(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="allium"
      structure={alliumStructure}
      Organs={Organs}
      StemComponent={SpeciesStem}
    />
  );
}
