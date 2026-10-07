import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { GERBERA_MODEL, GERBERA_STALKS } from "./gerberaGeometry";
import { GerberaLeaf } from "./GerberaFoliage";
const anatomy: StemAnatomy = {
  leafTilt: -1.12,
  color: "#6f865a",
  nodes: [
    { t: 0.085, angle: 0.0, scale: 0.78 },
    { t: 0.12000000000000001, angle: 2.399, scale: 0.87 },
    { t: 0.085, angle: 4.798, scale: 0.96 },
    { t: 0.12000000000000001, angle: 7.197, scale: 0.78 },
    { t: 0.085, angle: 9.596, scale: 0.87 },
    { t: 0.12000000000000001, angle: 11.995000000000001, scale: 0.96 },
  ],
  extras: GERBERA_STALKS,
};
function GerberaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={GerberaLeaf} />
  );
}
export const gerberaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.16,
  headCenter: [0, 0.02, 0.04],
  headTilt: 0,
  stemLength: 2.1,
  stemRadius: 0.032,
  leafCount: 6,
  previewScale: 1.04,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function GerberaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="gerbera" model={GERBERA_MODEL} />;
}
export function Gerbera(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="gerbera"
      structure={gerberaStructure}
      Organs={GerberaOrgans}
      StemComponent={GerberaStem}
    />
  );
}
