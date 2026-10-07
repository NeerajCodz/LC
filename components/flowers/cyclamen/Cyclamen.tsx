import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { CYCLAMEN_MODEL } from "./cyclamenGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import { CyclamenLeaf } from "./CyclamenFoliage";
const anatomy: StemAnatomy = {
  axis: false,
  leafTilt: -1.3,
  color: "#81675b",
  nodes: Array.from({ length: 6 }, (_, i) => ({
    t: 0.11 + (i % 2) * 0.045,
    angle: i * 2.399,
    scale: 0.86 + (i % 3) * 0.08,
    offset: [-Math.sin(i * 2.399) * 0.13, 0, -Math.cos(i * 2.399) * 0.13],
  })),
  extras: [
    ...CYCLAMEN_MODEL.organs.filter((o) => o.name === "curved flower stalk"),
    ...Array.from({ length: 6 }, (_, i) => ({
      points: [
        [0, -1.8, 0],
        [-Math.sin(i * 2.399) * 0.07, -1.7, -Math.cos(i * 2.399) * 0.07],
        [
          -Math.sin(i * 2.399) * 0.13 +
            0.025 * Math.sin((0.11 + (i % 2) * 0.045) * Math.PI),
          -1.8 + 1.8 * (0.11 + (i % 2) * 0.045),
          -Math.cos(i * 2.399) * 0.13,
        ],
      ] as import("@/lib/flowers/types").Vec3[],
      radius: 0.012,
      endRadius: 0.009,
      color: "#936f72",
    })),
  ],
};
const model = {
  ...CYCLAMEN_MODEL,
  organs: CYCLAMEN_MODEL.organs.filter((o) => o.name !== "curved flower stalk"),
};
function CyclamenStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={CyclamenLeaf} />
  );
}
export const cyclamenStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.18,
  headCenter: [0, 0.27, 0],
  headTilt: 0,
  stemLength: 1.8,
  stemRadius: 0.035,
  leafCount: 6,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function CyclamenOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="cyclamen" model={model} />;
}
export function Cyclamen(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="cyclamen"
      structure={cyclamenStructure}
      Organs={CyclamenOrgans}
      StemComponent={CyclamenStem}
    />
  );
}
