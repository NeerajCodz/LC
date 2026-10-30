import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { createGazaniaLeaf } from "./gazaniaLeaf";
const pigment: BladePigment = {
  color: "#31543a",
  underside: "#dbdfcf",
  vein: "#71955e",
  roughness: 0.68,
  undersideRoughness: 0.95,
  venation: "pinnate",
  pubescence: 0.68,
};
export function GazaniaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="gazania"
      quality={quality}
      create={createGazaniaLeaf}
      pigment={pigment}
    />
  );
}
