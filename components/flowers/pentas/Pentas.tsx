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
  PENTAS_MODEL,
  PENTAS_STALKS,
  PENTAS_HEAD_CENTER,
} from "@/components/flowers/pentas/pentasGeometry";
import { PENTAS_LEAF_TILT } from "@/components/flowers/pentas/pentasLeaf";
import { PentasLeaf, PentasNode } from "./PentasFoliage";
export const pentasStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.2,
  headCenter: PENTAS_HEAD_CENTER,
  headTilt: 0,
  stemLength: 1.98,
  stemRadius: 0.029,
  leafCount: 8,
  previewScale: 1.09,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.28, -2.1, -1.28], max: [1.28, 1.1, 1.28] },
};
const anatomy: StemAnatomy = {
  color: "#819360",
  leafTilt: PENTAS_LEAF_TILT,
  headExtras: PENTAS_STALKS,
  nodes: [0.23, 0.44, 0.64, 0.82].flatMap((t, i) =>
    [0, Math.PI].map((side) => ({
      t,
      angle: side + ((i % 2) * Math.PI) / 2,
      scale: 1 - i * 0.08,
    })),
  ),
};
function PentasStem(props: StemProps) {
  return (
    <BotanicalStem
      {...props}
      anatomy={anatomy}
      LeafComponent={PentasLeaf}
      NodeDecorationComponent={PentasNode}
    />
  );
}
function PentasOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="pentas" model={PENTAS_MODEL} />;
}
export function Pentas(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="pentas"
      structure={pentasStructure}
      Organs={PentasOrgans}
      StemComponent={PentasStem}
    />
  );
}
