import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const peonyStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.5,
  leafShape: "broad",
  roughness: 0.7,
  sheen: 0.72,
  layers: [
    whorl(
      7,
      0.2,
      -0.14,
      1.1,
      {
        length: 1.05,
        width: 1.08,
        cup: 0.06,
        curl: 0.06,
        edge: 0.19,
        roundness: 1,
        ripple: 0.022,
      },
      { variation: 0.2 },
    ),
    whorl(
      9,
      0.16,
      -0.02,
      0.9,
      {
        length: 0.93,
        width: 0.85,
        cup: 0.08,
        curl: 0.04,
        edge: 0.18,
        roundness: 1,
        ripple: 0.032,
      },
      { offset: 0.37, variation: 0.2, delay: 0.03 },
    ),
    ...Array.from({ length: 8 }, (_, i) =>
      whorl(
        15 - i,
        0.12 - i * 0.012,
        0.05 + i * 0.043,
        0.87 - i * 0.11,
        {
          length: 0.76 - i * 0.06,
          width: 0.5 - i * 0.038,
          cup: 0.08,
          curl: 0.06,
          edge: 0.15,
          ripple: 0.037,
          roundness: 1,
          taper: 0.3,
          twist: 0.13,
          thickness: 0.01,
        },
        { offset: i * 2.399, variation: 0.3, delay: 0.07 + i * 0.015 },
      ),
    ),
  ],
};
export function Peony(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="peony" structure={peonyStructure} />;
}
