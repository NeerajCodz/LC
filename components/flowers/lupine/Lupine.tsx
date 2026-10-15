import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { LUPINE_MODEL } from "./lupineGeometry";
import { LUPINE_LEAF_TILT } from "./lupineLeaf";
import { LupineLeaf } from "./LupineFoliage";
export const lupineStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 0.95,
  headCenter: [0, 0.73, 0.07],
  headTilt: 0,
  stemLength: 2.2,
  stemRadius: 0.03,
  leafCount: 5,
  previewScale: 1.25,
  portraitBounds: { min: [-1.18, -2.24, -1.18], max: [1.18, 1.64, 1.18] },
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#708754",
  leafTilt: LUPINE_LEAF_TILT,
  nodes: [
    { t: 0.09, angle: 0, scale: 0.92 },
    { t: 0.12, angle: 2.399, scale: 0.94 },
    { t: 0.17, angle: 4.798, scale: 0.85 },
    { t: 0.44, angle: 0.65, scale: 0.69 },
    { t: 0.69, angle: 3.1, scale: 0.53 },
  ],
};
function LupineStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={LupineLeaf} />
  );
}
function LupineOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="lupine" model={LUPINE_MODEL} />;
}
export function Lupine(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="lupine"
      structure={lupineStructure}
      Organs={LupineOrgans}
      StemComponent={LupineStem}
    />
  );
}
