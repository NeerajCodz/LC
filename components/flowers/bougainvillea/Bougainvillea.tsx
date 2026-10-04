import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { BOUGAINVILLEA_MODEL } from "./bougainvilleaGeometry";
export const bougainvilleaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.35,
  headCenter: [0, 0.6, 0.1],
  previewScale: 1.14,
  headTilt: 0,
  stemLength: 2.6,
  stemRadius: 0.032,
  leafCount: 4,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#8b805d",
  nodes: [0.18, 0.37, 0.55, 0.72].map((t, i) => ({
    t,
    angle: i * 2.4,
    scale: 0.95 - i * 0.06,
  })),
  extras: [0.18, 0.37, 0.55, 0.72].map((t, i) => {
    const sign = i % 2 ? 1 : -1;
    return {
      points: [
        [0, -2.6 + 2.6 * t, 0],
        [sign * 0.07, -2.6 + 2.6 * t + 0.04, 0.025],
        [sign * 0.16, -2.6 + 2.6 * t + 0.13, 0.025],
      ] as Vec3[],
      radius: 0.019,
      endRadius: 0.0008,
      color: "#8c7558",
    };
  }),
};
function BougainvilleaStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
function BougainvilleaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="bougainvillea"
      model={BOUGAINVILLEA_MODEL}
    />
  );
}
export function Bougainvillea(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="bougainvillea"
      structure={bougainvilleaStructure}
      Organs={BougainvilleaOrgans}
      StemComponent={BougainvilleaStem}
    />
  );
}
