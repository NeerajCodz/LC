import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { DELPHINIUM_MODEL, DELPHINIUM_STALKS } from "./delphiniumGeometry";
import { DelphiniumLeaf } from "./DelphiniumFoliage";
const anatomy: StemAnatomy = {
  leafTilt: -0.82,
  color: "#658366",
  nodes: [
    { t: 0.16, angle: 0, scale: 0.94 },
    { t: 0.34, angle: 3.391592653589793, scale: 0.92 },
    { t: 0.51, angle: 0.5, scale: 0.86 },
    { t: 0.7, angle: 3.641592653589793, scale: 0.78 },
    { t: 0.87, angle: 0.75, scale: 0.66 },
  ],
  extras: DELPHINIUM_STALKS,
};
function DelphiniumStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={DelphiniumLeaf}
    />
  );
}
export const delphiniumStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.55,
  headCenter: [0, 0.65, 0.17],
  headTilt: 0,
  stemLength: 2.1,
  stemRadius: 0.031,
  leafCount: 5,
  previewScale: 1.24,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function DelphiniumOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="delphinium" model={DELPHINIUM_MODEL} />
  );
}
export function Delphinium(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="delphinium"
      structure={delphiniumStructure}
      Organs={DelphiniumOrgans}
      StemComponent={DelphiniumStem}
    />
  );
}
