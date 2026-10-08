import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { GARDENIA_MODEL, GARDENIA_STALKS } from "./gardeniaGeometry";
import { GardeniaLeaf } from "./GardeniaFoliage";
const anatomy: StemAnatomy = {
  color: "#7d7854",
  leafTilt: -1.08,
  nodes: [
    { t: 0.18, angle: 0 },
    { t: 0.18, angle: 3.141592653589793 },
    { t: 0.38, angle: 0.5 },
    { t: 0.38, angle: 3.641592653589793 },
    { t: 0.6, angle: 1.0, scale: 0.8 },
    { t: 0.6, angle: 4.141592653589793, scale: 0.8 },
  ],
  extras: GARDENIA_STALKS,
};
function GardeniaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={GardeniaLeaf} />
  );
}
export const gardeniaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.45,
  headCenter: [0, 0.46, 0.02],
  headTilt: 0,
  stemLength: 1.8,
  stemRadius: 0.05,
  leafCount: 6,
  previewScale: 1.1,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function GardeniaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="gardenia" model={GARDENIA_MODEL} />;
}
export function Gardenia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="gardenia"
      structure={gardeniaStructure}
      Organs={GardeniaOrgans}
      StemComponent={GardeniaStem}
    />
  );
}
