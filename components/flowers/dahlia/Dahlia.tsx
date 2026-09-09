import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const dahliaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.65,
  leafShape: "serrated",
  roughness: 0.61,
  sheen: 0.65,
  layers: Array.from({ length: 13 }, (_, i) =>
    whorl(
      27 - i,
      0.2 - i * 0.014,
      -0.15 + i * 0.043,
      1.52 - i * 0.11,
      {
        length: 0.96 - i * 0.06,
        width: 0.27 - i * 0.015,
        cup: 0.03,
        curl: 0.025,
        edge: 0.12 - i * 0.007,
        taper: 0.52,
        roundness: 0.2,
        thickness: 0.012,
        ripple: 0.004,
      },
      { offset: i * 2.399, delay: i * 0.013, variation: 0.08 },
    ),
  ),
};
export function Dahlia(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="dahlia" structure={dahliaStructure} />;
}
