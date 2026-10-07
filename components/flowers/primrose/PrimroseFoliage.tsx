import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { PRIMROSE_LEAF } from "./primroseLeaf";
const create = (q: Quality) => specimenGeometry(PRIMROSE_LEAF, q);
const pigment: BladePigment = {
  color: "#537644",
  underside: "#738663",
  vein: "#96a66a",
  roughness: 0.82,
  venation: "pinnate",
  pubescence: 0.22,
};
export function PrimroseLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="primrose"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
