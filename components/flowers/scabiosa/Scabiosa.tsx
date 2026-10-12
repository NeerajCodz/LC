import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { SCABIOSA_MODEL, SCABIOSA_HEAD_CENTER } from "./scabiosaGeometry";
import { ScabiosaLeaf, ScabiosaBasalFoliage } from "./ScabiosaFoliage";
import { SCABIOSA_LEAF_TILT } from "./scabiosaLeaf";

export const scabiosaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 0.94,
  headCenter: SCABIOSA_HEAD_CENTER,
  previewScale: 1.03,
  headTilt: 0,
  stemLength: 2.42,
  stemRadius: 0.022,
  leafCount: 8,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const anatomy: StemAnatomy = {
  color: "#789666",
  leafTilt: SCABIOSA_LEAF_TILT,
  nodes: [0.24, 0.47, 0.69].flatMap((t, i) =>
    [0, Math.PI].map((side) => ({
      t,
      angle: side + i * 0.44,
      scale: 0.94 - i * 0.1,
    })),
  ),
};
function ScabiosaStem(props: StemProps) {
  return (
    <group>
      <BotanicalStem
        {...props}
        anatomy={anatomy}
        LeafComponent={ScabiosaLeaf}
      />
      {props.leaves && <ScabiosaBasalFoliage {...props} />}
    </group>
  );
}
function ScabiosaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="scabiosa" model={SCABIOSA_MODEL} />;
}
export function Scabiosa(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="scabiosa"
      structure={scabiosaStructure}
      Organs={ScabiosaOrgans}
      StemComponent={ScabiosaStem}
    />
  );
}
