import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { BLUEBELL_LEAF, BLUEBELL_LEAF_POSES } from "./bluebellLeaf";
const create = (q: Quality) => specimenGeometry(BLUEBELL_LEAF, q);
const pigment: BladePigment = {
  color: "#4b744d",
  underside: "#79916b",
  vein: "#94aa75",
  roughness: 0.59,
  venation: "parallel",
};
export function BluebellLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="bluebell"
      quality={quality}
      create={create}
      pigment={pigment}
      poses={BLUEBELL_LEAF_POSES}
    />
  );
}
