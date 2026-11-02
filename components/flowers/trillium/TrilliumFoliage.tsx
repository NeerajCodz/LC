import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";

import { TRILLIUM_LEAF } from "./trilliumLeaf";
const create = (quality: Quality) => specimenGeometry(TRILLIUM_LEAF, quality);
const pigment: BladePigment = {
  color: "#53734b",
  underside: "#81906a",
  vein: "#8c9d74",
  roughness: 0.78,
  venation: "parallel",
  pubescence: 0.05,
};
export function TrilliumLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <BotanicalBlade
        type="trillium"
        quality={quality}
        create={create}
        pigment={pigment}
      />
    </group>
  );
}
