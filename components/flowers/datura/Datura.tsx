import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import type { FlowerOrgansProps } from "../FloralParts";
import { DATURA_MODEL, DATURA_HEAD_CENTER } from "./daturaGeometry";
import { DaturaStem as SpeciesStem } from "./DaturaStem";
export const daturaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 0.65,
  headTilt: 0,
  stemLength: 1.65,
  stemRadius: 0.033,
  leafCount: 4,
  previewScale: 1.05,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.6, -1.85, -1.6], max: [1.6, 1.72, 1.6] },
  headCenter: DATURA_HEAD_CENTER,
};

function Organs(props: FlowerOrgansProps) {
  return (
    <SpecimenAssembly
      {...props}
      type="datura"
      model={DATURA_MODEL}
      raycastCages
    />
  );
}
export function Datura(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="datura"
      structure={daturaStructure}
      Organs={Organs}
      StemComponent={SpeciesStem}
    />
  );
}
