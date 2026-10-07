import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { ZINNIA_MODEL, ZINNIA_STALKS } from "./zinniaGeometry";
import { ZinniaLeaf } from "./ZinniaFoliage";
export const zinniaAnatomy: StemAnatomy = {
  leafTilt: -1.12,
  color: "#65824b",
  nodes: [
    { t: 0.18, angle: 0, scale: 1.0 },
    { t: 0.18, angle: 3.141592653589793, scale: 1.0 },
    { t: 0.34, angle: 0, scale: 0.94 },
    { t: 0.34, angle: 3.141592653589793, scale: 0.94 },
    { t: 0.49, angle: 0, scale: 0.87 },
    { t: 0.49, angle: 3.141592653589793, scale: 0.87 },
  ],
  extras: ZINNIA_STALKS,
};
function ZinniaStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={zinniaAnatomy}
      LeafComponent={ZinniaLeaf}
    />
  );
}
export const zinniaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.11,
  headCenter: [0, 0.06, 0.075],
  headTilt: 0,
  stemLength: 2.45,
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
