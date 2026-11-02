import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  GREVILLEA_MODEL,
  GREVILLEA_HEAD_CENTER,
  GREVILLEA_STALKS,
} from "./grevilleaGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import { GREVILLEA_FOLIAGE_NODES, GREVILLEA_LEAF_TILT } from "./grevilleaLeaf";
import { GrevilleaLeaf } from "./GrevilleaFoliage";
export const grevilleaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.12,
  plantingRadius: 0.6,
  headTilt: 0,
  stemLength: 1.36,
  stemRadius: 0.024,
  leafCount: 18,
  previewScale: 1.03,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.3, -1.6, -1.3], max: [1.3, 1.25, 1.4] },
  headCenter: GREVILLEA_HEAD_CENTER,
};
const anatomy: StemAnatomy = {
  color: "#80654d",
  nodes: GREVILLEA_FOLIAGE_NODES,
  leafTilt: GREVILLEA_LEAF_TILT,
  headExtras: GREVILLEA_STALKS,
};
function SpeciesStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={GrevilleaLeaf} />
  );
}
function Organs(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="grevillea"
      model={GREVILLEA_MODEL}
      raycastCages
    />
  );
}
export function Grevillea(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="grevillea"
      structure={grevilleaStructure}
      Organs={Organs}
      StemComponent={SpeciesStem}
    />
  );
}
