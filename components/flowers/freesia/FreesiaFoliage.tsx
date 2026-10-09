import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { FREESIA_LEAF, FREESIA_LEAF_POSES } from "./freesiaLeaf";
const create = (q: Quality) => specimenGeometry(FREESIA_LEAF, q);
const pigment: BladePigment = {
  color: "#59794f",
  underside: "#8da078",
  vein: "#a3b589",
  roughness: 0.61,
  venation: "parallel",
};
export function FreesiaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="freesia"
      quality={quality}
      create={create}
      pigment={pigment}
      poses={FREESIA_LEAF_POSES}
    />
  );
}
