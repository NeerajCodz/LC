import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { HYDRANGEA_MODEL } from "./hydrangeaGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
const anatomy: StemAnatomy = {
  color: "#82745a",
  nodes: [0.25, 0.48, 0.7].flatMap((t, i) => [
    { t, angle: i * 0.8 },
    { t, angle: i * 0.8 + Math.PI },
  ]),
};
function HydrangeaStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
export const hydrangeaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.35,
  headCenter: [0, 0.1, 0],
  headTilt: 0.22,
  stemLength: 2.5,
  stemRadius: 0.038,
  leafCount: 6,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function HydrangeaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="hydrangea" model={HYDRANGEA_MODEL} />
  );
}
export function Hydrangea(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="hydrangea"
      structure={hydrangeaStructure}
      Organs={HydrangeaOrgans}
      StemComponent={HydrangeaStem}
    />
  );
}
