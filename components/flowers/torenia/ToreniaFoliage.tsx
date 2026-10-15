import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import {
  BotanicalBlade,
  type BladePigment,
} from "@/components/flowers/BotanicalBlade";
import { OrganicPart } from "@/components/flowers/FloralParts";
import {
  TORENIA_LEAF,
  TORENIA_LEAF_FACE_ROTATION,
  TORENIA_PETIOLE,
} from "@/components/flowers/torenia/toreniaLeaf";
const create = (q: Quality) => specimenGeometry(TORENIA_LEAF, q);
const pigment: BladePigment = {
  color: "#69934f",
  underside: "#91a475",
  vein: "#b1be87",
  roughness: 0.65,
  venation: "pinnate",
  pubescence: 0.08,
};
export function ToreniaLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={TORENIA_LEAF_FACE_ROTATION}>
      <BotanicalBlade
        type="torenia"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <OrganicPart
        quality={quality}
        points={TORENIA_PETIOLE.points}
        radius={TORENIA_PETIOLE.radius}
        endRadius={TORENIA_PETIOLE.endRadius}
        color={TORENIA_PETIOLE.color}
      />
    </group>
  );
}
