import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import {
  createAgapanthusLeafGeometry,
  AGAPANTHUS_LEAF_POSES,
} from "./agapanthusLeaf";
const pigment: BladePigment = {
  color: "#416b56",
  underside: "#658273",
  vein: "#8c9e73",
  roughness: 0.56,
  undersideRoughness: 0.65,
  venation: "parallel",
};
export function AgapanthusLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="agapanthus"
      quality={quality}
      create={createAgapanthusLeafGeometry}
      pigment={pigment}
      poses={AGAPANTHUS_LEAF_POSES}
    />
  );
}
