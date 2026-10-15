import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "@/components/flowers/FlowerPlant";
import { SpecimenAssembly } from "@/components/flowers/SpecimenAssembly";
import {
  BotanicalStem,
  type StemAnatomy,
} from "@/components/flowers/BotanicalStem";
import type { StemProps } from "@/components/flowers/Stem";
import type { FlowerOrgansProps } from "@/components/flowers/FloralParts";
import {
  LOBELIA_MODEL,
  LOBELIA_STALKS,
  LOBELIA_HEAD_CENTER,
} from "@/components/flowers/lobelia/lobeliaGeometry";
import { LOBELIA_LEAF_TILT } from "@/components/flowers/lobelia/lobeliaLeaf";
import { LobeliaLowerLeaf, LobeliaRacemeFoliage } from "./LobeliaFoliage";
export const lobeliaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.06,
  headCenter: LOBELIA_HEAD_CENTER,
  headTilt: 0,
  stemLength: 1.18,
  stemRadius: 0.016,
  leafCount: 12,
  previewScale: 1.08,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-0.94, -1.32, -0.53], max: [0.94, 1.13, 0.99] },
};
const anatomy: StemAnatomy = {
  color: "#7b9766",
  leafTilt: LOBELIA_LEAF_TILT,
  headExtras: LOBELIA_STALKS,
  nodes: [0.26, 0.44, 0.61].map((t, i) => ({
    t,
    angle: i * 2.399963229728653,
    scale: 1 - i * 0.09,
  })),
};
function LobeliaStem(props: StemProps) {
  return (
    <group>
      <BotanicalStem
        {...props}
        anatomy={anatomy}
        LeafComponent={LobeliaLowerLeaf}
      />
      {props.leaves && <LobeliaRacemeFoliage {...props} />}
    </group>
  );
}
function LobeliaOrgans(props: FlowerOrgansProps) {
  return (
    <group>
      <SpecimenAssembly {...props} type="lobelia" model={LOBELIA_MODEL} />
    </group>
  );
}
export function Lobelia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="lobelia"
      structure={lobeliaStructure}
      Organs={LobeliaOrgans}
      StemComponent={LobeliaStem}
    />
  );
}
