import type { Quality, Vec3 } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { leafBlade } from "@/lib/three/botanicalBlades";
import {
  BotanicalBlade,
  type BladePigment,
} from "@/components/flowers/BotanicalBlade";
import {
  IXORA_LEAF,
  IXORA_LEAF_FACE_ROTATION,
} from "@/components/flowers/ixora/ixoraLeaf";
const create = (q: Quality) => specimenGeometry(IXORA_LEAF, q);
const pigment: BladePigment = {
  color: "#3f6e4c",
  underside: "#718560",
  vein: "#91a16e",
  roughness: 0.46,
  undersideRoughness: 0.64,
  venation: "pinnate",
};
const poses = [
  { position: [0, 0, 0] as Vec3, rotation: IXORA_LEAF_FACE_ROTATION, scale: 1 },
];
export function IxoraLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="ixora"
      quality={quality}
      create={create}
      pigment={pigment}
      poses={poses}
    />
  );
}
const stipule = leafBlade(
  "cuspidate interpetiolar ixora stipule",
  0.12,
  0.032,
  { cup: 0.009, thickness: 0.007 },
);
const createStipule = (q: Quality) => specimenGeometry(stipule, q);
const stipulePoses = [
  {
    position: [0, 0.012, 0.019] as Vec3,
    rotation: [0, Math.PI / 2, 0.19] as Vec3,
    scale: 1,
  },
];
export function IxoraNode({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="ixora"
      quality={quality}
      create={createStipule}
      pigment={pigment}
      poses={stipulePoses}
    />
  );
}
