import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { ECHINACEA_MODEL, ECHINACEA_HEAD_CENTER } from "./echinaceaGeometry";
import { ECHINACEA_LEAF_TILT } from "./echinaceaLeaf";
import { EchinaceaLeaf } from "./EchinaceaFoliage";
const anatomy: StemAnatomy = {
  color: "#6c7351",
  leafTilt: ECHINACEA_LEAF_TILT,
  nodes: [
    { t: 0.12, angle: 0.2, scale: 1 },
    { t: 0.2, angle: 2.6, scale: 0.93 },
    { t: 0.36, angle: 4.8, scale: 0.81 },
    { t: 0.55, angle: 0.9, scale: 0.65 },
    { t: 0.71, angle: 3.3, scale: 0.46 },
  ],
};
export const echinaceaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.13,
  headCenter: ECHINACEA_HEAD_CENTER,
  headTilt: 0,
  stemLength: 2.35,
  stemRadius: 0.032,
  leafCount: 5,
  previewScale: 1.02,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.22, -2.43, -1.22], max: [1.22, 0.67, 1.22] },
};
function EchinaceaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={EchinaceaLeaf} />
  );
}
function EchinaceaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="echinacea" model={ECHINACEA_MODEL} />
  );
}
export function Echinacea(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="echinacea"
      structure={echinaceaStructure}
      Organs={EchinaceaOrgans}
      StemComponent={EchinaceaStem}
    />
  );
}
