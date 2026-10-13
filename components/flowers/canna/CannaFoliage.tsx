import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import {
  createCannaLeafGeometry,
  createCannaLeafNeckGeometry,
  CANNA_SHEATH,
} from "./cannaLeaf";

const createSheath = (quality: Quality) =>
  specimenGeometry(CANNA_SHEATH, quality);
const pigment: BladePigment = {
  color: "#406d44",
  underside: "#788868",
  vein: "#91a367",
  roughness: 0.54,
  undersideRoughness: 0.65,
  venation: "pinnate",
};
const sheathPigment: BladePigment = {
  color: "#637b50",
  underside: "#7d825c",
  vein: "#99a477",
  roughness: 0.6,
  venation: "parallel",
};
export function CannaLeaf({ quality }: { quality: Quality }) {
  return (
    <group>
      <BotanicalBlade
        type="canna"
        quality={quality}
        create={createCannaLeafGeometry}
        pigment={pigment}
      />
      <BotanicalBlade
        type="canna"
        quality={quality}
        create={createCannaLeafNeckGeometry}
        pigment={pigment}
      />
    </group>
  );
}
export function CannaNodeDecoration({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="canna"
      quality={quality}
      create={createSheath}
      pigment={sheathPigment}
    />
  );
}
