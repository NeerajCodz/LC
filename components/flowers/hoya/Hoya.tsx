import type { FlowerProps, FlowerStructure, Vec3 } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import { SpecimenAssembly } from "../SpecimenAssembly";
import { BotanicalStem, type StemAnatomy } from "../BotanicalStem";
import type { StemProps } from "../Stem";
import type { FlowerOrgansProps } from "../FloralParts";
import { HOYA_MODEL, HOYA_STALKS } from "./hoyaGeometry";
import { HoyaLeaf } from "./HoyaFoliage";

export const hoyaStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.04,
  portraitBounds: { min: [-1.0, -2.13, -0.92], max: [1.0, 0.95, 0.92] },
  headCenter: [0, 0.05, 0],
  headTilt: 0.93,
  previewScale: 1.12,
  stemLength: 2.08,
  stemRadius: 0.025,
  supportHeight: 0.64,
  leafCount: 6,
  calyx: false,
  airbornePollen: false,
  simulatedSurfaces: true,
};
const points: Vec3[] = Array.from({ length: 49 }, (_, i) => {
  const t = i / 48,
    envelope = Math.min(1, t * 12, (1 - t) * 12),
    radius = 0.075 * envelope,
    angle = t * Math.PI * 5;
  return [
    Math.sin(angle) * radius,
    -2.08 + t * 2.08,
    (Math.cos(angle) - 1) * radius,
  ];
});
const anatomy: StemAnatomy = {
  axis: false,
  color: "#82745e",
  leafTilt: 0.98,
  extras: [{ points, radius: 0.03, endRadius: 0.018, color: "#817860" }],
  headExtras: HOYA_STALKS,
  nodes: [0.27, 0.49, 0.71].flatMap((t, i) =>
    [-1, 1].map((side) => {
      const p = points[Math.round(t * 48)];
      return {
        t,
        angle: i * 1.45 + (side < 0 ? Math.PI : 0),
        scale: 0.92 - i * 0.1,
        offset: [p[0] - 0.025 * Math.sin(t * Math.PI), 0, p[2]] as Vec3,
      };
    }),
  ),
};
function HoyaStem(props: StemProps) {
  return (
    <BotanicalStem {...props} anatomy={anatomy} LeafComponent={HoyaLeaf} />
  );
}
function HoyaOrgans(props: FlowerOrgansProps) {
  return <SpecimenAssembly {...props} type="hoya" model={HOYA_MODEL} />;
}
export function Hoya(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="hoya"
      structure={hoyaStructure}
      Organs={HoyaOrgans}
      StemComponent={HoyaStem}
    />
  );
}
