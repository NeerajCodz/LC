import { useMemo, useEffect } from "react";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import {
  specimenGeometry,
  specimenOrganGeometry,
} from "@/lib/three/specimenModel";
import { joinOrgans } from "@/lib/three/floralOrgans";
import {
  BotanicalBlade,
  type BladePigment,
} from "@/components/flowers/BotanicalBlade";
import { OrganicPart } from "@/components/flowers/FloralParts";
import {
  PENTAS_LEAF,
  PENTAS_LEAF_FACE_ROTATION,
  PENTAS_PETIOLE,
  pentasLeafHairs,
} from "@/components/flowers/pentas/pentasLeaf";
const create = (q: Quality) => specimenGeometry(PENTAS_LEAF, q);
const pigment: BladePigment = {
  color: "#52744b",
  underside: "#81926c",
  vein: "#a2ad7b",
  roughness: 0.74,
  undersideRoughness: 0.83,
  venation: "pinnate",
  pubescence: 0.38,
};
export function PentasLeaf({ quality }: { quality: Quality }) {
  const hairs = useMemo(
    () =>
      joinOrgans(
        pentasLeafHairs(quality).map((o) =>
          specimenOrganGeometry(
            o,
            quality === "high" || quality === "ultra" ? "low" : "overview",
          ),
        ),
      ),
    [quality],
  );
  useEffect(() => () => hairs.dispose(), [hairs]);
  return (
    <group rotation={PENTAS_LEAF_FACE_ROTATION}>
      <BotanicalBlade
        type="pentas"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <OrganicPart
        quality={quality}
        points={PENTAS_PETIOLE.points}
        radius={PENTAS_PETIOLE.radius}
        endRadius={PENTAS_PETIOLE.endRadius}
        color={PENTAS_PETIOLE.color}
      />
      <mesh
        geometry={hairs}
        onUpdate={(m) => m.updateMorphTargets()}
        castShadow
        receiveShadow
      >
        <meshStandardMaterial vertexColors roughness={0.86} />
      </mesh>
    </group>
  );
}
const bristles = [-1, 0, 1].map((side) => ({
  points: [
    [side * 0.008, 0.005, 0.023],
    [side * 0.023, 0.047, 0.027],
    [side * 0.034, 0.085, 0.028],
  ] as Vec3[],
  radius: 0.0017,
  endRadius: 0.0004,
}));
export function PentasNode({ quality }: { quality: Quality }) {
  return (
    <group>
      {bristles.map((b, i) => (
        <OrganicPart key={i} quality={quality} {...b} color="#abb88c" />
      ))}
    </group>
  );
}
