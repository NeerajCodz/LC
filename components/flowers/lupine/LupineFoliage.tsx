import type { Quality, Vec3 } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { OrganicPart } from "../FloralParts";
import { createLupineLeaflet, LUPINE_LEAF_POSES } from "./lupineLeaf";
const pigment: BladePigment = {
  color: "#54764e",
  underside: "#849573",
  vein: "#91a077",
  roughness: 0.72,
  undersideRoughness: 0.82,
  venation: "pinnate",
  pubescence: 0.13,
};
const petiole: Vec3[] = [
  [0, 0, 0],
  [0, 0.23, 0.006],
  [0, 0.46, 0],
];
export function LupineLeaf({ quality }: { quality: Quality }) {
  return (
    <group>
      <OrganicPart
        points={petiole}
        radius={0.012}
        endRadius={0.008}
        color="#7f975d"
        quality={quality}
      />
      <BotanicalBlade
        type="lupine"
        quality={quality}
        create={createLupineLeaflet}
        pigment={pigment}
        poses={LUPINE_LEAF_POSES}
      />
    </group>
  );
}
