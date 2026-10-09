import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { CROCUS_MODEL, CROCUS_STALKS } from "./crocusGeometry";
import { CrocusLeaf } from "./CrocusFoliage";
const anatomy: StemAnatomy = {
  axis: false,
  color: "#a4b88b",
  leafTilt: -0.14,
  nodes: [
    { t: 0.04, angle: 0 },
    { t: 0.04, angle: 1.05 },
    { t: 0.04, angle: 2.1 },
    { t: 0.04, angle: 3.15 },
    { t: 0.04, angle: 4.2 },
    { t: 0.04, angle: 5.25 },
  ],
  extras: CROCUS_STALKS,
};
function CrocusStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={CrocusLeaf} />
  );
}
export const crocusStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.03,
  headCenter: [0, 0.47, 0.04],
  headTilt: 0,
  stemLength: 0.55,
  stemRadius: 0.016,
  leafCount: 6,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function CrocusOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="crocus" model={CROCUS_MODEL} />;
}
export function Crocus(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="crocus"
      structure={crocusStructure}
      Organs={CrocusOrgans}
      StemComponent={CrocusStem}
    />
  );
}
