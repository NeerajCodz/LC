import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const hibiscusStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.75,
  leafShape: "serrated",
  center: "column",
  centerRadius: 0.085,
  centerHeight: 0.6,
  roughness: 0.64,
  sheen: 0.5,
  layers: [
    whorl(
      5,
      0.06,
      0,
      1.15,
      {
        length: 1.2,
        width: 1.15,
        cup: 0.05,
        curl: 0.1,
        edge: 0.15,
        ripple: 0.045,
        roundness: 1,
        taper: 0.4,
        twist: 0.1,
        thickness: 0.011,
      },
      { variation: 0.13, offset: 0.2 },
    ),
  ],
};
export function Hibiscus(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant {...props} type="hibiscus" structure={hibiscusStructure} />
  );
}
