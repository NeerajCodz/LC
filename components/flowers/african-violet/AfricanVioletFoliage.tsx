import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import {
  AFRICAN_VIOLET_LEAF,
  AFRICAN_VIOLET_LEAF_FACE_ROTATION,
  createAfricanVioletHairs,
} from "./africanVioletLeaf";
const create = (q: Quality) => specimenGeometry(AFRICAN_VIOLET_LEAF, q);
const pigment: BladePigment = {
  color: "#3b6549",
  underside: "#83937c",
  vein: "#789064",
  roughness: 0.82,
  venation: "pinnate",
  pubescence: 0.7,
};
export function AfricanVioletLeaf({ quality }: { quality: Quality }) {
  const hairs = useMemo(() => createAfricanVioletHairs(quality), [quality]);
  const hairMaterial = useMemo(
    () => new MeshStandardMaterial({ color: "#c7cebc", roughness: 0.94 }),
    [],
  );
  useEffect(() => () => hairs.dispose(), [hairs]);
  useEffect(() => () => hairMaterial.dispose(), [hairMaterial]);
  return (
    <group rotation={AFRICAN_VIOLET_LEAF_FACE_ROTATION} dispose={null}>
      <BotanicalBlade
        type="african-violet"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <mesh geometry={hairs} material={hairMaterial} />
    </group>
  );
}
