import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { CARNATION_MODEL } from "./carnationGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
const anatomy: StemAnatomy = {
  color: "#6c8d80",
  swollen: true,
  nodes: [0.28, 0.49, 0.7].flatMap((t) => [
    { t, angle: 0 },
    { t, angle: Math.PI },
  ]),
};
function CarnationStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
export const carnationStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.05,
  headCenter: [0, 0.45, 0],
  headTilt: 0.25,
  stemLength: 2.6,
  stemRadius: 0.023,
  leafCount: 3,
  calyx: false,
  airbornePollen: false,
};
function CarnationOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="carnation" model={CARNATION_MODEL} />
  );
}
export function Carnation(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="carnation"
      structure={carnationStructure}
      Organs={CarnationOrgans}
      StemComponent={CarnationStem}
    />
  );
}
