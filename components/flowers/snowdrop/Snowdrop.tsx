import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { SNOWDROP_MODEL, SNOWDROP_STALKS } from "./snowdropGeometry";
import { SnowdropLeaf } from "./SnowdropFoliage";
const anatomy: StemAnatomy = {
  axis: false,
  leafTilt: -0.12,
  color: "#718965",
  nodes: [
    {
      t: 0.045,
      angle: 0.12,
      offset: [-0.11599999999999999, 0, 0.025],
      scale: 0.92,
    },
    {
      t: 0.045,
      angle: 3.2615926535897932,
      offset: [-0.064, 0, 0.025],
      scale: 0.92,
    },
    { t: 0.045, angle: 0.12, offset: [0.0615, 0, 0.0175], scale: 1.0 },
    {
      t: 0.045,
      angle: 3.2615926535897932,
      offset: [0.11349999999999999, 0, 0.0175],
      scale: 1.0,
    },
    {
      t: 0.045,
      angle: 0.12,
      offset: [-0.020999999999999998, 0, -0.055],
      scale: 0.92,
    },
    {
      t: 0.045,
      angle: 3.2615926535897932,
      offset: [0.031, 0, -0.055],
      scale: 0.92,
    },
  ],
  extras: SNOWDROP_STALKS,
};
function SnowdropStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={SnowdropLeaf} />
  );
}
export const snowdropStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.02,
  headCenter: [0, 0.23, 0.1],
  headTilt: 0,
  stemLength: 1.65,
  stemRadius: 0.023,
  leafCount: 6,
  previewScale: 1.07,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
function SnowdropOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="snowdrop" model={SNOWDROP_MODEL} />;
}
export function Snowdrop(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="snowdrop"
      structure={snowdropStructure}
      Organs={SnowdropOrgans}
      StemComponent={SnowdropStem}
    />
  );
}
