import type { Quality, Vec3 } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { PANSY_LEAF, PANSY_STIPULE } from "./pansyLeaf";
const create = (q: Quality) => specimenGeometry(PANSY_LEAF, q);
const createStipule = (q: Quality) => specimenGeometry(PANSY_STIPULE, q);
const pigment: BladePigment = {
  color: "#4c7048",
  underside: "#83926a",
  vein: "#76936a",
  roughness: 0.7,
  venation: "pinnate",
  pubescence: 0.08,
};
const stipules = [-1, 1].map((sign) => ({
  position: [sign * 0.03, 0.03, 0] as Vec3,
  rotation: [0, 0, sign * 0.82] as Vec3,
  scale: 1,
}));
export function PansyLeaf({ quality }: { quality: Quality }) {
  return (
    <group>
      <BotanicalBlade
        type="pansy"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <BotanicalBlade
        type="pansy"
        quality={quality}
        create={createStipule}
        pigment={pigment}
        poses={stipules}
      />
    </group>
  );
}
