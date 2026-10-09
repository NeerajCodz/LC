import { useEffect, useMemo } from "react";
import { MeshStandardMaterial } from "three";
import { createOrganicTube } from "@/lib/three/organicTube";
import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";

import { createNasturtiumLeaf } from "./nasturtiumLeaf";
const create = (q: Quality) => createNasturtiumLeaf(q);
const pigment: BladePigment = {
  color: "#60865d",
  underside: "#a0b48c",
  vein: "#cbd2a5",
  roughness: 0.68,
  venation: "peltate",
};
function Blade({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="nasturtium"
      quality={quality}
      create={create}
      pigment={pigment}
    />
  );
}
export function NasturtiumLeaf({ quality }: { quality: Quality }) {
  const geometry = useMemo(
    () =>
      createOrganicTube({
        points: [
          [0, 0, 0],
          [0, 0.18, 0.01],
          [0, 0.39, 0.025],
        ],
        radius: 0.011,
        endRadius: 0.007,
        color: "#729566",
        segments: quality === "overview" || quality === "low" ? 8 : 16,
        sides: 8,
      }),
    [quality],
  );
  const material = useMemo(
    () => new MeshStandardMaterial({ vertexColors: true, roughness: 0.7 }),
    [],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  useEffect(() => () => material.dispose(), [material]);
  return (
    <group dispose={null}>
      <mesh geometry={geometry} material={material} castShadow />
      <Blade quality={quality} />
    </group>
  );
}
