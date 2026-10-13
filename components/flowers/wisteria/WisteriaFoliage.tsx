import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import type { Quality } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { createWisteriaLeaflet, WISTERIA_LEAF_POSES } from "./wisteriaLeaf";
const pigment: BladePigment = {
  color: "#416948",
  underside: "#8a9d76",
  vein: "#a7b68b",
  roughness: 0.66,
  venation: "pinnate",
};
export function WisteriaLeaf({ quality }: { quality: Quality }) {
  const rachis = useMemo(
    () =>
      createOrganicTube({
        points: [
          [0, 0, 0],
          [0, 0.39, 0.008],
          [0, 0.79, 0.018],
        ],
        radius: 0.009,
        endRadius: 0.0035,
        color: "#839664",
        segments: quality === "overview" || quality === "low" ? 10 : 20,
        sides: 7,
      }),
    [quality],
  );
  const material = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.74 }),
    [],
  );
  useEffect(() => () => rachis.dispose(), [rachis]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group dispose={null}>
      <mesh geometry={rachis} material={material} castShadow />
      <BotanicalBlade
        type="wisteria"
        quality={quality}
        create={createWisteriaLeaflet}
        pigment={pigment}
        poses={WISTERIA_LEAF_POSES}
      />
    </group>
  );
}
