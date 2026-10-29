import { useEffect, useMemo } from "react";
import type { Quality } from "@/lib/flowers/types";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { joinOrgans } from "@/lib/three/floralOrgans";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { NICOTIANA_LEAF, NICOTIANA_DECURRENT_WINGS } from "./nicotianaLeaf";
const create = (q: Quality) => specimenGeometry(NICOTIANA_LEAF, q);
const pigment: BladePigment = {
  color: "#55743f",
  underside: "#83906b",
  vein: "#9ca879",
  roughness: 0.84,
  venation: "pinnate",
  pubescence: 0.45,
};
export function NicotianaLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={[0, Math.PI, 0]}>
      <BotanicalBlade
        type="nicotiana"
        quality={quality}
        create={create}
        pigment={pigment}
      />
    </group>
  );
}
/** Unpitched decurrent tissue follows the real stem node, rather than rotating with the blade. */
export function NicotianaNode({ quality }: { quality: Quality }) {
  const geometry = useMemo(
    () =>
      joinOrgans(
        NICOTIANA_DECURRENT_WINGS.map((s) => specimenGeometry(s, quality)),
      ),
    [quality],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh
      geometry={geometry}
      onUpdate={(m) => m.updateMorphTargets()}
      castShadow
      receiveShadow
    >
      <meshStandardMaterial color="#718951" roughness={0.85} />
    </mesh>
  );
}
