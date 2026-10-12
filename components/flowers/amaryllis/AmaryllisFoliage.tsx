import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { AMARYLLIS_LEAF, AMARYLLIS_LEAF_POSES } from "./amaryllisLeaf";
const create = (q: Quality) => specimenGeometry(AMARYLLIS_LEAF, q);
const pigment: BladePigment = {
  color: "#46724b",
  underside: "#81936b",
  vein: "#89a277",
  roughness: 0.42,
  venation: "parallel",
};
export function AmaryllisLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="amaryllis"
      quality={quality}
      create={create}
      pigment={pigment}
      poses={AMARYLLIS_LEAF_POSES}
    />
  );
}
