import {
  BufferGeometry,
  CatmullRomCurve3,
  Color,
  Float32BufferAttribute,
  Vector3,
} from "three";
import type { Vec3 } from "../flowers/types";

/** Closed organic tube with a transported frame and a tapered, nonuniform section. */
export function createOrganicTube({
  points,
  radius,
  endRadius = radius * 0.6,
  segments = 28,
  sides = 10,
  color = "#e8bd41",
  tipColor = color,
  flatten = 1,
  grain = 0,
}: {
  points: Vec3[];
  radius: number;
  endRadius?: number;
  segments?: number;
  sides?: number;
  color?: string;
  tipColor?: string;
  flatten?: number;
  grain?: number;
}) {
  const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p)));
  const frames = curve.computeFrenetFrames(segments, false);
  const positions: number[] = [],
    colors: number[] = [],
    indices: number[] = [];
  const point = new Vector3(),
    tint = new Color(),
    base = new Color(color),
    tip = new Color(tipColor);
  for (let j = 0; j <= segments; j++) {
    const t = j / segments;
    curve.getPointAt(t, point);
    const cap = Math.pow(Math.max(0.018, Math.sin(Math.PI * t)), 0.24);
    const r = (radius + (endRadius - radius) * t) * cap;
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const relief =
        1 + grain * Math.sin(j * 9.17 + i * 4.83) * Math.sin(j * 2.3 - i * 8.3);
      const x = Math.cos(angle) * r * relief,
        z = Math.sin(angle) * r * flatten * relief;
      const n = frames.normals[j],
        b = frames.binormals[j];
      positions.push(
        point.x + n.x * x + b.x * z,
        point.y + n.y * x + b.y * z,
        point.z + n.z * x + b.z * z,
      );
      tint
        .copy(base)
        .lerp(tip, t)
        .multiplyScalar(0.95 + 0.05 * Math.sin(angle * 2 + t * 12));
      colors.push(tint.r, tint.g, tint.b);
      if (j < segments) {
        const a = j * sides + i,
          next = j * sides + ((i + 1) % sides);
        indices.push(a, next, next + sides, a, next + sides, a + sides);
      }
    }
  }
  for (const end of [0, 1]) {
    const t = end;
    curve.getPointAt(t, point);
    const center = positions.length / 3;
    positions.push(point.x, point.y, point.z);
    tint.copy(end ? tip : base);
    colors.push(tint.r, tint.g, tint.b);
    const offset = end ? segments * sides : 0;
    for (let i = 0; i < sides; i++) {
      const a = offset + i,
        b = offset + ((i + 1) % sides);
      if (end) indices.push(center, a, b);
      else indices.push(center, b, a);
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
