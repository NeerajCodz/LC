import type { Matrix4, Vector3 } from "three";
import type { Vec3 } from "../flowers/types";
import { supportedBendSlope, supportedBendWeight } from "../flowers/wind";

export interface PlantAttachmentState {
  stemLength: number;
  supportHeight: number;
  growth: number;
  motion: { x: number; z: number; drop: number };
  /** Actual local head pose, including garden contact and authored head tilt. */
  head: Matrix4;
}

/** Existing stem deformation, kept byte-for-byte equivalent in its coefficients. */
export function writeStemVertex(
  position: Vector3,
  normal: Vector3,
  state: PlantAttachmentState,
) {
  const length = state.stemLength,
    g = Math.max(0.03, state.growth),
    t = Math.max(0, Math.min(1, (position.y + length) / length)),
    weight = supportedBendWeight(t, state.supportHeight),
    slope = supportedBendSlope(t, state.supportHeight) / length,
    { x, z, drop } = state.motion,
    ny =
      (normal.y - slope * (normal.x * x + normal.z * z)) /
      Math.max(0.02, g - drop * slope);
  position.set(
    position.x + x * weight,
    -length + (position.y + length) * g - drop * weight,
    position.z + z * weight,
  );
  normal.set(normal.x, ny, normal.z).normalize();
}

/**
 * A stalk is carried by the head. If its first point is below the head, bridge
 * that real insertion to the rooted stem instead of shrinking the whole stalk.
 * The affine bridge reaches zero correction at the stalk's upper endpoint.
 * Caller-owned vectors are reused; the normal is the exact inverse-transpose
 * Jacobian of this position field, including the bridge's height derivative.
 */
export function writeHeadAttachmentVertex(
  position: Vector3,
  normal: Vector3,
  root: Vec3,
  tip: Vec3,
  state: PlantAttachmentState,
) {
  const e = state.head.elements,
    px = position.x,
    py = position.y,
    pz = position.z,
    nx = normal.x,
    ny = normal.y,
    nz = normal.z;
  let dx = 0,
    dy = 0,
    dz = 0,
    amount = 0,
    derivative = 0;
  if (root[1] < 0) {
    const span = tip[1] - root[1];
    if (!(span > 0))
      throw new Error(
        "A head-attached stalk must end above its lower insertion",
      );
    const length = state.stemLength,
      g = Math.max(0.03, state.growth),
      t = Math.max(0, Math.min(1, (root[1] + length) / length)),
      weight = supportedBendWeight(t, state.supportHeight),
      hx = e[0] * root[0] + e[4] * root[1] + e[8] * root[2] + e[12],
      hy = e[1] * root[0] + e[5] * root[1] + e[9] * root[2] + e[13],
      hz = e[2] * root[0] + e[6] * root[1] + e[10] * root[2] + e[14];
    dx = root[0] + state.motion.x * weight - hx;
    dy = -length + (root[1] + length) * g - state.motion.drop * weight - hy;
    dz = root[2] + state.motion.z * weight - hz;
    amount = Math.max(0, Math.min(1, (tip[1] - py) / span));
    derivative = py > root[1] && py < tip[1] ? -1 / span : 0;
  }
  position.set(
    e[0] * px + e[4] * py + e[8] * pz + e[12] + dx * amount,
    e[1] * px + e[5] * py + e[9] * pz + e[13] + dy * amount,
    e[2] * px + e[6] * py + e[10] * pz + e[14] + dz * amount,
  );
  const qx = e[0] * dx + e[1] * dy + e[2] * dz,
    qy = e[4] * dx + e[5] * dy + e[6] * dz,
    qz = e[8] * dx + e[9] * dy + e[10] * dz,
    correction =
      (derivative * (qx * nx + qy * ny + qz * nz)) / (1 + derivative * qy);
  normal
    .set(
      e[0] * nx + e[4] * (ny - correction) + e[8] * nz,
      e[1] * nx + e[5] * (ny - correction) + e[9] * nz,
      e[2] * nx + e[6] * (ny - correction) + e[10] * nz,
    )
    .normalize();
}

/** Unpitched node collar: fixed radial size, stem growth/shear, and node azimuth. */
export function writeStemNodeMatrix(
  target: Matrix4,
  node: { t: number; angle: number; offset?: Vec3 },
  state: PlantAttachmentState,
) {
  const g = Math.max(0.03, state.growth),
    length = state.stemLength,
    weight = supportedBendWeight(node.t, state.supportHeight),
    slope = supportedBendSlope(node.t, state.supportHeight) / length,
    ca = Math.cos(node.angle),
    sa = Math.sin(node.angle),
    { x, z, drop } = state.motion;
  target.set(
    ca,
    x * slope,
    sa,
    0.025 * Math.sin(node.t * Math.PI) +
      (node.offset?.[0] ?? 0) * g +
      x * weight,
    0,
    g - drop * slope,
    0,
    -length + (length * node.t + (node.offset?.[1] ?? 0)) * g - drop * weight,
    -sa,
    z * slope,
    ca,
    (node.offset?.[2] ?? 0) * g + z * weight,
    0,
    0,
    0,
    1,
  );
  return target;
}
