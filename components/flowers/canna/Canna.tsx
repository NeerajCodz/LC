import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { CANNA_MODEL, CANNA_STALKS } from "./cannaGeometry";
import { CannaLeaf, CannaNodeDecoration } from "./CannaFoliage";
import { CANNA_LEAF_TILT } from "./cannaLeaf";

const anatomy: StemAnatomy = {
  color: "#6a8051",
  leafTilt: CANNA_LEAF_TILT,
  nodes: [
    { t: 0.16, angle: 0.15, scale: 1 },
    { t: 0.32, angle: 2.55, scale: 0.93 },
    { t: 0.51, angle: 4.95, scale: 0.81 },
    { t: 0.68, angle: 7.35, scale: 0.66 },
  ],
  headExtras: CANNA_STALKS,
};
function CannaStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={CannaLeaf}
      NodeDecorationComponent={CannaNodeDecoration}
    />
  );
}
export const cannaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.72,
  portraitBounds: { min: [-1.65, -2.29, -1.65], max: [1.65, 1.9, 1.65] },
  headCenter: [0, 0.77, 0.23],
  headTilt: 0,
  stemLength: 2.25,
  stemRadius: 0.046,
  leafCount: 4,
  previewScale: 1.12,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function CannaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="canna" model={CANNA_MODEL} />;
}
export function Canna(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="canna"
      structure={cannaStructure}
      Organs={CannaOrgans}
      StemComponent={CannaStem}
    />
  );
}
