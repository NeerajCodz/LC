import { BufferGeometry, Float32BufferAttribute } from "three";
import type { Quality } from "@/lib/flowers/types";
/** Closed curved fan; the petiole meets the interior hub rather than an edge. */
export function createNasturtiumLeaf(quality: Quality) {
  const [sectors, rings] = {
      overview: [40, 4],
      low: [64, 8],
      medium: [96, 12],
      high: [144, 16],
      ultra: [192, 20],
    }[quality],
    half = 1 + sectors * rings,
    p: number[] = [],
    uv: number[] = [],
    side: number[] = [],
    ix: number[] = [];
  for (let s = 0; s < 2; s++) {
    p.push(0, 0.39, 0.025 + (s ? -0.007 : 0.007));
    uv.push(0.5, 0.5);
    side.push(s ? -1 : 1);
    for (let j = 1; j <= rings; j++)
      for (let i = 0; i < sectors; i++) {
        const a = (i * Math.PI * 2) / sectors,
          r = ((0.48 + 0.005 * Math.cos(a * 10)) * j) / rings,
          x = Math.sin(a) * r,
          y = Math.cos(a) * r * 0.82;
        p.push(
          x,
          0.39 + y,
          0.025 +
            0.047 * r * r +
            0.012 * Math.sin(a * 3) * r +
            (s ? -0.007 : 0.007),
        );
        uv.push(0.5 + x / 0.99, 0.5 + y / 0.82);
        side.push(s ? -1 : 1);
      }
    const off = s * half,
      tri = (a: number, b: number, c: number) =>
        ix.push(off + a, off + (s ? c : b), off + (s ? b : c));
    for (let i = 0; i < sectors; i++) tri(0, 1 + ((i + 1) % sectors), 1 + i);
    for (let j = 1; j < rings; j++)
      for (let i = 0; i < sectors; i++) {
        const a = 1 + (j - 1) * sectors + i,
          b = 1 + (j - 1) * sectors + ((i + 1) % sectors),
          c = 1 + j * sectors + i,
          d = 1 + j * sectors + ((i + 1) % sectors);
        tri(a, b, c);
        tri(b, d, c);
      }
  }
  for (let i = 0; i < sectors; i++) {
    const a = 1 + (rings - 1) * sectors + i,
      b = 1 + (rings - 1) * sectors + ((i + 1) % sectors);
    ix.push(a, b, a + half, b, b + half, a + half);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setAttribute(
    "color",
    new Float32BufferAttribute(new Float32Array(p.length).fill(1), 3),
  );
  g.setAttribute("tissueSide", new Float32BufferAttribute(side, 1));
  g.setIndex(ix);
  g.computeVertexNormals();
  const folded = g.clone(),
    fp = folded.getAttribute("position");
  for (let i = 0; i < fp.count; i++) {
    const x = fp.getX(i);
    fp.setXYZ(
      i,
      x * 0.38,
      0.39 + (fp.getY(i) - 0.39) * 0.92,
      fp.getZ(i) + Math.abs(x) * 0.3,
    );
  }
  folded.computeVertexNormals();
  g.morphAttributes.position = [fp];
  g.morphAttributes.normal = [folded.getAttribute("normal")];
  folded.dispose();
  g.computeBoundingSphere();
  return g;
}
