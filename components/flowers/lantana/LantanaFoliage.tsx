import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import {
  BotanicalBlade,
  type BladePigment,
} from "@/components/flowers/BotanicalBlade";
import { OrganicPart } from "@/components/flowers/FloralParts";
import {
  LANTANA_LEAF,
  LANTANA_LEAF_FACE_ROTATION,
  LANTANA_PETIOLE,
} from "./lantanaLeaf";
const create = (quality: Quality) => specimenGeometry(LANTANA_LEAF, quality);
const pigment: BladePigment = {
  color: "#467143",
  underside: "#839369",
  vein: "#a7ad76",
  roughness: 0.86,
  undersideRoughness: 0.94,
  venation: "pinnate",
  pubescence: 0.2,
};
export function LantanaLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={LANTANA_LEAF_FACE_ROTATION}>
      <BotanicalBlade
        type="lantana"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <OrganicPart
        quality={quality}
        points={LANTANA_PETIOLE.points}
        radius={LANTANA_PETIOLE.radius}
        endRadius={LANTANA_PETIOLE.endRadius}
        color={LANTANA_PETIOLE.color}
      />
    </group>
  );
}
