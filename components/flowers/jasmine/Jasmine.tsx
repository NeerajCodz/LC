import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE, whorl } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
export const jasmineStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  headTilt: 0.7,
  stemRadius: 0.02,
  leafCount: 3,
  center: "stamens",
  centerRadius: 0.035,
  centerHeight: 0.015,
  layers: [
    whorl(
      5,
      0.025,
      0,
      1.25,
      {
        length: 0.53,
        width: 0.25,
        cup: 0.01,
        curl: 0.07,
        edge: 0.035,
        taper: 0.65,
        thickness: 0.007,
        twist: 0.02,
      },
      { variation: 0.1 },
    ),
  ],
  blossoms: [
    { position: [0, 0.25, 0], rotation: [0, 0, 0], scale: 1 },
    { position: [-0.52, -0.05, 0.18], rotation: [0.16, 0, 0.2], scale: 0.82 },
    { position: [0.5, 0.02, 0.08], rotation: [-0.06, 0, -0.28], scale: 0.9 },
    { position: [-0.25, 0.01, -0.43], rotation: [-0.24, 0, 0.14], scale: 0.7 },
    { position: [0.28, -0.18, 0.49], rotation: [0.33, 0, -0.16], scale: 0.65 },
  ],
};
export function Jasmine(props: Omit<FlowerProps, "type">) {
  return <FlowerPlant {...props} type="jasmine" structure={jasmineStructure} />;
}
