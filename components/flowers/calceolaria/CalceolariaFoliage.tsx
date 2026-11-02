import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { OrganicPart } from "../FloralParts";
import { CALCEOLARIA_LEAF, CALCEOLARIA_PETIOLE } from "./calceolariaLeaf";
const create = (quality: Quality) =>
  specimenGeometry(CALCEOLARIA_LEAF, quality);
const pigment: BladePigment = {
  color: "#5a7545",
  underside: "#939a73",
  vein: "#899b66",
  roughness: 0.86,
  venation: "pinnate",
  pubescence: 0.3,
};
export function CalceolariaLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <BotanicalBlade
        type="calceolaria"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <OrganicPart
        quality={quality}
        points={CALCEOLARIA_PETIOLE.points}
        radius={CALCEOLARIA_PETIOLE.radius}
        endRadius={CALCEOLARIA_PETIOLE.endRadius}
        color={CALCEOLARIA_PETIOLE.color}
      />
    </group>
  );
}
