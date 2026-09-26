import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import type { Vec3 } from "../flowers/types";

export interface ShellOptions {
  columns: number;
  rows: number;
  thickness: number;
  periodic?: boolean;
  sample: (u: number, v: number, open: number) => Vec3;
}

/** Two sampled surfaces joined around their real perimeter, with matching morph normals. */
export function createParametricShell({
  columns,
  rows,
  thickness,
  periodic = false,
  sample,
}: ShellOptions) {
  const stride = periodic ? columns : columns + 1,
    count = stride * (rows + 1);
  const indices: number[] = [],
    uv: number[] = [];
  for (let side = 0; side < 2; side++)
    for (let j = 0; j <= rows; j++)
      for (let i = 0; i < stride; i++) {
        uv.push(i / columns, j / rows);
        if (j === rows || (!periodic && i === columns)) continue;
        const a = side * count + j * stride + i,
          b = side * count + j * stride + ((i + 1) % stride),
          c = a + stride,
          d = b + stride;
        indices.push(...(side ? [a, d, b, a, c, d] : [a, b, d, a, d, c]));
      }
  const join = (a: number, b: number) =>
    indices.push(a, a + count, b + count, a, b + count, b);
  if (periodic) {
    for (let i = 0; i < columns; i++) {
      const next = (i + 1) % columns;
      join(i, next);
      join(rows * stride + next, rows * stride + i);
    }
  } else {
    const edge: number[] = [];
    for (let i = 0; i <= columns; i++) edge.push(i);
    for (let j = 1; j <= rows; j++) edge.push(j * stride + columns);
    for (let i = columns - 1; i >= 0; i--) edge.push(rows * stride + i);
    for (let j = rows - 1; j > 0; j--) edge.push(j * stride);
    for (let i = 0; i < edge.length; i++)
      join(edge[i], edge[(i + 1) % edge.length]);
  }
  const state = (open: number) => {
    const positions: number[] = [],
      du = new Vector3(),
      dv = new Vector3(),
      normal = new Vector3();
    for (let side = 0; side < 2; side++)
      for (let j = 0; j <= rows; j++)
        for (let i = 0; i < stride; i++) {
          const u = i / columns,
            v = j / rows,
            p = sample(u, v, open);
          const l = sample(
              periodic ? u - 0.0001 : Math.max(0, u - 0.0001),
              v,
              open,
            ),
            r = sample(
              periodic ? u + 0.0001 : Math.min(1, u + 0.0001),
              v,
              open,
            );
          const b = sample(u, Math.max(0, v - 0.0001), open),
            t = sample(u, Math.min(1, v + 0.0001), open);
          du.set(r[0] - l[0], r[1] - l[1], r[2] - l[2]);
          dv.set(t[0] - b[0], t[1] - b[1], t[2] - b[2]);
          normal.crossVectors(du, dv).normalize();
          const offset = thickness * (1 - 0.2 * v) * (side ? -0.5 : 0.5);
          positions.push(
            p[0] + normal.x * offset,
            p[1] + normal.y * offset,
            p[2] + normal.z * offset,
          );
        }
    const g = new BufferGeometry();
    g.setAttribute("position", new Float32BufferAttribute(positions, 3));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  };
  const geometry = state(1),
    closed = state(0);
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.setAttribute(
    "color",
    new Float32BufferAttribute(new Float32Array(count * 2 * 3).fill(1), 3),
  );
  geometry.morphAttributes.position = [closed.getAttribute("position")];
  geometry.morphAttributes.normal = [closed.getAttribute("normal")];
  closed.dispose();
  geometry.computeBoundingSphere();
  return geometry;
}
