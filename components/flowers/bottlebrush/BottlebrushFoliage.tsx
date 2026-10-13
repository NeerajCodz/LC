import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import {
  createBottlebrushLeaf,
  BOTTLEBRUSH_UPPER_LEAF_POSES,
} from "./bottlebrushLeaf";
const pigment: BladePigment = {
  color: "#587449",
  underside: "#7c9165",
  vein: "#a0a982",
  roughness: 0.61,
  venation: "pinnate",
};
export function BottlebrushLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="bottlebrush"
      quality={quality}
      create={createBottlebrushLeaf}
      pigment={pigment}
    />
  );
}
export function BottlebrushUpperFoliage({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="bottlebrush"
      quality={quality}
      create={createBottlebrushLeaf}
      pigment={pigment}
      poses={BOTTLEBRUSH_UPPER_LEAF_POSES}
    />
  );
}
