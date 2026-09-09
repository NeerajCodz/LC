import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const daisyStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.7,
  stemRadius: 0.021,
  leafCount: 2,
  center: "florets",
  centerRadius: 0.26,
  centerHeight: 0.09,
  roughness: 0.65,
  sheen: 0.5,
  layers: [
    whorl(
      23,
      0.22,
      0.015,
      1.36,
      {
        length: 0.68,
        width: 0.17,
        cup: 0.01,
        curl: 0.06,
        edge: 0.017,
        taper: 0.5,
        roundness: 0.8,
        ripple: 0.004,
        thickness: 0.007,
      },
      { variation: 0.18 },
    ),
    whorl(
      17,
      0.21,
      -0.015,
      1.44,
      {
        length: 0.62,
        width: 0.155,
        cup: 0.025,
        curl: 0.06,
        edge: 0.017,
        taper: 0.5,
        roundness: 0.8,
        ripple: 0.004,
        thickness: 0.007,
      },
      { offset: 0.16, delay: 0.04 },
    ),
  ],
};
export function Daisy(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="daisy" structure={daisyStructure} />;
}
