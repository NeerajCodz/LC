import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const lotusStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.32,
  stemLength: 2,
  stemRadius: 0.033,
  leafShape: "round",
  leafCount: 1,
  center: "pod",
  centerRadius: 0.25,
  centerHeight: 0.51,
  roughness: 0.44,
  sheen: 0.55,
  layers: [
    whorl(
      9,
      0.07,
      -0.07,
      1.24,
      {
        length: 1.12,
        width: 0.78,
        cup: 0.06,
        curl: 0.03,
        edge: 0.1,
        taper: 0.58,
        thickness: 0.011,
      },
      { offset: 0.2 },
    ),
    whorl(
      8,
      0.075,
      0,
      1.08,
      {
        length: 0.99,
        width: 0.7,
        cup: 0.06,
        curl: 0.04,
        edge: 0.1,
        taper: 0.58,
        thickness: 0.012,
      },
      { offset: 0.56, delay: 0.05 },
    ),
    whorl(
      7,
      0.105,
      0.06,
      0.95,
      {
        length: 0.85,
        width: 0.62,
        cup: 0.08,
        curl: 0.03,
        edge: 0.1,
        taper: 0.58,
        thickness: 0.012,
      },
      { offset: 0.1, delay: 0.12 },
    ),
  ],
};
export function Lotus(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="lotus" structure={lotusStructure} />;
}
