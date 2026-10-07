import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { ALSTROEMERIA_LEAF } from "./alstroemeriaLeaf";
const create = (q: Quality) => specimenGeometry(ALSTROEMERIA_LEAF, q);
const pigment: BladePigment = {
  color: "#4f784d",
  underside: "#7e946a",
  vein: "#a4b783",
  roughness: 0.61,
  venation: "parallel",
};
export function AlstroemeriaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="alstroemeria"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
