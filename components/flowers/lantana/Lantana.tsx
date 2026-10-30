import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "@/components/flowers/FlowerPlant";
import { SpecimenAssembly } from "@/components/flowers/SpecimenAssembly";
import type { FlowerOrgansProps } from "@/components/flowers/FloralParts";
import { LANTANA_MODEL, LANTANA_HEAD_CENTER } from "./lantanaGeometry";
import { LantanaStem } from "./LantanaStem";
import { LANTANA_SHOOT_LENGTH } from "./lantanaLeaf";
export const lantanaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.3,
  headCenter: LANTANA_HEAD_CENTER,
  headTilt: 0,
  cameraElevation: Math.PI / 4,
  stemLength: LANTANA_SHOOT_LENGTH,
  stemRadius: 0.032,
  leafCount: 8,
  previewScale: 1.03,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.3, -1.92, -0.91], max: [1.3, 0.72, 0.96] },
};
function LantanaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="lantana" model={LANTANA_MODEL} />;
}
export function Lantana(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="lantana"
      structure={lantanaStructure}
      Organs={LantanaOrgans}
      StemComponent={LantanaStem}
    />
  );
}
