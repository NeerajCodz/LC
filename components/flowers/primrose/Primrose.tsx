import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { PRIMROSE_MODEL, PRIMROSE_STALKS } from "./primroseGeometry";
import { PrimroseLeaf } from "./PrimroseFoliage";
const anatomy: StemAnatomy = {
  axis: false,
  leafTilt: -1.28,
  color: "#809454",
  nodes: [
    { t: 0.11, angle: 0.0, scale: 0.83 },
    { t: 0.11, angle: 2.399, scale: 0.8899999999999999 },
    { t: 0.11, angle: 4.798, scale: 0.95 },
    { t: 0.11, angle: 7.197, scale: 0.83 },
    { t: 0.11, angle: 9.596, scale: 0.8899999999999999 },
    { t: 0.11, angle: 11.995000000000001, scale: 0.95 },
  ],
  extras: PRIMROSE_STALKS,
};
function PrimroseStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={PrimroseLeaf} />
  );
}
export const primroseStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.13,
  headCenter: [0, 0.23, 0.15],
  headTilt: 0,
  stemLength: 1.6,
  stemRadius: 0.022,
  leafCount: 6,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function PrimroseOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="primrose" model={PRIMROSE_MODEL} />;
}
export function Primrose(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="primrose"
      structure={primroseStructure}
      Organs={PrimroseOrgans}
      StemComponent={PrimroseStem}
    />
  );
}
