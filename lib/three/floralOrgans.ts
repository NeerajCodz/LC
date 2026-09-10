import { BufferGeometry } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import { createOrganicTube } from "./organicTube";
import type { Quality, Vec3 } from "../flowers/types";
import { seededRandom, GOLDEN_ANGLE } from "./noise";
export function organTube(
  points: Vec3[],
  radius: number,
  color: string,
  quality: Quality,
  endRadius = radius * 0.7,
  flatten = 1,
) {
  return createOrganicTube({
    points,
    radius,
    endRadius,
    color,
    tipColor: color,
    segments: quality === "low" ? 10 : 24,
    sides: quality === "low" ? 7 : 12,
    flatten,
    grain: 0.025,
  });
}
export function joinOrgans(parts: BufferGeometry[]) {
  const merged = mergeGeometries(parts);
  parts.forEach((g) => g.dispose());
  if (!merged) throw new Error("Incompatible floral organ attributes");
  return merged;
}
export function stamenRing(
  count: number,
  radius: number,
  height: number,
  quality: Quality,
  filament = "#e3c270",
  anther = "#a5792e",
) {
  const parts: BufferGeometry[] = [],
    random = seededRandom(619);
  for (let i = 0; i < count; i++) {
    const a = i * GOLDEN_ANGLE,
      r = radius * (0.8 + random() * 0.2),
      h = height * (0.85 + random() * 0.3),
      x = Math.sin(a) * r,
      z = Math.cos(a) * r;
    parts.push(
      organTube(
        [
          [x * 0.4, 0, z * 0.4],
          [x * 0.7, h * 0.55, z * 0.7],
          [x, h, z],
        ],
        0.0065,
        filament,
        quality,
        0.004,
      ),
    );
    for (const side of [-1, 1])
      parts.push(
        organTube(
          [
            [x + side * 0.007, h - 0.025, z],
            [x + side * 0.012, h, z + 0.007],
            [x + side * 0.007, h + 0.025, z],
          ],
          0.011,
          anther,
          quality,
          0.008,
        ),
      );
  }
  return parts;
}
export function createPoppyHeart(quality: Quality) {
  const parts = stamenRing(
    quality === "low" ? 55 : 95,
    0.32,
    0.28,
    quality,
    "#493044",
    "#292332",
  );
  parts.push(
    organTube(
      [
        [0, 0.02, 0],
        [0, 0.13, 0],
        [0, 0.24, 0],
      ],
      0.14,
      "#789262",
      quality,
      0.16,
    ),
  );
  for (let i = 0; i < 12; i++) {
    const a = (i * Math.PI) / 6;
    parts.push(
      organTube(
        [
          [0, 0.255, 0],
          [Math.sin(a) * 0.09, 0.263, Math.cos(a) * 0.09],
          [Math.sin(a) * 0.17, 0.23, Math.cos(a) * 0.17],
        ],
        0.009,
        "#a4ae85",
        quality,
        0.006,
      ),
    );
  }
  return joinOrgans(parts);
}

export { createSpadix } from "./spadixGeometry";
