import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { SNOWDROP_LEAF } from "./snowdropLeaf";
const create = (q: Quality) => specimenGeometry(SNOWDROP_LEAF, q);
const pigment: BladePigment = {
  color: "#789487",
  underside: "#9eaca1",
  vein: "#b0bb9f",
  roughness: 0.55,
  venation: "parallel",
};
export function SnowdropLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="snowdrop"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
