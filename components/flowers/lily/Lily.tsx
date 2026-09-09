import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const lilyStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.8,
  leafCount: 4,
  center: "stamens",
  centerRadius: 0.3,
  centerHeight: 0.52,
  antherColor: "#a36c2e",
  layers: [
    whorl(
      3,
      0.08,
      0,
      0.87,
      {
        length: 1.35,
        width: 0.54,
        cup: 0.1,
        curl: 0.48,
        edge: 0.075,
        taper: 0.75,
        spots: 1,
        thickness: 0.015,
      },
      { offset: 0.3 },
    ),
    whorl(
      3,
      0.06,
      0.04,
      0.72,
      {
        length: 1.3,
        width: 0.65,
        cup: 0.1,
        curl: 0.5,
        edge: 0.1,
        taper: 0.65,
        spots: 1,
        thickness: 0.017,
      },
      { offset: Math.PI / 3 + 0.3, delay: 0.05 },
    ),
  ],
};
export function Lily(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="lily" structure={lilyStructure} />;
}
