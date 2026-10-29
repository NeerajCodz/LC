import type { Quality, Vec3 } from "@/lib/flowers/types";
import type { SpecimenOrgan, SpecimenSurface } from "@/lib/three/specimenModel";
import { createOrganicTube } from "@/lib/three/organicTube";

export const LANTANA_LEAF: SpecimenSurface = {
  name: "rough ovate crenate lantana blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.012,
  minimumRows: 40,
  overviewRows: 40,
  overviewColumns: 6,
  sample: (u, v, open): Vec3 => {
    const w = 2 * u - 1,
      teeth = 1 - 0.105 * (0.5 + 0.5 * Math.cos(v * 24 * Math.PI)) ** 2,
      width =
        (0.003 + 0.32 * Math.sin(Math.PI * v) ** 0.72 * (1.26 - 0.68 * v)) *
        teeth,
      x = w * width * (0.28 + 0.72 * open),
      raised =
        0.007 *
        Math.sin(v * 38 + Math.abs(w) * 9) *
        Math.sin(Math.PI * v) *
        (1 - w * w),
      z =
        0.052 * w * w +
        0.055 * v * v +
        raised +
        0.045 * Math.abs(w) * (1 - open);
    return [x, 0.13 + 0.92 * v, z];
  },
};
export const LANTANA_PETIOLE: SpecimenOrgan = {
  name: "lantana leaf petiole",
  cluster: 0,
  points: [
    [0, 0, 0],
    [0, 0.065, 0],
    [0, 0.13, 0],
  ],
  radius: 0.013,
  endRadius: 0.008,
  color: "#7d925a",
};
export const LANTANA_LEAF_TILT = 0.98;
export const LANTANA_LEAF_FACE_ROTATION: Vec3 = [0, Math.PI, 0];
/** Rounded basal wood grades into a four-angled green shoot; no per-frame construction. */
export function createLantanaShoot(
  quality: Quality,
  length: number,
  radius: number,
) {
  const g = createOrganicTube({
    points: [
      [0, -length, 0],
      [0, -length * 0.5, 0],
      [0, 0, 0],
    ],
    radius: radius * 1.35,
    endRadius: radius,
    color: "#857057",
    tipColor: "#69844f",
    segments: quality === "overview" || quality === "low" ? 40 : 80,
    sides: 16,
  });
  const p = g.getAttribute("position");
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i),
      z = p.getZ(i),
      r = Math.hypot(x, z),
      t = (p.getY(i) + length) / length;
    if (r < 1e-10) continue;
    const square = r / Math.max(Math.abs(x), Math.abs(z)),
      f = 1 + (square - 1) * t ** 2;
    p.setXYZ(i, x * f, p.getY(i), z * f);
  }
  g.computeVertexNormals();
  g.computeBoundingSphere();
  return g;
}
