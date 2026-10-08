import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { FREESIA_MODEL, FREESIA_STALKS } from "./freesiaGeometry";
import { FreesiaLeaf } from "./FreesiaFoliage";
const anatomy: StemAnatomy = {
  axis: false,
  color: "#758c50",
  leafTilt: -0.08,
  nodes: [{ t: 0.04, angle: 0 }],
  extras: FREESIA_STALKS,
};
function FreesiaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={FreesiaLeaf} />
  );
}
export const freesiaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.65,
  headCenter: [0.12, 0.33, 0.22],
  headTilt: 0,
  stemLength: 1.85,
  stemRadius: 0.017,
  leafCount: 5,
  previewScale: 1.1,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function FreesiaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="freesia" model={FREESIA_MODEL} />;
}
export function Freesia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="freesia"
      structure={freesiaStructure}
      Organs={FreesiaOrgans}
      StemComponent={FreesiaStem}
    />
  );
}
