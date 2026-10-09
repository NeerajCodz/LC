import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { createOrganicTube } from "@/lib/three/organicTube";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { RANUNCULUS_LEAFLET, RANUNCULUS_LEAF_POSES } from "./ranunculusLeaf";
const create = (quality: Quality) =>
  specimenGeometry(RANUNCULUS_LEAFLET, quality);
const pigment: BladePigment = {
  color: "#456c48",
  underside: "#77936b",
  vein: "#91a977",
  roughness: 0.76,
  venation: "pinnate",
  pubescence: 0.16,
};
export function RanunculusLeaf({ quality }: { quality: Quality }) {
  const petiole = useMemo(
    () =>
      createOrganicTube({
        points: [
          [0, 0, 0],
          [0, 0.08, 0.005],
          [0, 0.14, 0],
        ],
        radius: 0.011,
        endRadius: 0.008,
        color: "#668453",
        segments: quality === "overview" || quality === "low" ? 8 : 16,
        sides: 7,
      }),
    [quality],
  );
  const material = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.78 }),
    [],
  );
  useEffect(() => () => petiole.dispose(), [petiole]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group dispose={null}>
      <mesh geometry={petiole} material={material} castShadow />
      <BotanicalBlade
        type="ranunculus"
        quality={quality}
        create={create}
        pigment={pigment}
        poses={RANUNCULUS_LEAF_POSES}
      />
    </group>
  );
}
