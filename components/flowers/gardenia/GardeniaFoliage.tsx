import type { Quality } from "@/lib/flowers/types";
import {
  BotanicalBlade,
  type BladePigment,
  type BladePose,
} from "../BotanicalBlade";
import { specimenGeometry } from "@/lib/three/specimenModel";
import { GARDENIA_LEAF, GARDENIA_STIPULE } from "./gardeniaLeaf";
const create = (q: Quality) => specimenGeometry(GARDENIA_LEAF, q);
const createStipule = (q: Quality) =>
  specimenGeometry(
    GARDENIA_STIPULE,
    q === "high" || q === "ultra" ? "medium" : "low",
  );
const stipulePoses: BladePose[] = [
  { position: [0, 0.016, 0], rotation: [1.08, Math.PI / 2, 0], scale: 1 },
];
const pigment: BladePigment = {
  color: "#315b43",
  underside: "#7a9269",
  vein: "#a4b88c",
  roughness: 0.34,
  venation: "pinnate",
};
const stipulePigment: BladePigment = {
  ...pigment,
  color: "#789164",
  roughness: 0.72,
};
export function GardeniaLeaf({ quality }: { quality: Quality }) {
  return (
    <group>
      <BotanicalBlade
        type="gardenia"
        quality={quality}
        create={create}
        pigment={pigment}
      />
      <BotanicalBlade
        type="gardenia"
        quality={quality}
        create={createStipule}
        pigment={stipulePigment}
        poses={stipulePoses}
      />
    </group>
  );
}
