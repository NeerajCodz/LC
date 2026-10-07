import { BufferGeometry, Float32BufferAttribute } from "three";
import type { Quality } from "../flowers/types";
import type { SpecimenSurface } from "./specimenModel";

/** Continuous pinnate/entire blades; their species profiles remain in species modules. */
export function leafBlade(
  name: string,
  length: number,
  width: number,
  options: {
    teeth?: number;
    depth?: number;
    cup?: number;
    twist?: number;
    wrinkle?: number;
    thickness?: number;
  } = {},
): SpecimenSurface {
  return {
    name,
    cluster: 0,
    role: "bract",
    tissue: "leaf",
    thickness: options.thickness ?? 0.009,
    sample: (u, v, open) => {
      const w = 2 * u - 1,
        margin =
          1 -
          (options.depth ?? 0) *
            (0.5 + 0.5 * Math.cos(v * (options.teeth ?? 1) * Math.PI * 2)) ** 3;
      const x =
        w *
        (0.004 + width * Math.sin(Math.PI * v) ** 0.72 * margin) *
        (0.25 + 0.75 * open);
      const a = (options.twist ?? 0) * Math.min(1, v / 0.28);
      const z =
        (options.cup ?? 0.065) * (w * w + v * v) +
        (options.wrinkle ?? 0) *
          Math.sin(v * 65 + Math.abs(w) * 14) *
          (1 - w * w);
      return [
        x * Math.cos(a) - z * Math.sin(a),
        length * v,
        x * Math.sin(a) + z * Math.cos(a) + Math.abs(x) * 0.38 * (1 - open),
      ];
    },
  };
}

/** Fan topology keeps the center filled and the deep lobes connected in one simple leaf. */
export function createPalmateBlade(quality: Quality, lobes = 5) {
  const [sectors, rings] = {
    low: [80, 8],
    medium: [140, 12],
    high: [200, 18],
    ultra: [240, 22],
  }[quality];
  const p: number[] = [],
    uv: number[] = [],
    ix: number[] = [],
    side: number[] = [];
  const directions = Array.from(
    { length: lobes },
    (_, i) => -1.92 + (3.84 * i) / (lobes - 1),
  );
  const half = 1 + sectors * rings;
  for (let s = 0; s < 2; s++) {
    p.push(0, 0.1, s ? -0.004 : 0.004);
    uv.push(0.5, 0);
    side.push(s ? -1 : 1);
    for (let j = 1; j <= rings; j++)
      for (let i = 0; i < sectors; i++) {
        const a = (i / sectors) * Math.PI * 2,
          t = j / rings;
        let outline = 0.105;
        for (let k = 0; k < directions.length; k++) {
          const d = Math.atan2(
            Math.sin(a - directions[k]),
            Math.cos(a - directions[k]),
          );
          outline +=
            (0.76 + 0.19 * (1 - Math.abs(k - (lobes - 1) / 2) / lobes)) *
            Math.exp(-((Math.abs(d) / 0.24) ** 2.4));
        }
        outline *= 1 - 0.025 * (0.5 + 0.5 * Math.cos(a * 81)) ** 3;
        const r = outline * t,
          x = Math.sin(a) * r,
          y = 0.1 + Math.cos(a) * r;
        p.push(
          x,
          y,
          0.07 * r * r + 0.02 * Math.sin(a * 3) * r + (s ? -0.004 : 0.004),
        );
        uv.push(0.5 + x * 0.45, Math.max(0, Math.min(1, y)));
        side.push(s ? -1 : 1);
      }
    const off = s * half,
      tri = (a: number, b: number, c: number) =>
        ix.push(off + a, off + (s ? c : b), off + (s ? b : c));
    for (let i = 0; i < sectors; i++) {
      const n = (i + 1) % sectors;
      tri(0, 1 + n, 1 + i);
      for (let j = 0; j < rings - 1; j++) {
        const a = 1 + j * sectors + i,
          b = 1 + j * sectors + n;
        tri(a, b, b + sectors);
        tri(a, b + sectors, a + sectors);
      }
    }
  }
  const edge = 1 + (rings - 1) * sectors;
  for (let i = 0; i < sectors; i++) {
    const a = edge + i,
      b = edge + ((i + 1) % sectors);
    ix.push(a, b, b + half, a, b + half, a + half);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(p, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setAttribute("tissueSide", new Float32BufferAttribute(side, 1));
  g.setIndex(ix);
  g.computeVertexNormals();
  const folded = p.slice();
  for (let k = 0; k < folded.length; k += 3) {
    folded[k] *= 0.35;
    folded[k + 2] += Math.abs(p[k]) * 0.48 + Math.max(0, p[k + 1]) ** 2 * 0.1;
  }
  const f = new BufferGeometry();
  f.setAttribute("position", new Float32BufferAttribute(folded, 3));
  f.setIndex(ix);
  f.computeVertexNormals();
  g.morphAttributes.position = [f.getAttribute("position")];
  g.morphAttributes.normal = [f.getAttribute("normal")];
  f.dispose();
  g.computeBoundingSphere();
  return g;
}
