import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { createOrganicTube } from "@/lib/three/organicTube";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { HELLEBORE_LEAFLET, HELLEBORE_LEAF_POSES } from "./helleboreLeaf";
const create = (q: Quality) => specimenGeometry(HELLEBORE_LEAFLET, q);
const pigment: BladePigment = {
  color: "#345842",
  underside: "#5f7756",
  vein: "#778e65",
  roughness: 0.53,
  venation: "pinnate",
};
export function HelleboreLeaf({ quality }: { quality: Quality }) {
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
        type="hellebore"
        quality={quality}
        create={create}
        pigment={pigment}
        poses={HELLEBORE_LEAF_POSES}
      />
    </group>
  );
}
