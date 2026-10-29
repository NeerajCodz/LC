import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { SALVIA_MODEL, SALVIA_HEAD_CENTER } from "./salviaGeometry";
import { SALVIA_FOLIAGE_NODES, SALVIA_LEAF_TILT } from "./salviaLeaf";
import { SalviaLeaf } from "./SalviaFoliage";
export const salviaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.02,
  headCenter: SALVIA_HEAD_CENTER,
  headTilt: 0,
  stemLength: 1.55,
  stemRadius: 0.026,
  leafCount: 8,
  previewScale: 1.12,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-0.9, -1.6, -0.9], max: [0.9, 1.64, 0.9] },
};
// Four narrow ridges give the mint-family shoot a quadrangular reading while sharing rooted deformation.
const anatomy: StemAnatomy = {
  color: "#78914e",
  leafTilt: SALVIA_LEAF_TILT,
  nodes: SALVIA_FOLIAGE_NODES,
  extras: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a) => ({
    points: [
      [Math.cos(a) * 0.024, -1.55, Math.sin(a) * 0.024],
      [Math.cos(a) * 0.024, -0.7, Math.sin(a) * 0.024],
      [Math.cos(a) * 0.022, 0, Math.sin(a) * 0.022],
    ] as Vec3[],
    radius: 0.005,
    endRadius: 0.003,
    color: "#8b9c60",
  })),
};
function SalviaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={SalviaLeaf} />
  );
}
function SalviaOrgans(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="salvia"
      model={SALVIA_MODEL}
      raycastCages
    />
  );
}
export function Salvia(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="salvia"
      structure={salviaStructure}
      Organs={SalviaOrgans}
      StemComponent={SalviaStem}
    />
  );
}
