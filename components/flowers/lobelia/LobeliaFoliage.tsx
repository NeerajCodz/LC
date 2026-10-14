import type { Quality } from "@/lib/flowers/types";
import { useContext, useMemo, useRef } from "react";
import { Group, Matrix4, Vector3 } from "three";
import { useActiveFrame } from "@/hooks/useActiveFrame";
import { HeadAttachmentPose } from "@/components/flowers/BotanicalStem";
import type { StemProps } from "@/components/flowers/Stem";
import type { PlantAttachmentState } from "@/lib/three/plantAttachments";
import { specimenGeometry } from "@/lib/three/specimenModel";
import {
  BotanicalBlade,
  type BladePigment,
} from "@/components/flowers/BotanicalBlade";
import { OrganicPart } from "@/components/flowers/FloralParts";
import {
  LOBELIA_LOWER_LEAF,
  LOBELIA_UPPER_LEAF,
  LOBELIA_LOWER_PETIOLE,
  LOBELIA_LEAF_FACE_ROTATION,
} from "@/components/flowers/lobelia/lobeliaLeaf";
import {
  LOBELIA_UPPER_ATTACHMENTS,
  writeLobeliaUpperLeafMatrix,
} from "@/components/flowers/lobelia/lobeliaLeafAttachments";
const createLower = (q: Quality) => specimenGeometry(LOBELIA_LOWER_LEAF, q),
  createUpper = (q: Quality) => specimenGeometry(LOBELIA_UPPER_LEAF, q);
const pigment: BladePigment = {
  color: "#547b54",
  underside: "#81966e",
  vein: "#a5b18b",
  roughness: 0.67,
  venation: "pinnate",
};
export function LobeliaLowerLeaf({ quality }: { quality: Quality }) {
  return (
    <group rotation={LOBELIA_LEAF_FACE_ROTATION}>
      <BotanicalBlade
        type="lobelia"
        quality={quality}
        create={createLower}
        pigment={pigment}
      />
      <OrganicPart
        quality={quality}
        points={LOBELIA_LOWER_PETIOLE.points}
        radius={LOBELIA_LOWER_PETIOLE.radius}
        endRadius={LOBELIA_LOWER_PETIOLE.endRadius}
        color={LOBELIA_LOWER_PETIOLE.color}
      />
    </group>
  );
}
export function LobeliaRacemeFoliage(props: StemProps) {
  const head = useContext(HeadAttachmentPose),
    frames = useRef<(Group | null)[]>([]),
    blades = useRef<(Group | null)[]>([]),
    scratch = useMemo(
      () => ({ position: new Vector3(), normal: new Vector3() }),
      [],
    ),
    state = useRef<PlantAttachmentState>({
      stemLength: props.structure.stemLength,
      supportHeight: props.structure.supportHeight ?? 0,
      growth: 1,
      motion: { x: 0, z: 0, drop: 0 },
      head: new Matrix4(),
    });
  useActiveFrame(() => {
    const current = state.current;
    current.growth = props.growth.current;
    current.motion = props.motion.current;
    current.head = head ?? current.head;
    const unfold = Math.max(
      0.03,
      Math.min(1, (Math.max(0.03, current.growth) - 0.15) / 0.85),
    );
    for (let i = 0; i < LOBELIA_UPPER_ATTACHMENTS.length; i++) {
      const frame = frames.current[i],
        blade = blades.current[i],
        pose = LOBELIA_UPPER_ATTACHMENTS[i];
      if (frame) {
        writeLobeliaUpperLeafMatrix(frame.matrix, pose, current, scratch);
        frame.matrixWorldNeedsUpdate = true;
      }
      if (blade) {
        blade.scale.setScalar(pose.scale * unfold);
        blade.rotation.x =
          0.85 + Math.sin(props.time.current * 1.3 + i) * 0.022 * props.wind;
      }
    }
  }, -0.4);
  return (
    <group>
      {LOBELIA_UPPER_ATTACHMENTS.map((p, i) => (
        <group
          key={i}
          ref={(g) => {
            frames.current[i] = g;
          }}
          matrixAutoUpdate={false}
        >
          <group
            rotation={[0.85, 0, 0.1]}
            scale={p.scale}
            ref={(g) => {
              blades.current[i] = g;
            }}
          >
            <group rotation={LOBELIA_LEAF_FACE_ROTATION}>
              <BotanicalBlade
                type="lobelia"
                quality={props.quality}
                create={createUpper}
                pigment={pigment}
              />
            </group>
          </group>
        </group>
      ))}
    </group>
  );
}
