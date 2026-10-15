import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { HOYA_LEAF } from "./hoyaLeaf";
const create = (q: Quality) => specimenGeometry(HOYA_LEAF, q);
const pigment: BladePigment = {
  color: "#3d6950",
  underside: "#72917b",
  vein: "#7c9d7f",
  roughness: 0.44,
  undersideRoughness: 0.64,
  venation: "pinnate",
};
export function HoyaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="hoya"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
