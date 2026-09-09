import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const marigoldStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.45,
  leafShape: "serrated",
  leafCount: 4,
  roughness: 0.82,
  sheen: 0.45,
  layers: Array.from({ length: 11 }, (_, i) =>
    whorl(
      26 - i,
      0.21 - i * 0.016,
      -0.14 + i * 0.05,
      1.65 - i * 0.14,
      {
        length: 0.67 - i * 0.037,
        width: 0.22 - i * 0.011,
        cup: 0.08,
        curl: 0.17,
        edge: 0.07,
        ripple: 0.042,
        taper: 0.3,
        roundness: 1,
        twist: 0.095,
        thickness: 0.009,
      },
      {
        offset: i * 2.399,
        delay: i * 0.017,
        variation: 0.23,
        color: i % 3 === 0 ? "#e99015" : i % 3 === 1 ? "#f0ad22" : "#ed9c16",
      },
    ),
  ),
};
export function Marigold(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant {...props} type="marigold" structure={marigoldStructure} />
  );
}
