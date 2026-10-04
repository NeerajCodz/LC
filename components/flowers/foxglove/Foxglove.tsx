import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { FOXGLOVE_MODEL, foxgloveBell } from "./foxgloveGeometry";
export const foxgloveStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.4,
  headCenter: [0, -0.05, 0.4],
  previewScale: 1.32,
  headTilt: 0,
  stemLength: 3.15,
  stemRadius: 0.037,
  leafCount: 10,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#6c864d",
  nodes: [
    ...Array.from({ length: 7 }, (_, i) => ({
      t: 0.045 + i * 0.012,
      angle: i * 2.399,
      scale: 1 - i * 0.025,
    })),
    { t: 0.44, angle: 2.4, scale: 0.6 },
    { t: 0.64, angle: 5, scale: 0.4 },
    { t: 0.8, angle: 1.3, scale: 0.22 },
  ],
};
const model = {
  ...FOXGLOVE_MODEL,
  organs: [
    ...FOXGLOVE_MODEL.organs,
    ...Array.from({ length: 12 }, (_, cluster) =>
      Array.from({ length: 16 }, (_, i) => {
        const u = 0.45 + (i % 8) * 0.07,
          v = 0.62 + Math.floor(i / 8) * 0.19,
          p = foxgloveBell(u, v, 1),
          a = u * Math.PI * 2;
        return {
          name: "interior corolla hair",
          cluster: cluster + 1,
          fine: true,
          points: [
            p,
            [
              p[0] - Math.cos(a) * 0.012,
              p[1] - Math.sin(a) * 0.012,
              p[2] + 0.012,
            ],
            [
              p[0] - Math.cos(a) * 0.024,
              p[1] - Math.sin(a) * 0.024,
              p[2] + 0.02,
            ],
          ] as [number, number, number][],
          radius: 0.0015,
          endRadius: 0.0005,
          color: "#e8d5d6",
        };
      }),
    ).flat(),
  ],
};
function FoxgloveStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
function FoxgloveOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="foxglove" model={model} />;
}
export function Foxglove(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="foxglove"
      structure={foxgloveStructure}
      Organs={FoxgloveOrgans}
      StemComponent={FoxgloveStem}
    />
  );
}
