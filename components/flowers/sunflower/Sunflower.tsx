import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const sunflowerStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.95,
  stemLength: 2.2,
  stemRadius: 0.042,
  leafShape: "broad",
  leafCount: 3,
  center: "seeds",
  centerRadius: 0.51,
  centerHeight: 0.08,
  roughness: 0.7,
  sheen: 0.35,
  layers: [
    whorl(
      24,
      0.48,
      0,
      1.36,
      {
        length: 0.72,
        width: 0.21,
        cup: 0.01,
        curl: 0.09,
        edge: 0.05,
        taper: 0.75,
        ripple: 0.008,
      },
      { variation: 0.19 },
    ),
    whorl(
      21,
      0.47,
      0.025,
      1.26,
      {
        length: 0.64,
        width: 0.22,
        cup: 0.02,
        curl: 0.07,
        edge: 0.055,
        taper: 0.75,
        ripple: 0.009,
      },
      { offset: 0.14, delay: 0.04 },
    ),
    whorl(
      14,
      0.32,
      -0.08,
      1.5,
      {
        length: 0.44,
        width: 0.14,
        cup: 0.08,
        curl: 0.1,
        edge: 0.025,
        taper: 1.1,
        thickness: 0.014,
      },
      { color: "#445c26", offset: 0.2 },
    ),
  ],
};
export function Sunflower(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant {...props} type="sunflower" structure={sunflowerStructure} />
  );
}
