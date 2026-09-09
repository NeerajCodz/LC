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
  centerRadius: 0.23,
  centerHeight: 0.52,
  roughness: 0.44,
  sheen: 0.55,
  layers: [
    whorl(
      9,
      0.22,
      -0.07,
      1.12,
      {
        length: 1.02,
        width: 0.58,
        cup: 0.06,
        curl: 0.03,
        edge: 0.14,
        taper: 0.8,
        thickness: 0.023,
      },
      { offset: 0.2 },
    ),
    whorl(
      8,
      0.17,
      0,
      0.83,
      {
        length: 0.99,
        width: 0.58,
        cup: 0.06,
        curl: 0.04,
        edge: 0.14,
        taper: 0.75,
        thickness: 0.022,
      },
      { offset: 0.56, delay: 0.05 },
    ),
    whorl(
      7,
      0.13,
      0.06,
      0.54,
      {
        length: 0.85,
        width: 0.49,
        cup: 0.08,
        curl: 0.03,
        edge: 0.1,
        taper: 0.8,
        thickness: 0.021,
      },
      { offset: 0.1, delay: 0.12 },
    ),
  ],
};
export function Lotus(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="lotus" structure={lotusStructure} />;
}
