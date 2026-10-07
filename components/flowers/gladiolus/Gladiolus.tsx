import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { GLADIOLUS_MODEL, GLADIOLUS_STALKS } from "./gladiolusGeometry";
import { GladiolusLeaf } from "./GladiolusFoliage";
const anatomy: StemAnatomy = {
  leafTilt: -0.16,
  color: "#658253",
  nodes: [
    { t: 0.08, angle: 0, scale: 1 },
    { t: 0.14, angle: 3.141592653589793, scale: 0.94 },
    { t: 0.23, angle: 0.03, scale: 0.85 },
    { t: 0.45, angle: 3.171592653589793, scale: 0.68 },
  ],
  extras: GLADIOLUS_STALKS,
};
function GladiolusStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={GladiolusLeaf} />
  );
}
export const gladiolusStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.6,
  headCenter: [0, 0.63, 0.2],
  headTilt: 0,
  stemLength: 2.25,
  stemRadius: 0.034,
  leafCount: 4,
  previewScale: 1.3,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function GladiolusOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="gladiolus" model={GLADIOLUS_MODEL} />
  );
}
export function Gladiolus(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="gladiolus"
      structure={gladiolusStructure}
      Organs={GladiolusOrgans}
      StemComponent={GladiolusStem}
    />
  );
}
