import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { useMemo, useRef } from "react";
import { Group } from "three";
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
  TORENIA_STALKS,
  TORENIA_HEAD_CENTER,
} from "@/components/flowers/torenia/toreniaGeometry";
import { TORENIA_LEAF_TILT } from "@/components/flowers/torenia/toreniaLeaf";
import { ToreniaLeaf } from "./ToreniaFoliage";
import { TORENIA_RENDER_MODEL } from "@/components/flowers/torenia/toreniaStigmaGeometry";
import { ToreniaStigmas, ToreniaStigmaControls } from "./ToreniaStigmas";
export const toreniaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.12,
  headCenter: TORENIA_HEAD_CENTER,
  headTilt: 0,
  stemLength: 1.46,
  stemRadius: 0.023,
  leafCount: 6,
  previewScale: 1.08,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
  portraitBounds: { min: [-1.11, -1.59, -0.52], max: [1.11, 1.06, 1.0] },
};
const anatomy: StemAnatomy = {
  color: "#7f9960",
  leafTilt: TORENIA_LEAF_TILT,
  headExtras: TORENIA_STALKS,
  nodes: [0.25, 0.49, 0.75].flatMap((t, i) =>
    [0, Math.PI].map((side) => ({
      t,
      angle: side + ((i % 2) * Math.PI) / 2,
      scale: 1 - i * 0.12,
    })),
  ),
  extras: [0, Math.PI / 2, Math.PI, Math.PI * 1.5].map((a) => ({
    points: [
      [Math.cos(a) * 0.022, -1.46, Math.sin(a) * 0.022],
      [Math.cos(a) * 0.02, -0.68, Math.sin(a) * 0.02],
      [Math.cos(a) * 0.016, 0, Math.sin(a) * 0.016],
    ] as Vec3[],
    radius: 0.005,
    endRadius: 0.003,
    color: "#8da76b",
  })),
};
function ToreniaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={ToreniaLeaf} />
  );
}
function ToreniaOrgans(props: FlowerOrgansProps) {
  const organs = useRef<Group>(null);
  return (
    <group ref={organs}>
      <SpecimenAssembly
        {...props}
        type="torenia"
        model={TORENIA_RENDER_MODEL}
        raycastCages
      />
      <ToreniaStigmas {...props} organs={organs} />
    </group>
  );
}
export function Torenia(props: Omit<FlowerProps, "type">) {
  const controls = useMemo(
    () => ({
      paused: props.paused ?? false,
      interactive: props.interactive ?? false,
    }),
    [props.paused, props.interactive],
  );
  return (
    <ToreniaStigmaControls.Provider value={controls}>
      <FlowerPlant
        {...props}
        type="torenia"
        structure={toreniaStructure}
        Organs={ToreniaOrgans}
        StemComponent={ToreniaStem}
      />
    </ToreniaStigmaControls.Provider>
  );
}
