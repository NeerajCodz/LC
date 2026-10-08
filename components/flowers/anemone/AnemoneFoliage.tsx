import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { createOrganicTube } from "@/lib/three/organicTube";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { ANEMONE_LEAF, ANEMONE_LEAF_POSES } from "./anemoneLeaf";
const create = (q: Quality) => specimenGeometry(ANEMONE_LEAF, q);
const pigment: BladePigment = {
  color: "#426b48",
  underside: "#75926a",
  vein: "#95ab7c",
  roughness: 0.74,
  venation: "pinnate",
};
export function AnemoneLeaf({ quality }: { quality: Quality }) {
  const petiole = useMemo(
    () =>
      createOrganicTube({
        points: [
          [0, 0, 0],
          [0, 0.07, 0.004],
          [0, 0.14, 0],
        ],
        radius: 0.01,
        endRadius: 0.008,
        color: "#5a7753",
        segments: quality === "low" ? 8 : 16,
        sides: 7,
      }),
    [quality],
  );
  const petioleMaterial = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }),
    [],
  );
  useEffect(() => () => petiole.dispose(), [petiole]);
  useEffect(() => () => petioleMaterial.dispose(), [petioleMaterial]);
  return (
    <group dispose={null}>
      <mesh geometry={petiole} material={petioleMaterial} castShadow />
      <BotanicalBlade
        type="anemone"
        quality={quality}
        create={create}
        pigment={pigment}
        poses={ANEMONE_LEAF_POSES}
      />
    </group>
  );
}
