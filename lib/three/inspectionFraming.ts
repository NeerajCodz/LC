import { Vector3, type Box3 } from "three";
import type { Vec3 } from "../flowers/types";

/** One-time debug camera fit; all corners retain margin, including tall shoots. */
export function fitInspectionBounds(
  box: Box3,
  aspect: number,
  fov: number,
  macroTarget?: Vec3,
) {
  const target = macroTarget
    ? new Vector3(...macroTarget)
    : box.getCenter(new Vector3());
  const back = new Vector3(0, 0.16, 1).normalize();
  const right = new Vector3(1, 0, 0),
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
  };
}
