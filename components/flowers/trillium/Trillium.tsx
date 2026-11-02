import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { TRILLIUM_MODEL, TRILLIUM_HEAD_CENTER } from "./trilliumGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import { TRILLIUM_FOLIAGE_NODES, TRILLIUM_LEAF_TILT } from "./trilliumLeaf";
import { TrilliumLeaf } from "./TrilliumFoliage";
export const trilliumStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.06,
  headTilt: 0,
  cameraElevation: 0.55,
  stemLength: 1.4,
  stemRadius: 0.031,
  leafCount: 3,
  previewScale: 1.06,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.65, -1.55, -1.65], max: [1.65, 1.05, 1.65] },
  headCenter: TRILLIUM_HEAD_CENTER,
};
const anatomy: StemAnatomy = {
  color: "#809160",
  nodes: TRILLIUM_FOLIAGE_NODES,
  leafTilt: TRILLIUM_LEAF_TILT,
};
function SpeciesStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={TrilliumLeaf} />
  );
}
function Organs(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="trillium"
      model={TRILLIUM_MODEL}
      raycastCages
    />
  );
}
export function Trillium(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="trillium"
      structure={trilliumStructure}
      Organs={Organs}
      StemComponent={SpeciesStem}
    />
  );
}
