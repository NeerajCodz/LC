import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { PROTEA_MODEL } from "./proteaGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
const anatomy: StemAnatomy = {
  color: "#80745f",
  nodes: [0.2, 0.34, 0.47, 0.63, 0.79].map((t, i) => ({
    t,
    angle: i * 2.399,
    scale: 0.88 + (i % 2) * 0.12,
  })),
};
function ProteaStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
export const kingProteaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.18,
  headCenter: [0, 0.42, 0],
  headTilt: 0.17,
  stemLength: 2.5,
  stemRadius: 0.052,
  leafCount: 5,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function ProteaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="king-protea" model={PROTEA_MODEL} />
  );
}
export function KingProtea(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="king-protea"
      structure={kingProteaStructure}
      Organs={ProteaOrgans}
      StemComponent={ProteaStem}
    />
  );
}
