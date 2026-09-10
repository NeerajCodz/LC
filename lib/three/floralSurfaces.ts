import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import type { Quality, Vec3 } from "../flowers/types";
export type FloralSurface =
  "corona" | "calla" | "anthurium" | "pouch" | "spur" | "boat";
/** Mid-surfaces sampled in UV space, with an anatomical folded state. */
export function sampleFloralSurface(
  kind: FloralSurface,
  u: number,
  v: number,
  open: number,
): Vec3 {
  const a = (u - 0.5) * Math.PI * 2;
  if (kind === "corona") {
    const r =
      0.04 + 0.12 * open + (0.025 + 0.095 * open) * v + 0.14 * v ** 5 * open;
    return [
      Math.sin(a) * r,
      v * (0.38 + 0.46 * open) + 0.028 * Math.sin(a * 10) * v ** 8 * open,
      Math.cos(a) * r,
    ];
  }
  if (kind === "spur") {
    const r = 0.008 + 0.13 * (1 - v) ** 1.1;
    return [Math.sin(a) * r, 0.7 * v, Math.cos(a) * r + 0.17 * v * v * open];
  }
  if (kind === "pouch") {
    const t = (u - 0.5) * Math.PI * 2;
    const width =
      0.035 + Math.sin(Math.PI * v ** 0.55) ** 0.7 * (0.07 + 0.35 * open);
    const cleft = 0.14 * Math.exp(-(Math.sin(t) ** 2) * 25) * (1 - v) ** 3;
    return [Math.sin(t) * width, -0.8 * v - cleft, Math.cos(t) * width * 0.6];
  }
  if (kind === "boat") {
    const x = (u - 0.5) * 2;
    const width = 0.035 + 0.28 * Math.sin(Math.PI * v) ** 0.6;
    return [
      v * 1.5 - 0.35,
      -0.09 + width * x * x * (0.35 + 0.65 * open),
      x * width,
    ];
  }
  if (kind === "anthurium") {
    const x = (u - 0.5) * 2;
    const width = 0.015 + 0.87 * Math.sin(Math.PI * (0.22 + 0.78 * v)) ** 0.65;
    const heart = -0.32 * (1 - Math.exp(-x * x * 18)) * (1 - v) ** 2;
    const angle = x * (open * 0.85 + (1 - open) * 2.7);
    const radial = width / 0.85;
    return [
      Math.sin(angle) * radial * (0.28 + 0.72 * open),
      v * 1.65 + heart,
      (Math.cos(angle) - 1) * radial * (0.16 + 0.84 * open) +
        0.22 * Math.sin(Math.PI * v) +
        0.025 * Math.sin(v * 22 + x * 8) * Math.abs(x),
    ];
  }
  // Calla: a continuous wrapped spathe with a flared asymmetric lip.
  const theta = (u - 0.5) * (open * 4.6 + (1 - open) * 6.05);
  const r = 0.055 + Math.sin(v * Math.PI * 0.72) ** 1.3 * (0.11 + 0.55 * open);
  return [
    Math.sin(theta) * r,
    v * 1.75 + 0.34 * v ** 5 * Math.cos(theta),
    Math.cos(theta) * r + 0.19 * v * v,
  ];
}
export function createFloralSurface(
  kind: FloralSurface,
  quality: Quality,
): BufferGeometry {
  const columns =
    quality === "low"
      ? 22
      : quality === "medium"
        ? 34
        : quality === "high"
          ? 50
          : 70;
  const rows = Math.round(columns * 1.2),
    stride = columns + 1,
    count = stride * (rows + 1);
  const indices: number[] = [],
    uv: number[] = [],
    colors: number[] = [];
  for (let side = 0; side < 2; side++)
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i <= columns; i++) {
        uv.push(i / columns, j / rows);
        const tint = 0.91 + (0.07 * j) / rows;
        colors.push(tint, tint, tint);
        if (i < columns && j < rows) {
          const a = side * count + j * stride + i,
            b = a + 1,
            c = a + stride,
            d = c + 1;
          indices.push(...(side ? [a, d, b, a, c, d] : [a, b, d, a, d, c]));
        }
      }
  const edge: number[] = [];
  for (let i = 0; i <= columns; i++) edge.push(i);
  for (let j = 1; j <= rows; j++) edge.push(j * stride + columns);
  for (let i = columns - 1; i >= 0; i--) edge.push(rows * stride + i);
  for (let j = rows - 1; j > 0; j--) edge.push(j * stride);
  for (let i = 0; i < edge.length; i++) {
    const a = edge[i],
      b = edge[(i + 1) % edge.length];
    indices.push(a, a + count, b + count, a, b + count, b);
  }
  function state(open: number) {
    const positions: number[] = [];
    const du = new Vector3(),
      dv = new Vector3(),
      n = new Vector3();
    for (let side = 0; side < 2; side++)
      for (let j = 0; j <= rows; j++)
        for (let i = 0; i <= columns; i++) {
          const u = i / columns,
            v = j / rows,
            p = sampleFloralSurface(kind, u, v, open);
          const l = sampleFloralSurface(kind, u - 0.0001, v, open),
            r = sampleFloralSurface(kind, u + 0.0001, v, open);
          const b = sampleFloralSurface(kind, u, Math.max(0, v - 0.0001), open),
            t = sampleFloralSurface(kind, u, Math.min(1, v + 0.0001), open);
          du.set(r[0] - l[0], r[1] - l[1], r[2] - l[2]);
          dv.set(t[0] - b[0], t[1] - b[1], t[2] - b[2]);
          n.crossVectors(du, dv).normalize();
          const thickness =
            (kind === "pouch" ? 0.024 : 0.014) * (side ? -0.5 : 0.5);
          positions.push(
            p[0] + n.x * thickness,
            p[1] + n.y * thickness,
            p[2] + n.z * thickness,
          );
        }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }
  const geometry = state(1),
    folded = state(0);
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.morphAttributes.position = [folded.getAttribute("position")];
  geometry.morphAttributes.normal = [folded.getAttribute("normal")];
  folded.dispose();
  geometry.computeBoundingSphere();
  return geometry;
}
