import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { HYACINTH_LEAF, HYACINTH_LEAF_POSES } from "./hyacinthLeaf";
const create = (q: Quality) => specimenGeometry(HYACINTH_LEAF, q);
const pigment: BladePigment = {
  color: "#4f8050",
  underside: "#829c66",
  vein: "#a3b779",
  roughness: 0.46,
  venation: "parallel",
};
export function HyacinthLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="hyacinth"
      quality={quality}
      create={create}
      pigment={pigment}
      poses={HYACINTH_LEAF_POSES}
    />
  );
}
