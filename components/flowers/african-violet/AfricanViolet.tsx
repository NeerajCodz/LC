import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  AFRICAN_VIOLET_MODEL,
  AFRICAN_VIOLET_STALKS,
} from "./africanVioletGeometry";
import { AfricanVioletLeaf } from "./AfricanVioletFoliage";
import { AFRICAN_VIOLET_LEAF_TILT } from "./africanVioletLeaf";
const anatomy: StemAnatomy = {
  axis: false,
  color: "#84976e",
  leafTilt: AFRICAN_VIOLET_LEAF_TILT,
  nodes: Array.from({ length: 9 }, (_, i) => ({
    t: 0.035,
    angle: i * 2.399,
    scale: 0.86 + (i % 3) * 0.075,
  })),
  headExtras: AFRICAN_VIOLET_STALKS,
};
function AfricanVioletStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={AfricanVioletLeaf}
    />
  );
}
export const africanVioletStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 0.97,
  portraitBounds: { min: [-0.9, -0.58, -0.9], max: [0.9, 0.85, 0.9] },
  headCenter: [0, 0.2, 0.09],
  headTilt: 0,
  stemLength: 0.54,
  stemRadius: 0.015,
  leafCount: 9,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function AfricanVioletOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="african-violet"
      model={AFRICAN_VIOLET_MODEL}
    />
  );
}
export function AfricanViolet(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="african-violet"
      structure={africanVioletStructure}
      Organs={AfricanVioletOrgans}
      StemComponent={AfricanVioletStem}
    />
  );
}
