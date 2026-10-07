import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { SNAPDRAGON_MODEL } from "./snapdragonGeometry";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
const anatomy: StemAnatomy = {
  color: "#658348",
  nodes: [
    { t: 0.22, angle: 0 },
    { t: 0.22, angle: Math.PI },
    { t: 0.4, angle: 0.7 },
    { t: 0.4, angle: Math.PI + 0.7 },
    { t: 0.57, angle: 2.3 },
    { t: 0.72, angle: 4.7 },
  ],
};
function SnapdragonStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
export const snapdragonStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.2,
  headCenter: [0, 0.1, 0.24],
  headTilt: 0,
  stemLength: 2.4,
  stemRadius: 0.025,
  leafCount: 6,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  previewScale: 1.12,
};
function SnapdragonOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="snapdragon" model={SNAPDRAGON_MODEL} />
  );
}
export function Snapdragon(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="snapdragon"
      structure={snapdragonStructure}
      Organs={SnapdragonOrgans}
      StemComponent={SnapdragonStem}
    />
  );
}
