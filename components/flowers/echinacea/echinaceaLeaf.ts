import type { Quality } from "@/lib/flowers/types";
import {
  specimenGeometry,
  type SpecimenSurface,
} from "@/lib/three/specimenModel";
import { joinOrgans } from "@/lib/three/floralOrgans";
import { createParametricShell } from "@/lib/three/parametricShell";
import { Float32BufferAttribute } from "three";
export const ECHINACEA_LEAF_TILT = -0.91;
/** Basal petiole becomes a broadly ovate blade with three raised principal veins. */
export const ECHINACEA_LEAF: SpecimenSurface = {
  name: "three-veined serrate echinacea blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.012,
  overviewRows: 40,
  minimumRows: 40,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      t = Math.max(0, (v - 0.18) / 0.82),
      tooth = 1 - 0.045 * (0.5 + 0.5 * Math.cos(t * Math.PI * 32)) ** 3;
    const width =
      0.004 + 0.35 * Math.max(0, Math.sin(t * Math.PI)) ** 0.65 * tooth;
    const vein =
      0.01 * Math.exp(-w * w * 180) +
      0.006 * Math.exp(-((Math.abs(w) - 0.58) ** 2) * 150);
    return [
      w * width * (0.3 + 0.7 * open),
      1.38 * v,
      0.08 * v * v +
        0.065 * w * w * Math.sin(t * Math.PI) +
        vein * Math.sin(t * Math.PI) +
        0.004 * Math.sin(v * 73 + Math.abs(w) * 12) * Math.sin(t * Math.PI) +
        Math.abs(w) * width * 0.38 * (1 - open),
    ];
  },
};
export function createEchinaceaLeaf(quality: Quality) {
  const parts = [specimenGeometry(ECHINACEA_LEAF, quality)];
  const hairs = { overview: 10, low: 18, medium: 32, high: 52, ultra: 72 }[
    quality
  ];
  for (let i = 0; i < hairs; i++) {
    const u = 0.08 + 0.84 * ((i * 0.61803398875) % 1),
      v = 0.24 + 0.68 * ((i * 0.754877666) % 1),
      side = i % 4 === 0 ? -1 : 1;
    const length = 0.014 + 0.012 * ((i * 0.41421356) % 1);
    const g = createParametricShell({
      columns: 2,
      rows: 2,
      thickness: 0.0013,
      sample: (a, b, open) => {
        const p = ECHINACEA_LEAF.sample(u, v, open),
          w = (2 * a - 1) * (0.0004 + 0.0009 * (1 - b));
        return [
          p[0] + w + 0.003 * b,
          p[1] + 0.006 * b,
          p[2] + side * (0.008 + length * b),
        ];
      },
    });
    const count = g.getAttribute("position").count;
    g.setAttribute(
      "tissueSide",
      new Float32BufferAttribute(new Float32Array(count).fill(side), 1),
    );
    parts.push(g);
  }
  return joinOrgans(parts);
}
