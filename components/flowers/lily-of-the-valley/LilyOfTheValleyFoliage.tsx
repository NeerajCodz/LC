import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { LILY_OF_THE_VALLEY_LEAF } from "./lilyOfTheValleyLeaf";
const create = (q: Quality) => specimenGeometry(LILY_OF_THE_VALLEY_LEAF, q);
const pigment: BladePigment = {
  color: "#426b46",
  underside: "#718b73",
  vein: "#7c9b61",
  roughness: 0.62,
  venation: "parallel",
};
export function LilyOfTheValleyLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="lily-of-the-valley"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
