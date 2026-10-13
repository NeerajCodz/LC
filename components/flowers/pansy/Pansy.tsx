import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { PANSY_MODEL, PANSY_STALKS } from "./pansyGeometry";
import { PansyLeaf } from "./PansyFoliage";
import { PANSY_LEAF_TILT } from "./pansyLeaf";
const anatomy: StemAnatomy = {
  color: "#6b865b",
  leafTilt: PANSY_LEAF_TILT,
  nodes: [
    { t: 0.12, angle: 0 },
    { t: 0.3, angle: 2.4 },
    { t: 0.5, angle: 4.8, scale: 0.85 },
    { t: 0.7, angle: 7.2, scale: 0.7 },
  ],
  headExtras: PANSY_STALKS,
};
function PansyStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={PansyLeaf} />
  );
}
export const pansyStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.22,
  portraitBounds: { min: [-1.05, -1.34, -0.85], max: [1.05, 1.4, 1.05] },
  headCenter: [0, 0.36, 0.15],
  headTilt: 0,
  stemLength: 1.3,
  stemRadius: 0.015,
  leafCount: 4,
  previewScale: 1.08,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function PansyOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="pansy" model={PANSY_MODEL} />;
}
export function Pansy(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="pansy"
      structure={pansyStructure}
      Organs={PansyOrgans}
      StemComponent={PansyStem}
    />
  );
}
