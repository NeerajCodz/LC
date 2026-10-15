import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { IMPATIENS_MODEL, IMPATIENS_STALKS } from "./impatiensGeometry";
import { ImpatiensLeaf } from "./ImpatiensFoliage";
export const impatiensStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.18,
  portraitBounds: { min: [-1.1, -1.39, -0.88], max: [1.1, 1.47, 0.95] },
  headCenter: [0.04, 0.58, 0.09],
  headTilt: 0,
  stemLength: 1.32,
  stemRadius: 0.041,
  leafCount: 6,
  previewScale: 1.12,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#83926a",
  leafTilt: 0.88,
  headExtras: IMPATIENS_STALKS,
  nodes: [0.24, 0.37, 0.5, 0.63, 0.75, 0.88].map((t, i) => ({
    t,
    angle: i * 2.399963229728653,
    scale: 0.95 - i * 0.075,
  })),
  extras: [0.37, 0.63, 0.88].map((t, i) => ({
    points: [
      [0, -1.32 + t * 1.32, 0],
      [0.07 * Math.cos(i * 2.4), -1.29 + t * 1.32, 0.07 * Math.sin(i * 2.4)],
      [0.085 * Math.cos(i * 2.4), -1.27 + t * 1.32, 0.085 * Math.sin(i * 2.4)],
    ] as [number, number, number][],
    radius: 0.008,
    endRadius: 0.01,
    color: "#b3aa78",
  })),
};
function ImpatiensStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={ImpatiensLeaf} />
  );
}
function ImpatiensOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="impatiens" model={IMPATIENS_MODEL} />
  );
}
export function Impatiens(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="impatiens"
      structure={impatiensStructure}
      Organs={ImpatiensOrgans}
      StemComponent={ImpatiensStem}
    />
  );
}
