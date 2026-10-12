import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { HYACINTH_MODEL, HYACINTH_STALKS } from "./hyacinthGeometry";
import { HyacinthLeaf } from "./HyacinthFoliage";
const anatomy: StemAnatomy = {
  color: "#7d9560",
  leafTilt: -0.06,
  nodes: [{ t: 0.035, angle: 0 }],
  headExtras: HYACINTH_STALKS,
};
function HyacinthStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={HyacinthLeaf} />
  );
}
export const hyacinthStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.23,
  portraitBounds: { min: [-0.9, -1.24, -0.9], max: [0.9, 1.8, 0.9] },
  headCenter: [0, 0.73, 0],
  headTilt: 0,
  stemLength: 1.2,
  stemRadius: 0.052,
  leafCount: 5,
  previewScale: 1.14,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function HyacinthOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="hyacinth" model={HYACINTH_MODEL} />;
}
export function Hyacinth(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="hyacinth"
      structure={hyacinthStructure}
      Organs={HyacinthOrgans}
      StemComponent={HyacinthStem}
    />
  );
}
