import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { TUBEROSE_MODEL } from "./tuberoseGeometry";
import { TUBEROSE_LEAF_TILT, TUBEROSE_FOLIAGE_NODES } from "./tuberoseLeaf";
import { TuberoseLeaf } from "./TuberoseFoliage";
export const tuberoseStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.19,
  headCenter: [0, 0.86, 0.08],
  headTilt: 0,
  stemLength: 2.15,
  stemRadius: 0.03,
  leafCount: 7,
  previewScale: 1.23,
  portraitBounds: { min: [-0.7, -2.2, -0.7], max: [0.7, 1.9, 0.7] },
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#78915a",
  leafTilt: TUBEROSE_LEAF_TILT,
  nodes: [
    ...TUBEROSE_FOLIAGE_NODES,
    { t: 0.45, angle: 0.85, scale: 0.18 },
    { t: 0.7, angle: 3.25, scale: 0.12 },
  ],
};
function TuberoseStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={TuberoseLeaf} />
  );
}
function TuberoseOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="tuberose" model={TUBEROSE_MODEL} />;
}
export function Tuberose(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="tuberose"
      structure={tuberoseStructure}
      Organs={TuberoseOrgans}
      StemComponent={TuberoseStem}
    />
  );
}
