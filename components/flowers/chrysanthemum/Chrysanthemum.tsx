import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const chrysanthemumStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.58,
  leafShape: "serrated",
  roughness: 0.74,
  sheen: 0.4,
  layers: Array.from({ length: 14 }, (_, i) =>
    whorl(
      30 - i,
      0.16 - i * 0.009,
      -0.14 + i * 0.045,
      1.7 - i * 0.12,
      {
        length: 1.06 - i * 0.064,
        width: 0.115 - i * 0.005,
        cup: 0.07,
        curl: 0.28 - i * 0.017,
        edge: 0.035,
        taper: 0.35,
        roundness: 0.7,
        ripple: 0.012,
        twist: 0.04,
        thickness: 0.008,
      },
      { offset: i * 2.399, delay: i * 0.012, variation: 0.17 },
    ),
  ),
};
export function Chrysanthemum(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="chrysanthemum"
      structure={chrysanthemumStructure}
    />
  );
}
