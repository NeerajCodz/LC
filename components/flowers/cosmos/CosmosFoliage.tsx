import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";

import { createCosmosLeaf } from "./cosmosLeaf";
const create = (q: Quality) => createCosmosLeaf(q);
const pigment: BladePigment = {
  color: "#537b4d",
  underside: "#87a373",
  vein: "#a5b78b",
  roughness: 0.8,
  venation: "pinnate",
};
export function CosmosLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="cosmos"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
