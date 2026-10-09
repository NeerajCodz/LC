import type { Vec3 } from "../flowers/types";
import type { SpecimenOrgan } from "./specimenModel";
import { seededRandom } from "./noise";

/** Shared organ construction only; each specimen supplies counts and insertions. */
export function floralStamens({
  count,
  cluster,
  radius,
  height,
  base = 0.04,
  filament = "#ebd59c",
  anther = "#d2a637",
  filamentRadius = 0.004,
  antherLength = 0.04,
  spiral = false,
  foldedHeight = height * 0.65,
}: {
  count: number;
  cluster: number;
  radius: number;
  height: number;
  base?: number;
  filament?: string;
  anther?: string;
  filamentRadius?: number;
  antherLength?: number;
  spiral?: boolean;
  foldedHeight?: number;
}): SpecimenOrgan[] {
  const random = seededRandom(415),
    organs: SpecimenOrgan[] = [];
  for (let i = 0; i < count; i++) {
    const a = spiral ? i * 2.399963229728653 : (i * Math.PI * 2) / count;
    const r = radius * (spiral ? 0.55 + 0.45 * random() : 1);
    const h = height * (0.94 + 0.12 * random());
    const point = (radial: number, y: number): Vec3 => [
      Math.sin(a) * radial,
      y,
      Math.cos(a) * radial,
    ];
    const full: Vec3[] = [
      point(r * 0.75, base),
      point(r * 0.9, (h + base) / 2),
      point(r, h),
    ];
    const folded: Vec3[] = [
      point(r * 0.55, base),
      point(r * 0.55, (foldedHeight + base) / 2),
      point(r * 0.5, foldedHeight),
    ];
    organs.push({
      name: "stamen filament",
      cluster,
      points: full,
      foldedPoints: folded,
      radius: filamentRadius,
      endRadius: filamentRadius * 0.72,
      color: filament,
    });
    for (const side of [-1, 1]) {
      const chamber = (p: Vec3, length: number): Vec3[] => [
        p,
        [
          p[0] + Math.cos(a) * side * filamentRadius * 1.4,
          p[1] + length * 0.45,
          p[2] - Math.sin(a) * side * filamentRadius * 1.4,
        ],
        [
          p[0] + Math.cos(a) * side * filamentRadius,
          p[1] + length,
          p[2] - Math.sin(a) * side * filamentRadius,
        ],
      ];
      organs.push({
        name: "stamen anther chamber",
        cluster,
        points: chamber(full[2], antherLength),
        foldedPoints: chamber(folded[2], antherLength * 0.7),
        radius: filamentRadius * 1.65,
        endRadius: filamentRadius,
        flatten: 0.7,
        color: anther,
      });
    }
  }
  return organs;
}
