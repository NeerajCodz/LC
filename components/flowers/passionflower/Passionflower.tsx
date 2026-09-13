import type { FlowerProps, FlowerStructure } from "@/lib/flowers/types";
import { BASE_STRUCTURE } from "@/lib/flowers/structure";
import { FlowerPlant } from "../FlowerPlant";
import type { FlowerOrgansProps } from "../FloralParts";
import { PassionCorolla } from "./PassionCorolla";
import { PassionHeart } from "./PassionHeart";
import { PassionVine } from "./PassionVine";

export const passionflowerStructure: FlowerStructure = {
  ...BASE_STRUCTURE,
  layers: [],
  headRadius: 1.32,
  headCenter: [0, 0.27, 0],
  headTilt: 0.64,
  stemLength: 2.65,
  stemRadius: 0.022,
  supportHeight: 0.73,
  calyx: false,
  leafCount: 3,
  roughness: 0.6,
};
function PassionOrgans(props: FlowerOrgansProps) {
  return (
    <>
      <PassionCorolla {...props} />
      <PassionHeart {...props} />
    </>
  );
}
export function Passionflower(props: Omit<FlowerProps, "type">) {
  return (
    <FlowerPlant
      {...props}
      type="passionflower"
      structure={passionflowerStructure}
      Organs={PassionOrgans}
      StemComponent={PassionVine}
    />
  );
}
