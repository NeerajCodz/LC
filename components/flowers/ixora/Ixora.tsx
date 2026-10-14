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
  IXORA_MODEL,
  IXORA_STALKS,
  IXORA_HEAD_CENTER,
} from "@/components/flowers/ixora/ixoraGeometry";
import { IXORA_LEAF_TILT } from "@/components/flowers/ixora/ixoraLeaf";
import { IxoraLeaf, IxoraNode } from "./IxoraFoliage";
export const ixoraStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.18,
  headCenter: IXORA_HEAD_CENTER,
  headTilt: 0,
  cameraElevation: Math.PI / 4,
  stemLength: 1.94,
  stemRadius: 0.038,
  leafCount: 8,
  previewScale: 1.08,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.24, -2.08, -1.24], max: [1.24, 1.21, 1.24] },
};
const anatomy: StemAnatomy = {
  color: "#867253",
  leafTilt: IXORA_LEAF_TILT,
  headExtras: IXORA_STALKS,
  nodes: [0.23, 0.43, 0.64, 0.82].flatMap((t, i) =>
    [0, Math.PI].map((side) => ({
      t,
      angle: side + ((i % 2) * Math.PI) / 2,
      scale: 1 - i * 0.075,
    })),
  ),
};
function IxoraStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={IxoraLeaf}
      NodeDecorationComponent={IxoraNode}
    />
  );
}
function IxoraOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="ixora" model={IXORA_MODEL} />;
}
export function Ixora(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="ixora"
      structure={ixoraStructure}
      Organs={IxoraOrgans}
      StemComponent={IxoraStem}
    />
  );
}
