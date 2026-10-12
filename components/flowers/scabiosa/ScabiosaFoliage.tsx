import { useRef } from "react";
import { Group } from "three";
import type { Quality } from "@/lib/flowers/types";
import { BotanicalBlade, type BladePigment } from "../BotanicalBlade";
import { bendWeight } from "@/lib/flowers/wind";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import type { StemProps } from "../Stem";
import {
  createScabiosaUpperLeaf,
  createScabiosaBasalLeaf,
  SCABIOSA_BASAL_LEAF_POSES,
} from "./scabiosaLeaf";
const pigment: BladePigment = {
  color: "#5c7e50",
  underside: "#8fa67b",
  vein: "#a9b994",
  roughness: 0.74,
  venation: "pinnate",
  pubescence: 0.12,
};
export function ScabiosaLeaf({ quality }: { quality: Quality }) {
  return (
    <BotanicalBlade
      type="scabiosa"
      quality={quality}
      create={createScabiosaUpperLeaf}
      pigment={pigment}
    />
  );
}
export function ScabiosaBasalFoliage({
  quality,
  growth,
  motion,
  structure,
}: StemProps) {
  const group = useRef<Group>(null);
  useActiveFrame(() => {
    if (!group.current) return;
    const g = Math.max(0.03, growth.current),
      weight = bendWeight(0.06);
    group.current.position.set(
      motion.current.x * weight,
      -structure.stemLength +
        structure.stemLength * 0.06 * g -
        motion.current.drop * weight,
      motion.current.z * weight,
    );
    group.current.scale.setScalar(
      Math.max(0.03, Math.min(1, (g - 0.12) / 0.88)),
    );
  });
  return (
    <group ref={group} position={[0, -structure.stemLength * 0.94, 0]}>
      <BotanicalBlade
        type="scabiosa"
        quality={quality}
        create={createScabiosaBasalLeaf}
        pigment={pigment}
        poses={SCABIOSA_BASAL_LEAF_POSES}
      />
    </group>
  );
}
