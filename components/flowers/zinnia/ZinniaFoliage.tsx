import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { ZINNIA_LEAF } from "./zinniaLeaf";
const create = (q: Quality) => specimenGeometry(ZINNIA_LEAF, q);
const pigment: BladePigment = {
  color: "#577943",
  underside: "#8ea277",
  vein: "#b0c082",
  roughness: 0.87,
  venation: "palmate",
  pubescence: 0.4,
};
export function ZinniaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="zinnia"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
