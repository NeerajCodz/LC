import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { BLUEBELL_MODEL, BLUEBELL_STALKS } from "./bluebellGeometry";
import { BluebellLeaf } from "./BluebellFoliage";
const anatomy: StemAnatomy = {
  color: "#6c8551",
  leafTilt: -0.1,
  nodes: [{ t: 0.045, angle: 0 }],
  extras: BLUEBELL_STALKS,
};
function BluebellStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={BluebellLeaf} />
  );
}
export const bluebellStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.32,
  headCenter: [0.43, 0.58, 0.2],
  headTilt: 0,
  stemLength: 1.8,
  stemRadius: 0.023,
  leafCount: 5,
  previewScale: 1.12,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function BluebellOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="bluebell" model={BLUEBELL_MODEL} />;
}
export function Bluebell(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="bluebell"
      structure={bluebellStructure}
      Organs={BluebellOrgans}
      StemComponent={BluebellStem}
    />
  );
}
