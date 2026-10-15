import type { Quality, Vec3 } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { OrganicPart } from "../FloralParts";
import { createHollyhockLeaf } from "./hollyhockLeaf";
import { hollyhockLeafHairs } from "./hollyhockPubescence";
import { specimenOrganGeometry } from "@/lib/three/specimenModel";
import { joinOrgans } from "@/lib/three/floralOrgans";
const pigment: BladePigment = {
  color: "#648154",
  underside: "#93a17c",
  vein: "#a2ae81",
  roughness: 0.77,
  undersideRoughness: 0.87,
  venation: "palmate",
  pubescence: 0.28,
};
const petiole: Vec3[] = [
  [0, 0, 0],
  [0, 0.1, 0.003],
  [0, 0.2, 0],
];
export function HollyhockLeaf({ quality }: { quality: Quality }) {
  const hairs = useMemo(
    () =>
      joinOrgans(
        hollyhockLeafHairs(quality).map((organ) =>
          specimenOrganGeometry(
            organ,
            quality === "high" || quality === "ultra" ? "low" : "overview",
          ),
        ),
      ),
    [quality],
  );
  useEffect(() => () => hairs.dispose(), [hairs]);
  return (
    <group>
      <OrganicPart
        points={petiole}
        radius={0.012}
        endRadius={0.008}
        color="#879658"
        quality={quality}
      />
      <group position={[0, 0.2, 0]}>
        <BotanicalBlade
          type="hollyhock"
          quality={quality}
          create={createHollyhockLeaf}
          pigment={pigment}
        />
        <mesh
          geometry={hairs}
          onUpdate={(mesh) => mesh.updateMorphTargets()}
          castShadow
          receiveShadow
        >
          <meshStandardMaterial vertexColors roughness={0.88} />
        </mesh>
      </group>
    </group>
  );
}
import { useEffect, useMemo } from "react";
