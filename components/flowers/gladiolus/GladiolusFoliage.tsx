import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { GLADIOLUS_LEAF } from "./gladiolusLeaf";
const create = (q: Quality) => specimenGeometry(GLADIOLUS_LEAF, q);
const pigment: BladePigment = {
  color: "#4e775a",
  underside: "#738c70",
  vein: "#99ac79",
  roughness: 0.66,
  venation: "parallel",
};
export function GladiolusLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="gladiolus"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
