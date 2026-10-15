import type { FlowerStructure, Vec3 } from "./types";
/** Retain the established low side diagnostic and opt in other presets by species. */
export function flowerCameraElevation(structure: FlowerStructure, azimuth = 0) {
  return Math.abs(Math.cos(azimuth)) < 1e-8
    ? undefined
    : structure.cameraElevation;
}

/** Legacy distances are horizontal; a changed elevation preserves the true camera distance. */
export function flowerCameraPose(
  structure: FlowerStructure,
  target: Vec3,
  distance: number,
  azimuth = 0,
  fallbackRise = 0.32,
): { position: Vec3; target: Vec3 } {
  const elevation = flowerCameraElevation(structure, azimuth),
    length = distance * Math.hypot(1, fallbackRise),
    horizontal =
      elevation === undefined ? distance : length * Math.cos(elevation),
    vertical =
      elevation === undefined
        ? distance * fallbackRise
        : length * Math.sin(elevation);
  return {
    position: [
      target[0] + Math.sin(azimuth) * horizontal,
      target[1] + vertical,
      target[2] + Math.cos(azimuth) * horizontal,
    ],
    target,
  };
}
/** Shared portrait, garden and inspection macro target from anatomical coordinates. */
export function flowerHeadTarget(
  structure: FlowerStructure,
  root: Vec3,
  scale = 1,
): Vec3 {
  const center = structure.headCenter ?? [0, 0, 0],
    c = Math.cos(structure.headTilt),
    s = Math.sin(structure.headTilt);
  return [
    root[0] + center[0] * scale,
    root[1] + (structure.stemLength + center[1] * c - center[2] * s) * scale,
    root[2] + (center[1] * s + center[2] * c) * scale,
  ];
}

/** Fit authored full-plant bounds once per preset/resize; leave manual orbit free. */
export function flowerPortraitPose(
  structure: FlowerStructure,
  root: Vec3,
  aspect: number,
  fov: number,
  azimuth = 0,
  desktop = true,
): { position: Vec3; target: Vec3 } | undefined {
  const bounds = structure.portraitBounds;
  if (!bounds) return undefined;
  const origin: Vec3 = [root[0], root[1] + structure.stemLength, root[2]];
  const target: Vec3 = origin.map(
    (v, i) => v + (bounds.min[i] + bounds.max[i]) / 2,
  ) as Vec3;
  if (desktop) target[0] -= 0.6;
  const elevation = flowerCameraElevation(structure, azimuth),
    rise = elevation === undefined ? 0.16 : Math.tan(elevation),
    inverse = 1 / Math.hypot(1, rise),
    sa = Math.sin(azimuth),
    ca = Math.cos(azimuth);
  const back: Vec3 = [sa * inverse, rise * inverse, ca * inverse];
  const right: Vec3 = [ca, 0, -sa],
    up: Vec3 = [-back[1] * sa, inverse, -back[1] * ca];
  const vertical = Math.tan((fov * Math.PI) / 360),
    horizontal = vertical * Math.max(0.1, aspect);
  let distance = 0.2;
  for (let corner = 0; corner < 8; corner++) {
    const p = origin.map(
      (v, i) =>
        v + (corner & (1 << i) ? bounds.max[i] : bounds.min[i]) - target[i],
    );
    const dot = (axis: Vec3) => p.reduce((sum, v, i) => sum + v * axis[i], 0);
    const depth = dot(back);
    distance = Math.max(
      distance,
      depth + Math.abs(dot(right)) / (horizontal * 0.78),
      depth + Math.abs(dot(up)) / (vertical * 0.78),
    );
  }
  return {
    position: target.map((v, i) => v + back[i] * (distance + 0.03)) as Vec3,
    target,
  };
}

/** Keep fitted anatomy visible through the entire permitted portrait orbit. */
export function flowerPortraitVisibility(
  structure: FlowerStructure,
  pose: { position: Vec3; target: Vec3 },
  root: Vec3,
) {
  const maxDistance = Math.max(
    15,
    Math.hypot(...pose.position.map((v, i) => v - pose.target[i])) * 1.8,
  );
  let radius = 0;
  const bounds = structure.portraitBounds;
  if (bounds)
    for (let corner = 0; corner < 8; corner++)
      radius = Math.max(
        radius,
        Math.hypot(
          ...root.map(
            (v, i) =>
              v +
              (i === 1 ? structure.stemLength : 0) +
              (corner & (1 << i) ? bounds.max[i] : bounds.min[i]) -
              pose.target[i],
          ),
        ),
      );
  const fogNear = Math.max(11, maxDistance + radius + 1),
    fogFar = Math.max(25, fogNear + 14);
  return { maxDistance, fogNear, fogFar, cameraFar: Math.max(45, fogFar + 1) };
}
