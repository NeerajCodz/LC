import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { OrganicPart } from "../FloralParts";
import { DATURA_LEAF, DATURA_PETIOLE } from "./daturaLeaf";
const create = (quality: Quality) => specimenGeometry(DATURA_LEAF, quality);
const pigment: BladePigment = {
  color: "#637d48",
  underside: "#89965e",
  vein: "#9aa574",
  roughness: 0.79,
  venation: "pinnate",
  pubescence: 0.03,
};
export function DaturaLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <BotanicalBlade
        type="datura"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <OrganicPart
        quality={quality}
        points={DATURA_PETIOLE.points}
        radius={DATURA_PETIOLE.radius}
        endRadius={DATURA_PETIOLE.endRadius}
        color={DATURA_PETIOLE.color}
      />
    </group>
  );
}
