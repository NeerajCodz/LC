import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import {
  BOTTLEBRUSH_MODEL,
  BOTTLEBRUSH_STEM_LENGTH,
} from "./bottlebrushGeometry";
import { BottlebrushLeaf, BottlebrushUpperFoliage } from "./BottlebrushFoliage";
import {
  BOTTLEBRUSH_LEAF_TILT,
  BOTTLEBRUSH_STEM_LEAF_NODES,
} from "./bottlebrushLeaf";

export const bottlebrushStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.6,
  headCenter: [0, 0.89, 0],
  portraitBounds: { min: [-0.85, -2.9, -0.85], max: [0.85, 2.5, 0.85] },
  previewScale: 1.18,
  headTilt: 0,
  stemLength: BOTTLEBRUSH_STEM_LENGTH,
  stemRadius: 0.039,
  leafCount: 6,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#807354",
  leafTilt: BOTTLEBRUSH_LEAF_TILT,
  nodes: BOTTLEBRUSH_STEM_LEAF_NODES,
};
function BottlebrushStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={BottlebrushLeaf}
    />
  );
}
function BottlebrushOrgans(props: FlowerOrgansProps) {
  return (
    <group>
      <SpecimenAssembly
        {...props}
        type="bottlebrush"
        model={BOTTLEBRUSH_MODEL}
      />
      {props.leaves && <BottlebrushUpperFoliage quality={props.quality} />}
    </group>
  );
}
export function Bottlebrush(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="bottlebrush"
      structure={bottlebrushStructure}
      Organs={BottlebrushOrgans}
      StemComponent={BottlebrushStem}
    />
  );
}
