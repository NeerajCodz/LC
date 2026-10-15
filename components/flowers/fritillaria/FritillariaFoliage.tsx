import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { createFritillariaLeaf } from "./fritillariaLeaf";
const pigment: BladePigment = {
  color: "#577948",
  underside: "#819366",
  vein: "#95a66c",
  roughness: 0.5,
  undersideRoughness: 0.67,
  venation: "parallel",
};
export function FritillariaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="fritillaria"
      quality={quality}
      create={createFritillariaLeaf}
      pigment={pigment}
    />
  );
}
