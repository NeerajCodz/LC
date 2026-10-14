import type { Matrix4, Vector3 } from "three";
import type { Vec3 } from "@/lib/flowers/types";
import { supportedBendSlope } from "@/lib/flowers/wind";
import {
  writeHeadAttachmentVertex,
  type PlantAttachmentState,
} from "@/lib/three/plantAttachments";
import { LOBELIA_STALKS } from "./lobeliaGeometry";

export interface LobeliaUpperAttachment {
  root: Vec3;
  tip: Vec3;
  angle: number;
  scale: number;
}
export const LOBELIA_UPPER_ATTACHMENTS: LobeliaUpperAttachment[] =
  LOBELIA_STALKS.filter(
    (organ) => organ.name === "slender lobelia pedicel",
  ).map((organ, i) => ({
    root: organ.points[0],
    tip: organ.points.at(-1)!,
    angle: i * 2.399963229728653,
    scale: 0.52 - i * 0.022,
  }));

/** The blade's origin is the same rendered pedicel root, including its below-head bridge. */
export function writeLobeliaUpperLeafMatrix(
  target: Matrix4,
  pose: LobeliaUpperAttachment,
  state: PlantAttachmentState,
  scratch: { position: Vector3; normal: Vector3 },
) {
  const position = scratch.position.set(
    pose.root[0],
    pose.root[1],
    pose.root[2],
  );
  scratch.normal.set(0, 1, 0);
  writeHeadAttachmentVertex(
    position,
    scratch.normal,
    pose.root,
    pose.tip,
    state,
  );
  if (pose.root[1] >= 0) {
    target
      .makeRotationY(pose.angle)
      .setPosition(pose.root[0], pose.root[1], pose.root[2])
      .premultiply(state.head);
    return target;
  }
  const g = Math.max(0.03, state.growth),
    t = Math.max(
      0,
      Math.min(1, (pose.root[1] + state.stemLength) / state.stemLength),
    ),
    slope = supportedBendSlope(t, state.supportHeight) / state.stemLength,
    ca = Math.cos(pose.angle),
    sa = Math.sin(pose.angle);
  return target.set(
    ca,
    state.motion.x * slope,
    sa,
    position.x,
    0,
    g - state.motion.drop * slope,
    0,
    position.y,
    -sa,
    state.motion.z * slope,
    ca,
    position.z,
    0,
    0,
    0,
    1,
  );
}
