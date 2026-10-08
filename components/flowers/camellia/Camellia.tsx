import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { CAMELLIA_MODEL, CAMELLIA_STALKS } from "./camelliaGeometry";
import { CamelliaLeaf } from "./CamelliaFoliage";
const anatomy: StemAnatomy = {
  color: "#80674e",
  leafTilt: -1.12,
  nodes: [
    { t: 0.18, angle: 0 },
    { t: 0.34, angle: 2.399963 },
    { t: 0.53, angle: 4.799926 },
    { t: 0.7, angle: 0.9, scale: 0.7 },
  ],
  extras: CAMELLIA_STALKS,
};
function CamelliaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={CamelliaLeaf} />
  );
}
export const camelliaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.4,
  headCenter: [0.08, 0.37, 0.03],
  headTilt: 0,
  stemLength: 1.95,
  stemRadius: 0.065,
  leafCount: 4,
  previewScale: 1.08,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function CamelliaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="camellia" model={CAMELLIA_MODEL} />;
}
export function Camellia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="camellia"
      structure={camelliaStructure}
      Organs={CamelliaOrgans}
      StemComponent={CamelliaStem}
    />
  );
}
