import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { PETUNIA_MODEL, PETUNIA_STALKS } from "./petuniaGeometry";
import { PetuniaLeaf } from "./PetuniaFoliage";
const anatomy: StemAnatomy = {
  leafTilt: -1.1,
  color: "#6e874d",
  nodes: [
    { t: 0.2, angle: 0 },
    { t: 0.36, angle: 3.141592653589793 },
    { t: 0.52, angle: 0.35 },
    { t: 0.68, angle: 3.491592653589793 },
    { t: 0.91, angle: 0.65, scale: 0.7 },
    { t: 0.91, angle: 3.791592653589793, scale: 0.7 },
  ],
  extras: PETUNIA_STALKS,
};
function PetuniaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={PetuniaLeaf} />
  );
}
export const petuniaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.55,
  headCenter: [0, 0.52, 0.38],
  headTilt: 0,
  stemLength: 2.05,
  stemRadius: 0.027,
  leafCount: 6,
  previewScale: 1.18,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function PetuniaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="petunia" model={PETUNIA_MODEL} />;
}
export function Petunia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="petunia"
      structure={petuniaStructure}
      Organs={PetuniaOrgans}
      StemComponent={PetuniaStem}
    />
  );
}
