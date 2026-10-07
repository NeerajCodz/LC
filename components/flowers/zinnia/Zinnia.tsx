import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { ZINNIA_MODEL, ZINNIA_STALKS } from "./zinniaGeometry";
import { ZinniaLeaf } from "./ZinniaFoliage";
const anatomy: StemAnatomy = {
  leafTilt: -1.12,
  color: "#65824b",
  nodes: [
    { t: 0.22, angle: 0, scale: 1.0 },
    { t: 0.22, angle: 3.141592653589793, scale: 1.0 },
    { t: 0.48, angle: 0, scale: 0.909 },
    { t: 0.48, angle: 3.141592653589793, scale: 0.909 },
    { t: 0.73, angle: 0, scale: 0.8215 },
    { t: 0.73, angle: 3.141592653589793, scale: 0.8215 },
  ],
  extras: ZINNIA_STALKS,
};
function ZinniaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={ZinniaLeaf} />
  );
}
export const zinniaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.11,
  headCenter: [0, 0.06, 0.075],
  headTilt: 0,
  stemLength: 1.85,
  stemRadius: 0.029,
  leafCount: 6,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function ZinniaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="zinnia" model={ZINNIA_MODEL} />;
}
export function Zinnia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="zinnia"
      structure={zinniaStructure}
      Organs={ZinniaOrgans}
      StemComponent={ZinniaStem}
    />
  );
}
