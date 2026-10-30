import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { OrganicPart } from "../FloralParts";
import { SALVIA_LEAF, SALVIA_PETIOLE } from "./salviaLeaf";
const create = (q: Quality) => specimenGeometry(SALVIA_LEAF, q);
const pigment: BladePigment = {
  color: "#53773c",
  underside: "#819168",
  vein: "#9caf75",
  roughness: 0.7,
  venation: "pinnate",
  pubescence: 0.08,
};
export function SalviaLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <BotanicalBlade
        type="salvia"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <OrganicPart
        quality={quality}
        points={SALVIA_PETIOLE.points}
        radius={SALVIA_PETIOLE.radius}
        endRadius={SALVIA_PETIOLE.endRadius}
        color={SALVIA_PETIOLE.color}
      />
    </group>
  );
}
