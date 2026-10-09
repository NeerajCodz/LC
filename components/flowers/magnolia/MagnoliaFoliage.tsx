import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { MAGNOLIA_LEAF } from "./magnoliaLeaf";
const create = (q: Quality) => specimenGeometry(MAGNOLIA_LEAF, q);
const pigment: BladePigment = {
  color: "#355543",
  underside: "#94704e",
  vein: "#9aa779",
  roughness: 0.34,
  undersideRoughness: 0.86,
  pubescence: 0.6,
  venation: "pinnate",
};
export function MagnoliaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="magnolia"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
