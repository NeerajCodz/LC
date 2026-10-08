import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { LISIANTHUS_LEAF } from "./lisianthusLeaf";
const create = (q: Quality) => specimenGeometry(LISIANTHUS_LEAF, q);
const pigment: BladePigment = {
  color: "#749980",
  underside: "#a4b89c",
  vein: "#c0cbb0",
  roughness: 0.56,
  venation: "parallel",
};
export function LisianthusLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="lisianthus"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
