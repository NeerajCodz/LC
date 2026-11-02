import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";

import { ALLIUM_LEAF } from "./alliumLeaf";
const create = (quality: Quality) => specimenGeometry(ALLIUM_LEAF, quality);
const pigment: BladePigment = {
  color: "#898159",
  underside: "#a09a71",
  vein: "#b2a47a",
  roughness: 0.84,
  venation: "parallel",
  pubescence: 0,
};
export function AlliumLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <BotanicalBlade
        type="allium"
        quality={quality}
        create={create}
        pigment={pigment}
      />
    </group>
  );
}
