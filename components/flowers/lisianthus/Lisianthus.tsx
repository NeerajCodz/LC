import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { LISIANTHUS_MODEL, LISIANTHUS_STALKS } from "./lisianthusGeometry";
import { LisianthusLeaf } from "./LisianthusFoliage";
const anatomy: StemAnatomy = {
  color: "#7e9b74",
  leafTilt: -1.1,
  nodes: [
    { t: 0.17, angle: 0 },
    { t: 0.17, angle: 3.141592653589793 },
    { t: 0.37, angle: 0.35 },
    { t: 0.37, angle: 3.491592653589793 },
    { t: 0.59, angle: 0.8, scale: 0.8 },
    { t: 0.59, angle: 3.941592653589793, scale: 0.8 },
  ],
  extras: LISIANTHUS_STALKS,
};
function LisianthusStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={LisianthusLeaf}
    />
  );
}
export const lisianthusStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.55,
  headCenter: [0, 0.52, 0.23],
  headTilt: 0,
  stemLength: 2.25,
  stemRadius: 0.027,
  leafCount: 6,
  previewScale: 1.13,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function LisianthusOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="lisianthus" model={LISIANTHUS_MODEL} />
  );
}
export function Lisianthus(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="lisianthus"
      structure={lisianthusStructure}
      Organs={LisianthusOrgans}
      StemComponent={LisianthusStem}
    />
  );
}
