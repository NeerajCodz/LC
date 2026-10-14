import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { createTuberoseLeaf } from "./tuberoseLeaf";
const pigment: BladePigment = {
  color: "#65835b",
  underside: "#8d9f78",
  vein: "#a0ae85",
  roughness: 0.57,
  undersideRoughness: 0.7,
  venation: "parallel",
};
export function TuberoseLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="tuberose"
      quality={quality}
      create={createTuberoseLeaf}
      pigment={pigment}
    />
  );
}
