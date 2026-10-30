import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { NICOTIANA_MODEL, NICOTIANA_HEAD_CENTER } from "./nicotianaGeometry";
import { NICOTIANA_FOLIAGE_NODES, NICOTIANA_LEAF_TILT } from "./nicotianaLeaf";
import { NicotianaLeaf, NicotianaNode } from "./NicotianaFoliage";
export const nicotianaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.35,
  headCenter: NICOTIANA_HEAD_CENTER,
  headTilt: 0,
  stemLength: 1.6,
  stemRadius: 0.027,
  leafCount: 5,
  previewScale: 1.12,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.36, -1.86, -1.28], max: [1.36, 1.65, 2] },
};
const anatomy: StemAnatomy = {
  color: "#82975d",
  leafTilt: NICOTIANA_LEAF_TILT,
  winged: true,
  nodes: NICOTIANA_FOLIAGE_NODES,
};
function NicotianaStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={NicotianaLeaf}
      NodeDecorationComponent={NicotianaNode}
    />
  );
}
function NicotianaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="nicotiana"
      model={NICOTIANA_MODEL}
      raycastCages
    />
  );
}
export function Nicotiana(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="nicotiana"
      structure={nicotianaStructure}
      Organs={NicotianaOrgans}
      StemComponent={NicotianaStem}
    />
  );
}
