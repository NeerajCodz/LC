import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  ALSTROEMERIA_MODEL,
  ALSTROEMERIA_STALKS,
} from "./alstroemeriaGeometry";
import { AlstroemeriaLeaf } from "./AlstroemeriaFoliage";
const anatomy: StemAnatomy = {
  leafTilt: -1.0,
  color: "#648458",
  nodes: [
    { t: 0.2, angle: 0 },
    { t: 0.35, angle: 3.391592653589793 },
    { t: 0.5, angle: 0.45 },
    { t: 0.65, angle: 3.641592653589793 },
    { t: 0.83, angle: 0.7, scale: 0.8 },
    { t: 0.96, angle: 3.8415926535897933, scale: 0.68 },
  ],
  extras: ALSTROEMERIA_STALKS,
};
function AlstroemeriaStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={AlstroemeriaLeaf}
    />
  );
}
export const alstroemeriaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.32,
  headCenter: [0, 0.35, 0.2],
  headTilt: 0,
  stemLength: 2.05,
  stemRadius: 0.028,
  leafCount: 6,
  previewScale: 1.12,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function AlstroemeriaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="alstroemeria"
      model={ALSTROEMERIA_MODEL}
    />
  );
}
export function Alstroemeria(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="alstroemeria"
      structure={alstroemeriaStructure}
      Organs={AlstroemeriaOrgans}
      StemComponent={AlstroemeriaStem}
    />
  );
}
