import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { createEchinaceaLeaf } from "./echinaceaLeaf";
const pigment: BladePigment = {
  color: "#45623b",
  underside: "#7f9867",
  vein: "#a4b975",
  roughness: 0.86,
  venation: "pinnate",
  pubescence: 0.42,
};
export function EchinaceaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="echinacea"
      quality={quality}
      create={createEchinaceaLeaf}
      pigment={pigment}
    />
  );
}
