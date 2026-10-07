import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { RANUNCULUS_MODEL } from "./ranunculusGeometry";
import { RanunculusLeaf } from "./RanunculusFoliage";
const anatomy: StemAnatomy = {
  color: "#63824e",
  leafTilt: -1.05,
  nodes: [
    { t: 0.06, angle: 0, scale: 1.05 },
    { t: 0.08, angle: 2.35 },
    { t: 0.3, angle: 4.5, scale: 0.75 },
    { t: 0.52, angle: 1.2, scale: 0.48 },
  ],
};
function RanunculusStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={RanunculusLeaf}
    />
  );
}
export const ranunculusStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.22,
  headCenter: [0, 0.34, 0],
  headTilt: 0,
  stemLength: 2.1,
  stemRadius: 0.03,
  leafCount: 4,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function RanunculusOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="ranunculus" model={RANUNCULUS_MODEL} />
  );
}
export function Ranunculus(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="ranunculus"
      structure={ranunculusStructure}
      Organs={RanunculusOrgans}
      StemComponent={RanunculusStem}
    />
  );
}
