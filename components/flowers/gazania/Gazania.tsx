import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { GAZANIA_MODEL, GAZANIA_HEAD_CENTER } from "./gazaniaGeometry";
import { GAZANIA_LEAF_TILT } from "./gazaniaLeaf";
import { GazaniaLeaf } from "./GazaniaFoliage";
const anatomy: StemAnatomy = {
  color: "#687c50",
  leafTilt: GAZANIA_LEAF_TILT,
  nodes: Array.from({ length: 7 }, (_, i) => ({
    t: 0.07 + (i % 3) * 0.035,
    angle: i * 2.399963229728653,
    scale: 0.76 + (i % 3) * 0.08,
  })),
};
export const gazaniaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.15,
  headCenter: GAZANIA_HEAD_CENTER,
  headTilt: 0,
  stemLength: 1.65,
  stemRadius: 0.026,
  leafCount: 7,
  previewScale: 1.02,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.23, -1.73, -1.2], max: [1.23, 0.79, 1.2] },
};
function GazaniaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={GazaniaLeaf} />
  );
}
function GazaniaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="gazania" model={GAZANIA_MODEL} />;
}
export function Gazania(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="gazania"
      structure={gazaniaStructure}
      Organs={GazaniaOrgans}
      StemComponent={GazaniaStem}
    />
  );
}
