import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { GERBERA_LEAF } from "./gerberaLeaf";
const create = (q: Quality) => specimenGeometry(GERBERA_LEAF, q);
const pigment: BladePigment = {
  color: "#4a7253",
  underside: "#87957b",
  vein: "#a5b884",
  roughness: 0.76,
  venation: "pinnate",
  pubescence: 0.15,
};
export function GerberaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="gerbera"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
