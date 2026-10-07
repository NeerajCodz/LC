import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  LILY_OF_THE_VALLEY_MODEL,
  LILY_OF_THE_VALLEY_STALKS,
} from "./lilyOfTheValleyGeometry";
import { LilyOfTheValleyLeaf } from "./LilyOfTheValleyFoliage";
const anatomy: StemAnatomy = {
  leafTilt: -0.27,
  color: "#6d8a54",
  nodes: [
    { t: 0.11, angle: 0.3 },
    { t: 0.11, angle: 3.391592653589793 },
  ],
  extras: LILY_OF_THE_VALLEY_STALKS,
};
function LilyOfTheValleyStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={LilyOfTheValleyLeaf}
    />
  );
}
export const lilyOfTheValleyStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.35,
  headCenter: [0.4, 0.72, 0.08],
  headTilt: 0,
  stemLength: 1.6,
  stemRadius: 0.022,
  leafCount: 2,
  previewScale: 1.12,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function LilyOfTheValleyOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="lily-of-the-valley"
      model={LILY_OF_THE_VALLEY_MODEL}
    />
  );
}
export function LilyOfTheValley(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="lily-of-the-valley"
      structure={lilyOfTheValleyStructure}
      Organs={LilyOfTheValleyOrgans}
      StemComponent={LilyOfTheValleyStem}
    />
  );
}
