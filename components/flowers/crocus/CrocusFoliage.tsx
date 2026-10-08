import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { CROCUS_LEAF } from "./crocusLeaf";
const create = (q: Quality) => specimenGeometry(CROCUS_LEAF, q);
const pigment: BladePigment = {
  color: "#466b4b",
  underside: "#809679",
  vein: "#6b8b62",
  midstripe: "#d3dbcb",
  roughness: 0.59,
  venation: "parallel",
};
export function CrocusLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="crocus"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
