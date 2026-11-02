import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";

import { GREVILLEA_LEAF } from "./grevilleaLeaf";
const create = (quality: Quality) => specimenGeometry(GREVILLEA_LEAF, quality);
const pigment: BladePigment = {
  color: "#4e6c4c",
  underside: "#a1a18a",
  vein: "#83946b",
  roughness: 0.72,
  venation: "pinnate",
  pubescence: 0.35,
};
export function GrevilleaLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <BotanicalBlade
        type="grevillea"
        quality={quality}
        create={create}
        pigment={pigment}
      />
    </group>
  );
}
