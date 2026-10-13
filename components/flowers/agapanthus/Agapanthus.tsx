import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { AGAPANTHUS_MODEL, AGAPANTHUS_STALKS } from "./agapanthusGeometry";
import { AgapanthusLeaf } from "./AgapanthusFoliage";
import { AGAPANTHUS_LEAF_TILT } from "./agapanthusLeaf";

const anatomy: StemAnatomy = {
  color: "#6b8359",
  leafTilt: AGAPANTHUS_LEAF_TILT,
  nodes: [{ t: 0.015, angle: 0 }],
  headExtras: AGAPANTHUS_STALKS,
};
function AgapanthusStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={AgapanthusLeaf}
    />
  );
}
export const agapanthusStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.16,
  portraitBounds: { min: [-1.65, -2.19, -1.65], max: [1.65, 1.25, 1.65] },
  headCenter: [0, 0.22, 0],
  headTilt: 0,
  stemLength: 2.15,
  stemRadius: 0.035,
  leafCount: 8,
  previewScale: 1.03,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function AgapanthusOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="agapanthus" model={AGAPANTHUS_MODEL} />
  );
}
export function Agapanthus(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="agapanthus"
      structure={agapanthusStructure}
      Organs={AgapanthusOrgans}
      StemComponent={AgapanthusStem}
    />
  );
}
