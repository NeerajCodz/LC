import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import type { Quality } from "@/lib/flowers/types";

/** Peltate blade: continuous upper/lower surfaces, a sealed margin and radial veins. */
export function createLotusLeaf(quality: Quality) {
  const sides = quality === "ultra" ? 192 : 128,
    rows = 32;
  const positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const top = new Color("#507e67"),
    bottom = new Color("#638473"),
    vein = new Color("#829d77"),
    tint = new Color();
  const surfaceSize = (rows + 1) * sides;
  for (let side = 0; side < 2; side++) {
    for (let j = 0; j <= rows; j++) {
      const t = Math.max(0.002, j / rows);
      for (let i = 0; i < sides; i++) {
        const a = (i / sides) * Math.PI * 2;
        const r =
          0.65 *
          t *
          (1 + 0.025 * Math.sin(a * 7) + 0.012 * Math.sin(a * 11 + 1));
        const rib = Math.pow(
          0.5 + 0.5 * Math.cos(a * 13 + 0.15 * Math.sin(t * 6)),
          42,
        );
        const height =
          0.105 * t * t +
          0.034 * Math.sin(a * 5 + 0.4) * t ** 4 +
          0.007 * rib * Math.sin(t * Math.PI);
        positions.push(
          Math.cos(a) * r,
          height + (side === 0 ? 0.0025 : -0.0025),
          Math.sin(a) * r,
        );
        tint
          .copy(side === 0 ? top : bottom)
          .lerp(vein, rib * 0.25 + Math.exp(-t * 35) * 0.7)
          .multiplyScalar(0.95 + 0.05 * Math.sin(a * 3 + t * 4));
        colors.push(tint.r, tint.g, tint.b);
        if (j < rows) {
          const a0 = side * surfaceSize + j * sides + i,
            b = side * surfaceSize + j * sides + ((i + 1) % sides);
          if (side === 0)
            indices.push(a0, b, b + sides, a0, b + sides, a0 + sides);
          else indices.push(a0, b + sides, b, a0, a0 + sides, b + sides);
        }
      }
    }
  }
  for (let side = 0; side < 2; side++) {
    const center = positions.length / 3;
    positions.push(0, side === 0 ? 0.0025 : -0.0025, 0);
    tint.copy(side === 0 ? vein : bottom);
    colors.push(tint.r, tint.g, tint.b);
    for (let i = 0; i < sides; i++) {
      const a = side * surfaceSize + i,
        b = side * surfaceSize + ((i + 1) % sides);
      if (side === 0) indices.push(center, b, a);
      else indices.push(center, a, b);
    }
  }
  for (let i = 0; i < sides; i++) {
    const a = rows * sides + i,
      b = rows * sides + ((i + 1) % sides);
    indices.push(a, b + surfaceSize, b, a, a + surfaceSize, b + surfaceSize);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}
