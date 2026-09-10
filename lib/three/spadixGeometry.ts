import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import type { Quality } from "../flowers/types";

/** Packed sessile florets embossed into a continuous, capped fleshy axis. */
export function createSpadix(
  quality: Quality,
  anthurium = false,
): BufferGeometry {
  const low = quality === "low",
    ultra = quality === "ultra";
  const around = low ? 16 : ultra ? 32 : 24;
  const tiers = low ? 32 : ultra ? 64 : 48;
  const samples = low ? 3 : 4,
    columns = around * samples,
    rows = tiers * samples;
  const length = anthurium ? 0.94 : 0.86;
  const inclination = anthurium ? 0.33 : 0.14;
  const positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const base = new Color(anthurium ? "#e0ce92" : "#e2c443");
  const basal = new Color(anthurium ? "#bac58b" : "#a8b367");
  const tint = new Color();
  for (let j = 0; j <= rows; j++) {
    const t = j / rows;
    const end = Math.max(0, (t - 0.93) / 0.07);
    const cap = Math.sqrt(Math.max(0.006, 1 - end * end));
    const radius = (anthurium ? 0.066 : 0.058) * (1 - 0.23 * t) * cap;
    for (let i = 0; i < columns; i++) {
      const u = i / columns,
        angle = u * Math.PI * 2;
      // Opposed diagonal phases give contiguous diamond-like flower boundaries.
      const diagonalA = Math.cos(Math.PI * 2 * (u * around + t * tiers * 0.5));
      const diagonalB = Math.cos(Math.PI * 2 * (u * around - t * tiers * 0.5));
      const cushion = Math.pow(
        Math.max(0, (diagonalA + diagonalB + 2) * 0.25),
        2,
      );
      const relief = (anthurium ? 0.0038 : 0.0022) * cushion * cap;
      const r = radius + relief;
      const y = 0.015 + t * length;
      positions.push(
        Math.sin(angle) * r + 0.025 * t,
        y,
        Math.cos(angle) * r + inclination * t,
      );
      tint
        .copy(basal)
        .lerp(base, Math.min(1, t * 9))
        .multiplyScalar(0.97 + cushion * 0.05);
      colors.push(tint.r, tint.g, tint.b);
      if (j < rows) {
        const a = j * columns + i,
          b = j * columns + ((i + 1) % columns);
        const c = a + columns,
          d = b + columns;
        indices.push(a, b, d, a, d, c);
      }
    }
  }
  for (const end of [0, 1]) {
    const center = positions.length / 3,
      y = 0.015 + end * length;
    positions.push(0.025 * end, y, inclination * end);
    const color = end ? base : basal;
    colors.push(color.r, color.g, color.b);
    const offset = end * rows * columns;
    for (let i = 0; i < columns; i++) {
      const a = offset + i,
        b = offset + ((i + 1) % columns);
      indices.push(...(end ? [center, a, b] : [center, b, a]));
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
