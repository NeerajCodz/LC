import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { CAMELLIA_LEAF } from "./camelliaLeaf";
const create = (q: Quality) => specimenGeometry(CAMELLIA_LEAF, q);
const pigment: BladePigment = {
  color: "#315542",
  underside: "#7c9270",
  vein: "#9aa87e",
  roughness: 0.36,
  venation: "pinnate",
};
export function CamelliaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="camellia"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
