import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  HOLLYHOCK_MODEL,
  HOLLYHOCK_FLOWER_POSITIONS,
} from "./hollyhockGeometry";
import { HollyhockLeaf } from "./HollyhockFoliage";
export const hollyhockStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.52,
  headCenter: [0, 1.09, 0.09],
  headTilt: 0,
  stemLength: 2.3,
  stemRadius: 0.038,
  leafCount: 12,
  previewScale: 1.29,
  portraitBounds: { min: [-0.92, -2.35, -0.98], max: [0.92, 2.58, 0.98] },
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#77854f",
  leafTilt: -0.82,
  nodes: [
    { t: 0.09, angle: 0.1, scale: 0.91 },
    { t: 0.25, angle: 2.499, scale: 0.87 },
    { t: 0.43, angle: 4.898, scale: 0.77 },
    { t: 0.58, angle: 1.014, scale: 0.65 },
    { t: 0.74, angle: 3.413, scale: 0.55 },
  ],
};
function HollyhockStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={HollyhockLeaf} />
  );
}
function HollyhockOrgans(props: FlowerOrgansProps) {
  return (
    <group>
      <SpecimenAssembly {...props} type="hollyhock" model={HOLLYHOCK_MODEL} />
      {props.leaves &&
        HOLLYHOCK_FLOWER_POSITIONS.map((p, i) => (
          <group
            key={i}
            position={[0, p[1] - 0.023, 0]}
            rotation={[-0.82, i * 2.399963229728653, 0.1]}
            scale={i < 5 ? 0.45 - i * 0.043 : 0.15 - (i - 5) * 0.025}
          >
            <HollyhockLeaf quality={props.quality} />
          </group>
        ))}
    </group>
  );
}
export function Hollyhock(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="hollyhock"
      structure={hollyhockStructure}
      Organs={HollyhockOrgans}
      StemComponent={HollyhockStem}
    />
  );
}
