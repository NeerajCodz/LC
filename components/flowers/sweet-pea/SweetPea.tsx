import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { SWEET_PEA_MODEL } from "./sweetPeaGeometry";
export const sweetPeaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.25,
  headCenter: [0.08, 0.59, 0.2],
  previewScale: 1.16,
  headTilt: 0,
  stemLength: 2.7,
  stemRadius: 0.017,
  supportHeight: 0.7,
  leafCount: 3,
  calyx: false,
  airbornePollen: false,
};
const anatomy: StemAnatomy = {
  color: "#81a165",
  winged: true,
  stipules: true,
  nodes: [0.26, 0.48, 0.67].flatMap((t, i) => [
    { t, angle: i * 0.6, scale: 0.78 },
    { t, angle: Math.PI + i * 0.6, scale: 0.78 },
  ]),
  extras: [0.26, 0.48, 0.67].flatMap((t) =>
    [-1, 1].map((sign) => ({
      points: Array.from({ length: 38 }, (_, i): Vec3 => {
        const v = i / 37;
        return [
          sign * (0.03 + 0.36 * v),
          -2.7 + 2.7 * t + 0.12 * v + 0.065 * Math.sin(v * 19) * v * v,
          0.06 * Math.cos(v * 19) * v * v,
        ];
      }),
      radius: 0.0055,
      endRadius: 0.0025,
      color: "#97ae73",
    })),
  ),
};
function SweetPeaStem(props: StemProps) {
  return <BotanicalStem {...props} anatomy={anatomy} />;
}
function SweetPeaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly {...props} type="sweet-pea" model={SWEET_PEA_MODEL} />
  );
}
export function SweetPea(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="sweet-pea"
      structure={sweetPeaStructure}
      Organs={SweetPeaOrgans}
      StemComponent={SweetPeaStem}
    />
  );
}
