import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { HELLEBORE_MODEL } from "./helleboreGeometry";
import { HelleboreLeaf } from "./HelleboreFoliage";
const anatomy: StemAnatomy = {
  color: "#65805b",
  leafTilt: -1.1,
  nodes: [
    { t: 0.18, angle: 0, scale: 0.95 },
    { t: 0.24, angle: 2.4, scale: 0.9 },
    { t: 0.17, angle: 4.8, scale: 0.85 },
  ],
  extras: HELLEBORE_MODEL.clusters.map((c) => ({
    points: [
      [0, -0.05, 0],
      [c.position[0] * 0.65, 0.15 + c.position[1] * 0.65, c.position[2] * 0.65],
      c.position,
    ] as Vec3[],
    radius: 0.02,
    endRadius: 0.014,
    color: "#778665",
  })),
};
function HelleboreStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={HelleboreLeaf} />
  );
}
export const helleboreStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.15,
  headCenter: [0, 0.3, 0.18],
  headTilt: 0,
  stemLength: 1.9,
  stemRadius: 0.028,
  leafCount: 3,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  previewScale: 1.1,
};
function HelleboreOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="hellebore" model={HELLEBORE_MODEL} />
  );
}
export function Hellebore(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="hellebore"
      structure={helleboreStructure}
      Organs={HelleboreOrgans}
      StemComponent={HelleboreStem}
    />
  );
}
