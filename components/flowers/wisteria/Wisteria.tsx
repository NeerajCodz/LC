import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  WISTERIA_MODEL,
  WISTERIA_SHOOT_POINTS,
  WISTERIA_STEM_LENGTH,
  WISTERIA_SUPPORT_HEIGHT,
} from "./wisteriaGeometry";
import { WisteriaLeaf } from "./WisteriaFoliage";
import { WISTERIA_LEAF_TILT } from "./wisteriaLeaf";

export const wisteriaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.34,
  portraitBounds: { min: [-1.3, -3.44, -1.3], max: [1.3, 0.6, 1.3] },
  headCenter: [0, -0.82, 0.03],
  previewScale: 1.5,
  headTilt: 0,
  stemLength: WISTERIA_STEM_LENGTH,
  stemRadius: 0.027,
  supportHeight: WISTERIA_SUPPORT_HEIGHT,
  leafCount: 3,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  axis: false,
  color: "#796e54",
  leafTilt: WISTERIA_LEAF_TILT,
  nodes: [0.43, 0.61, 0.79].map((t, i) => {
    const point = WISTERIA_SHOOT_POINTS[Math.round(t * 84)];
    return {
      t,
      angle: -i * 1.1 - 0.7,
      scale: 0.73,
      offset: [point[0] - 0.025 * Math.sin(t * Math.PI), 0, point[2]] as [
        number,
        number,
        number,
      ],
    };
  }),
  extras: [
    {
      points: WISTERIA_SHOOT_POINTS,
      radius: 0.035,
      endRadius: 0.018,
      color: "#807154",
    },
  ],
};
function WisteriaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={WisteriaLeaf} />
  );
}
function WisteriaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="wisteria" model={WISTERIA_MODEL} />;
}
export function Wisteria(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="wisteria"
      structure={wisteriaStructure}
      Organs={WisteriaOrgans}
      StemComponent={WisteriaStem}
    />
  );
}
