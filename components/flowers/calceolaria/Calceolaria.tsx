import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  CALCEOLARIA_MODEL,
  CALCEOLARIA_HEAD_CENTER,
  CALCEOLARIA_STALKS,
} from "./calceolariaGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import {
  CALCEOLARIA_LEAF_NODES,
  CALCEOLARIA_LEAF_TILT,
} from "./calceolariaLeaf";
import { CalceolariaLeaf } from "./CalceolariaFoliage";
export const calceolariaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.1,
  plantingRadius: 0.95,
  headTilt: 0,
  stemLength: 1.78,
  stemRadius: 0.029,
  leafCount: 6,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.4, -1.95, -1.5], max: [1.4, 1.15, 1.6] },
  headCenter: CALCEOLARIA_HEAD_CENTER,
};
const anatomy: StemAnatomy = {
  color: "#809160",
  nodes: CALCEOLARIA_LEAF_NODES,
  leafTilt: CALCEOLARIA_LEAF_TILT,
  headExtras: CALCEOLARIA_STALKS,
};
function SpeciesStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={CalceolariaLeaf}
    />
  );
}
function Organs(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="calceolaria"
      model={CALCEOLARIA_MODEL}
      raycastCages
    />
  );
}
export function Calceolaria(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="calceolaria"
      structure={calceolariaStructure}
      Organs={Organs}
      StemComponent={SpeciesStem}
    />
  );
}
