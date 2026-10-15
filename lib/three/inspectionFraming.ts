import { Vector3, type Box3 } from "three";
import type { Vec3 } from "../flowers/types";

export interface InspectionCameraDirection {
  back?: Vec3;
  up?: Vec3;
  elevation?: number;
}

/** One-time debug camera fit; all corners retain margin, including tall shoots. */
export function fitInspectionBounds(
  box: Box3,
  aspect: number,
  fov: number,
  macroTarget?: Vec3,
  direction: InspectionCameraDirection = {},
) {
  const target = macroTarget
    ? new Vector3(...macroTarget)
    : box.getCenter(new Vector3());
  const elevation = direction.elevation ?? Math.atan(0.16),
    back = direction.back
      ? new Vector3(...direction.back).normalize()
      : new Vector3(0, Math.sin(elevation), Math.cos(elevation)),
    referenceUp = new Vector3(...(direction.up ?? [0, 1, 0]));
  if (Math.abs(referenceUp.dot(back)) > 0.999) referenceUp.set(0, 0, 1);
  const right = new Vector3().crossVectors(referenceUp, back).normalize(),
    up = new Vector3().crossVectors(back, right).normalize();
  const vertical = Math.tan((fov * Math.PI) / 360),
    horizontal = vertical * Math.max(0.1, aspect);
  const corner = new Vector3();
  let distance = 0.2;
  for (let i = 0; i < 8; i++) {
    corner
      .set(
        i & 1 ? box.max.x : box.min.x,
        i & 2 ? box.max.y : box.min.y,
        i & 4 ? box.max.z : box.min.z,
      )
      .sub(target);
    const depth = corner.dot(back);
    distance = Math.max(
      distance,
      depth + Math.abs(corner.dot(right)) / (horizontal * 0.9),
      depth + Math.abs(corner.dot(up)) / (vertical * 0.9),
    );
  }
  const position = target.clone().addScaledVector(back, distance + 0.03);
  return {
    position: [position.x, position.y, position.z] as Vec3,
    target: [target.x, target.y, target.z] as Vec3,
    up: [up.x, up.y, up.z] as Vec3,
  };
}
