import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import { mergeGeometries } from "three/addons/utils/BufferGeometryUtils.js";
import type { Quality } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { GOLDEN_ANGLE, seededRandom } from "@/lib/three/noise";

export function lotusCarpels(radius: number) {
  const random = seededRandom(916);
  return Array.from({ length: 19 }, (_, i) => {
    const r = Math.sqrt((i + 0.25) / 19) * radius * 0.78;
    const angle = i * GOLDEN_ANGLE;
    return {
      x: Math.cos(angle) * r,
      z: Math.sin(angle) * r,
      radius: radius * (0.053 + random() * 0.01),
    };
  });
}

export function receptacleTop(
  x: number,
  z: number,
  radius: number,
  height: number,
  carpels = lotusCarpels(radius),
) {
  const r = Math.hypot(x, z) / radius;
  let y = height + 0.007 * (1 - r * r);
  for (const carpel of carpels) {
    const distance = Math.hypot(x - carpel.x, z - carpel.z);
    y -= 0.007 * Math.exp(-Math.pow(distance / (carpel.radius * 0.82), 2));
    y +=
      0.0025 *
      Math.exp(
        -Math.pow((distance - carpel.radius) / (carpel.radius * 0.26), 2),
      );
  }
  return y;
}

/** A continuous capped receptacle, including shallow carpel sockets on its top. */
export function createLotusReceptacle(
  radius: number,
  height: number,
  quality: Quality,
) {
  const sides = quality === "ultra" ? 160 : quality === "high" ? 128 : 80;
  const sideRows = 24,
    topRows = quality === "ultra" ? 56 : 40;
  const carpels = lotusCarpels(radius);
  const p: number[] = [],
    c: number[] = [],
    ix: number[] = [];
  const base = new Color("#6d9335"),
    rim = new Color("#a5b848"),
    top = new Color("#b1be45"),
    tint = new Color();
  const totalRows = sideRows + topRows;
  for (let row = 0; row <= totalRows; row++) {
    const side = row <= sideRows;
    const t = row / sideRows;
    const rho = side
      ? 0.3 + 0.7 * (0.6 * t + 0.4 * Math.sqrt(t))
      : Math.max(0.002, 1 - (row - sideRows) / topRows);
    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const r = radius * rho * (1 + Math.sin(angle * 7 + 0.8) * 0.007);
      const x = Math.cos(angle) * r,
        z = Math.sin(angle) * r;
      const y = side
        ? 0.09 + (height - 0.09) * t
        : receptacleTop(x, z, radius, height, carpels);
      p.push(x, y, z);
      if (side) tint.copy(base).lerp(rim, t);
      else tint.copy(top).lerp(rim, Math.pow(rho, 4) * 0.65);
      const shade = 0.975 + 0.025 * Math.sin(angle * 13 + row * 0.7);
      c.push(tint.r * shade, tint.g * shade, tint.b * shade);
      if (row < totalRows) {
        const a = row * sides + i,
          b = row * sides + ((i + 1) % sides);
        ix.push(a, a + sides, b + sides, a, b + sides, b);
      }
    }
  }
  for (const end of [0, 1]) {
    const center = p.length / 3;
    p.push(0, end ? receptacleTop(0, 0, radius, height, carpels) : 0.09, 0);
    tint.copy(end ? top : base);
    c.push(tint.r, tint.g, tint.b);
    const offset = end ? totalRows * sides : 0;
    for (let i = 0; i < sides; i++) {
      const a = offset + i,
        b = offset + ((i + 1) % sides);
      if (end) ix.push(center, b, a);
      else ix.push(center, a, b);
    }
  }
  const geometry = new BufferGeometry();
  geometry.setAttribute("position", new Float32BufferAttribute(p, 3));
  geometry.setAttribute("color", new Float32BufferAttribute(c, 3));
  geometry.setIndex(ix);
  geometry.computeVertexNormals();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createLotusStamenParts(quality: Quality) {
  const detail = quality === "ultra" ? 44 : 28;
  const filament = createOrganicTube({
    points: [
      [0, 0, 0],
      [0.002, 0.07, 0.009],
      [0.004, 0.17, 0.037],
    ],
    radius: 0.003,
    endRadius: 0.0025,
    segments: detail,
    color: "#e6bc25",
    tipColor: "#f6d14c",
  });
  const lobes = [-1, 1].map((sign) =>
    createOrganicTube({
      points: [
        [sign * 0.005, 0.15, 0.03],
        [sign * 0.0065, 0.23, 0.066],
        [sign * 0.004, 0.34, 0.12],
      ],
      radius: 0.007,
      endRadius: 0.005,
      flatten: 0.68,
      grain: 0.09,
      segments: detail,
      sides: 12,
      color: "#dca915",
      tipColor: "#f7d24b",
    }),
  );
  const anther = mergeGeometries(lobes);
  lobes.forEach((g) => g.dispose());
  const appendage = createOrganicTube({
    points: [
      [0, 0.337, 0.12],
      [0.001, 0.376, 0.145],
      [0, 0.372, 0.171],
    ],
    radius: 0.003,
    endRadius: 0.004,
    segments: 20,
    color: "#f1d66b",
    tipColor: "#f5edb9",
  });
  return { filament, anther, appendage };
}

export const LOTUS_STAMEN_COUNT = 156;
export function lotusStamenLayout() {
  const random = seededRandom(1803);
  return Array.from({ length: LOTUS_STAMEN_COUNT }, (_, i) => {
    const ring = Math.floor(i / 39);
    return {
      angle:
        ((i % 39) / 39) * Math.PI * 2 +
        ring * GOLDEN_ANGLE +
        (random() - 0.5) * 0.028,
      radius: 0.095 + ring * 0.018,
      y: 0.17 - ring * 0.016,
      opening: 0.12 + ring * 0.16 + random() * 0.14,
      length: 0.9 + random() * 0.23,
      phase: random() * Math.PI * 2,
    };
  });
}
