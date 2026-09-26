import type { BufferGeometry } from "three";
import type { Quality, Vec3 } from "../flowers/types";
import { seededRandom } from "./noise";
import { createOrganicTube } from "./organicTube";
import { joinOrgans } from "./floralOrgans";

/** Sparse, tapered 3D trichomes rooted on the actual blade, including its underside. */
export function createPubescence(
  surface: BufferGeometry,
  quality: Quality,
  length: number,
  seed: number,
) {
  const random = seededRandom(seed),
    p = surface.getAttribute("position"),
    n = surface.getAttribute("normal"),
    uv = surface.getAttribute("uv");
  const count = quality === "low" ? 45 : quality === "medium" ? 85 : 150;
  const parts: BufferGeometry[] = [];
  for (let i = 0; i < count; i++) {
    const index = Math.floor(random() * p.count),
      t = uv.getY(index),
      u = uv.getX(index);
    if (t < 0.08 || t > 0.92 || u < 0.08 || u > 0.92) continue;
    const h = length * (0.65 + random() * 0.65),
      x = p.getX(index),
      y = p.getY(index),
      z = p.getZ(index),
      nx = n.getX(index),
      ny = n.getY(index),
      nz = n.getZ(index);
    const points: Vec3[] = [
      [x, y, z],
      [x + nx * h * 0.55, y + ny * h * 0.55 - h * 0.12, z + nz * h * 0.55],
      [x + nx * h * 0.8, y + ny * h * 0.8 - h * 0.5, z + nz * h * 0.8],
    ];
    parts.push(
      createOrganicTube({
        points,
        radius: 0.0008,
        endRadius: 0.00015,
        segments: 3,
        sides: 3,
        color: "#a3b38a",
        grain: 0,
      }),
    );
  }
  return joinOrgans(parts);
}
