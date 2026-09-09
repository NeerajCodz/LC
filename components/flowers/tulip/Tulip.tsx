import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const tulipStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.17,
  stemLength: 2.35,
  stemRadius: 0.037,
  leafCount: 2,
  roughness: 0.43,
  sheen: 0.65,
  center: "stamens",
  centerRadius: 0.13,
  centerHeight: 0.25,
  layers: [
    whorl(
      3,
      0.09,
      0,
      0.24,
      {
        length: 1.28,
        width: 1.03,
        cup: 0.14,
        curl: 0.04,
        edge: 0.27,
        roundness: 1,
        taper: 0.58,
        thickness: 0.02,
      },
      { offset: 0.24, variation: 0.06 },
    ),
    whorl(
      3,
      0.07,
      0.035,
      0.13,
      {
        length: 1.24,
        width: 1,
        cup: 0.15,
        curl: 0.06,
        edge: 0.26,
        roundness: 1,
        taper: 0.58,
        thickness: 0.021,
      },
      { offset: Math.PI / 3 + 0.24, delay: 0.06, variation: 0.04 },
    ),
  ],
};
export function Tulip(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="tulip" structure={tulipStructure} />;
}
