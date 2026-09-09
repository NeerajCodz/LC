import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const cherryBlossomStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.72,
  stemLength: 1.9,
  stemRadius: 0.028,
  leafCount: 1,
  center: "stamens",
  centerRadius: 0.1,
  centerHeight: 0.06,
  roughness: 0.61,
  sheen: 0.65,
  layers: [
    whorl(
      5,
      0.025,
      0,
      1.13,
      {
        length: 0.59,
        width: 0.48,
        cup: 0.035,
        curl: 0.03,
        edge: 0.055,
        roundness: 1,
        taper: 0.5,
        notch: 0.095,
        ripple: 0.008,
        thickness: 0.009,
      },
      { variation: 0.08 },
    ),
  ],
  blossoms: [
    { position: [0, 0.1, 0], rotation: [0.1, 0, 0], scale: 1 },
    { position: [-0.53, -0.16, 0.1], rotation: [0.22, 0.3, 0.16], scale: 0.77 },
    { position: [0.56, -0.16, -0.02], rotation: [-0.22, 0, -0.1], scale: 0.9 },
  ],
};
export function CherryBlossom(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="cherry-blossom"
      structure={cherryBlossomStructure}
    />
  );
}
