import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { AMARYLLIS_MODEL, AMARYLLIS_STALKS } from "./amaryllisGeometry";
import { AmaryllisLeaf } from "./AmaryllisFoliage";
const anatomy: StemAnatomy = {
  color: "#809766",
  leafTilt: -0.06,
  nodes: [{ t: 0.028, angle: 0 }],
  headExtras: AMARYLLIS_STALKS,
};
function AmaryllisStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={AmaryllisLeaf} />
  );
}
export const amaryllisStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.45,
  portraitBounds: { min: [-1.9, -2.24, -1.7], max: [1.9, 1.35, 1.85] },
  headCenter: [0.02, 0.33, 0.55],
  headTilt: 0,
  stemLength: 2.2,
  stemRadius: 0.064,
  leafCount: 6,
  previewScale: 1.04,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function AmaryllisOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="amaryllis" model={AMARYLLIS_MODEL} />
  );
}
export function Amaryllis(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="amaryllis"
      structure={amaryllisStructure}
      Organs={AmaryllisOrgans}
      StemComponent={AmaryllisStem}
    />
  );
}
