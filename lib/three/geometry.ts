import { BufferGeometry, Float32BufferAttribute } from "three";
import type { PetalProfile, Quality } from "../flowers/types";
import { seededRandom } from "./noise";

const RESOLUTION: Record<Quality, [number, number]> = {
  low: [16, 22],
  medium: [22, 32],
  high: [30, 44],
};

/** A sealed, double-surface petal. Its front, back and perimeter are real triangles. */
export function createPetalGeometry(
  profile: PetalProfile,
  seed: number,
  quality: Quality = "high",
): BufferGeometry {
  const [columns, rows] = RESOLUTION[quality];
  const random = seededRandom(seed);
  const phase = random() * Math.PI * 2;
  const asymmetry = (random() - 0.5) * 0.09;
  const positions: number[] = [];
  const colors: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const sideSize = (columns + 1) * (rows + 1);

  for (let side = 0; side < 2; side++) {
    for (let row = 0; row <= rows; row++) {
      const t = row / rows;
      // A tiny nonzero margin keeps the shell manifold at its root and tip.
      const rounded = profile.roundness ?? 0;
      const envelope =
        0.006 +
        Math.pow(
          Math.max(
            0,
            Math.sin(Math.PI * Math.pow(t, 0.83) * (1 - rounded * 0.43)),
          ),
          profile.taper,
        );
      for (let column = 0; column <= columns; column++) {
        const u = (column / columns) * 2 - 1;
        const edge = Math.pow(Math.abs(u), 3);
        const ruffle = Math.max(edge, Math.pow(t, 6) * rounded * 0.8);
        const ruffleEnvelope = Math.sin(t * Math.PI * (1 - rounded * 0.3));
        const x =
          u * profile.width * 0.5 * envelope * (1 + asymmetry * u) +
          Math.sin(t * Math.PI) * asymmetry * profile.width;
        const notch =
          (profile.notch ?? 0) * Math.exp(-u * u * 45) * Math.pow(t, 12);
        const y =
          profile.length *
            (t * (1 - rounded * 0.3 * (1 - Math.sqrt(Math.max(0, 1 - u * u)))) -
              notch) +
          Math.sin(u * 4.8 + phase) * profile.ripple * ruffle * ruffleEnvelope;
        const z =
          profile.length *
            (profile.cup * t * t + profile.curl * Math.pow(t, 5)) -
          profile.edge * u * u * envelope * Math.sqrt(t) +
          profile.ripple *
            Math.sin(u * 13 + t * 18 + phase) *
            ruffle *
            ruffleEnvelope +
          profile.twist * u * t * t * envelope;
        if (profile.wrapAngle) {
          // A tulip tepal is a section of a cup, rather than a radial blade.
          const radius =
            0.065 + profile.width * 0.52 * Math.sin(t * Math.PI * 0.66);
          positions.push(
            Math.sin(u * profile.wrapAngle) * radius,
            profile.length *
              t *
              (0.8 + 0.2 * Math.sqrt(Math.max(0, 1 - u * u))),
            Math.cos(u * profile.wrapAngle) * radius -
              0.065 +
              profile.curl * Math.pow(t, 5),
          );
        } else positions.push(x, y, z);
        uvs.push(column / columns, t);
        const veins = Math.cos(u * 24 + t * 3) * 0.018 * Math.sin(t * Math.PI);
        const shade = 0.64 + 0.32 * Math.pow(t, 0.55) + edge * 0.035 + veins;
        colors.push(
          shade,
          shade * (0.96 + 0.04 * t),
          shade * (0.94 + 0.06 * t),
        );
      }
    }
  }
  for (let side = 0; side < 2; side++) {
    for (let row = 0; row < rows; row++) {
      for (let column = 0; column < columns; column++) {
        const a = side * sideSize + row * (columns + 1) + column;
        const b = a + 1,
          c = a + columns + 1,
          d = c + 1;
        if (side === 0) indices.push(a, b, d, a, d, c);
        else indices.push(a, d, b, a, c, d);
      }
    }
  }
  const perimeter: number[] = [];
  for (let c = 0; c <= columns; c++) perimeter.push(c);
  for (let r = 1; r <= rows; r++) perimeter.push(r * (columns + 1) + columns);
  for (let c = columns - 1; c >= 0; c--)
    perimeter.push(rows * (columns + 1) + c);
  for (let r = rows - 1; r > 0; r--) perimeter.push(r * (columns + 1));
  for (let i = 0; i < perimeter.length; i++) {
    const a = perimeter[i],
      b = perimeter[(i + 1) % perimeter.length];
    indices.push(a, a + sideSize, b + sideSize, a, b + sideSize, b);
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(positions, 3));
  geometry.setAttribute(
    "normal",
    new Float32BufferAttribute(new Float32Array(positions.length), 3),
  );
  geometry.setAttribute("color", new Float32BufferAttribute(colors, 3));
  geometry.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  giveThickness(geometry, uvs, profile.thickness);
  const folded = positions.slice();
  for (let i = 0; i < folded.length / 3; i++) {
    const t = uvs[i * 2 + 1];
    const u = uvs[i * 2] * 2 - 1;
    // Wrap around the bud envelope; tips approach the axis without crossing it.
    const radius = 0.028 + profile.length * 0.235 * Math.sin(Math.PI * t);
    folded[i * 3] = Math.sin(u * 1.13) * radius;
    folded[i * 3 + 1] = profile.length * t * (1 - 0.12 * u * u);
    folded[i * 3 + 2] =
      Math.cos(u * 1.13) * radius + profile.length * 0.125 * t - 0.028;
  }
  const closed = new BufferGeometry();
  closed.setAttribute("position", new Float32BufferAttribute(folded, 3));
  closed.setIndex(indices);
  closed.computeVertexNormals();
  giveThickness(closed, uvs, profile.thickness);
  geometry.morphAttributes.position = [closed.getAttribute("position")];
  geometry.morphAttributes.normal = [closed.getAttribute("normal")];
  closed.dispose();
  geometry.computeBoundingSphere();
  return geometry;
}

/** Offset along the actual surface normal, including recurved tips and folds. */
function giveThickness(
  geometry: BufferGeometry,
  uvs: number[],
  thickness: number,
) {
  const position = geometry.getAttribute("position"),
    normal = geometry.getAttribute("normal");
  for (let i = 0; i < position.count; i++) {
    const t = uvs[i * 2 + 1],
      offset = thickness * (0.65 + 0.35 * Math.sin(Math.PI * t)) * 0.5;
    position.setXYZ(
      i,
      position.getX(i) + normal.getX(i) * offset,
      position.getY(i) + normal.getY(i) * offset,
      position.getZ(i) + normal.getZ(i) * offset,
    );
  }
  position.needsUpdate = true;
  geometry.computeVertexNormals();
}

export const PETAL: PetalProfile = {
  length: 1,
  width: 0.8,
  cup: 0.22,
  curl: 0.12,
  edge: 0.12,
  ripple: 0.015,
  twist: 0.025,
  taper: 0.6,
  thickness: 0.014,
};
