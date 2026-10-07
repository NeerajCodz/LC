import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { PETUNIA_LEAF } from "./petuniaLeaf";
const create = (q: Quality) => specimenGeometry(PETUNIA_LEAF, q);
const pigment: BladePigment = {
  color: "#557344",
  underside: "#75866a",
  vein: "#96a973",
  roughness: 0.82,
  venation: "pinnate",
  pubescence: 0.35,
};
export function PetuniaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="petunia"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
