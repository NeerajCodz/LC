import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { IMPATIENS_LEAF } from "./impatiensLeaf";
const create = (q: Quality) => specimenGeometry(IMPATIENS_LEAF, q);
const pigment: BladePigment = {
  color: "#4c7652",
  underside: "#86a17b",
  vein: "#9aad78",
  roughness: 0.61,
  venation: "pinnate",
};
export function ImpatiensLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="impatiens"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
