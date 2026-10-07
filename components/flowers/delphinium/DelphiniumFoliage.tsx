import type { Quality } from "@/lib/flowers/types";

import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { createDelphiniumLeaf } from "./delphiniumLeaf";
const create = (q: Quality) => createDelphiniumLeaf(q);
const pigment: BladePigment = {
  color: "#587864",
  underside: "#849579",
  vein: "#a2ae81",
  roughness: 0.77,
  venation: "palmate",
  pubescence: 0.1,
};
export function DelphiniumLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="delphinium"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
