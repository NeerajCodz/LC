import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const lavenderStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.1,
  stemLength: 2.1,
  stemRadius: 0.012,
  leafShape: "needle",
  leafCount: 5,
  roughness: 0.79,
  sheen: 0.3,
  layers: Array.from({ length: 12 }, (_, i) =>
    whorl(
      7,
      0.065 - (i / 12) * 0.035,
      i * 0.08,
      0.98,
      {
        length: 0.18 - i * 0.006,
        width: 0.09 - i * 0.003,
        cup: 0.15,
        curl: 0.04,
        edge: 0.035,
        roundness: 0.9,
        taper: 0.45,
        thickness: 0.008,
      },
      {
        offset: i * 2.399,
        delay: i * 0.018,
        variation: 0.16,
        color: i > 8 ? "#8a75a9" : undefined,
      },
    ),
  ),
  blossoms: [
    { position: [0, -0.1, 0], rotation: [0, 0, 0], scale: 1 },
    { position: [-0.39, -0.38, 0.02], rotation: [0, 0, 0.21], scale: 0.84 },
    { position: [0.39, -0.53, -0.04], rotation: [0, 0, -0.2], scale: 0.79 },
    {
      position: [0.18, -0.25, -0.27],
      rotation: [-0.12, 0, -0.12],
      scale: 0.87,
    },
  ],
};
export function Lavender(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant {...props} type="lavender" structure={lavenderStructure} />
  );
}
