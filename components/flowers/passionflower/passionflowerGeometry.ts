import { BufferGeometry, Color, Float32BufferAttribute } from "three";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { joinOrgans, organTube } from "@/lib/three/floralOrgans";
import { seededRandom } from "@/lib/three/noise";

export const PASSION_CORONA = [
  { count: 64, radius: 0.23, height: 0.09, length: 0.87, thickness: 0.0105 },
  { count: 56, radius: 0.215, height: 0.112, length: 0.77, thickness: 0.012 },
  { count: 40, radius: 0.19, height: 0.105, length: 0.085, thickness: 0.008 },
  { count: 32, radius: 0.163, height: 0.1, length: 0.062, thickness: 0.008 },
] as const;

/** All quality levels preserve organ counts; tessellation alone is reduced. */
export function createCoronaFilament(quality: Quality, ring: number) {
  const spec = PASSION_CORONA[ring];
  const long = ring < 2;
  const length = spec.length;
  const segments = quality === "low" ? 12 : quality === "medium" ? 20 : 36;
  const sides = quality === "low" ? 6 : quality === "medium" ? 8 : 12;
  const open: Vec3[] = long
    ? [
        [0, 0, 0],
        [0.004, 0.05, length * 0.25],
        [-0.017, 0.065, length * 0.56],
        [0.016, 0.082, length * 0.83],
        [0.034, 0.048, length],
      ]
    : [
        [0, 0, 0],
        [0, length * 0.55, 0.005],
        [0.002, length, 0.01],
      ];
  const folded: Vec3[] = long
    ? [
        [0, 0, 0],
        [0.004, length * 0.19, 0.025],
        [-0.01, length * 0.43, -0.04],
        [0.006, length * 0.67, -0.11],
      ]
    : [
        [0, 0, 0],
        [0, length * 0.5, 0],
        [0, length * 0.85, -0.02],
      ];
  const make = (points: Vec3[]) =>
    createOrganicTube({
      points,
      segments,
      sides,
      radius: spec.thickness,
      endRadius: spec.thickness * (long ? 0.88 : 1.4),
      grain: 0.018,
    });
  const geometry = make(open),
    closed = make(folded);
  geometry.morphAttributes.position = [closed.getAttribute("position")];
  geometry.morphAttributes.normal = [closed.getAttribute("normal")];
  closed.dispose();
  const purple = new Color("#40274e"),
    ivory = new Color("#ecebdc"),
    blue = new Color("#4e55a3");
  const tint = new Color(),
    colors = geometry.getAttribute("color");
  for (let i = 0; i < colors.count; i++) {
    const t =
      i < (segments + 1) * sides
        ? Math.floor(i / sides) / segments
        : i === colors.count - 1
          ? 1
          : 0;
    const smooth = (a: number, b: number) => {
      const x = Math.max(0, Math.min(1, (t - a) / (b - a)));
      return x * x * (3 - 2 * x);
    };
    if (long)
      tint
        .copy(purple)
        .lerp(ivory, smooth(0.22, 0.39))
        .lerp(blue, smooth(0.53, 0.67));
    else tint.copy(ivory).lerp(purple, smooth(0.65, 0.95));
    const relief = 0.97 + 0.03 * Math.sin(i * 1.81);
    colors.setXYZ(i, tint.r * relief, tint.g * relief, tint.b * relief);
  }
  geometry.computeBoundingSphere();
  return geometry;
}

export function createPassionAxis(quality: Quality) {
  const parts: BufferGeometry[] = [];
  // Androgynophore: the ovary and stamen insertion are elevated together.
  parts.push(
    createOrganicTube({
      points: [
        [0, 0.05, 0],
        [0.007, 0.3, 0],
        [0, 0.51, 0],
      ],
      radius: 0.053,
      endRadius: 0.057,
      color: "#b5b789",
      tipColor: "#8e9f67",
      segments: quality === "low" ? 16 : 36,
      sides: quality === "low" ? 10 : 20,
      grain: 0.035,
    }),
  );
  // A thickened ovoid ovary; its bloom position remains attached to the axis.
  parts.push(
    organTube(
      [
        [0, 0.47, 0],
        [0, 0.555, 0],
        [0, 0.66, 0],
      ],
      0.085,
      "#8c9f6c",
      quality,
      0.061,
      0.94,
    ),
  );
  for (const [radius, y, thickness, color] of [
    [0.145, 0.06, 0.015, "#40233c"],
    [0.092, 0.09, 0.014, "#e2ddbe"],
    [0.102, 0.114, 0.012, "#f2ead3"],
  ] as const) {
    const points: Vec3[] = Array.from({ length: 49 }, (_, i) => {
      const a = (i / 48) * Math.PI * 2;
      return [
        Math.sin(a) * radius,
        y + 0.002 * Math.cos(a * 15),
        Math.cos(a) * radius,
      ];
    });
    parts.push(
      createOrganicTube({
        points,
        radius: thickness,
        endRadius: thickness,
        color,
        segments: quality === "low" ? 40 : 80,
        sides: 8,
      }),
    );
  }
  // Operculum fringe around the sheltered nectar chamber.
  for (let i = 0; i < 36; i++) {
    const a = (i / 36) * Math.PI * 2,
      x = Math.sin(a),
      z = Math.cos(a);
    parts.push(
      organTube(
        [
          [x * 0.12, 0.07, z * 0.12],
          [x * 0.123, 0.105, z * 0.123],
          [x * 0.128, 0.15, z * 0.128],
        ],
        0.0045,
        "#573450",
        quality,
      ),
    );
  }
  return joinOrgans(parts);
}

/** One pivoting stamen, including two anther thecae and their longitudinal groove. */
export function createPassionStamen(quality: Quality) {
  const parts = [
    organTube(
      [
        [0, 0, 0],
        [0, 0.025, 0.14],
        [0, -0.005, 0.37],
      ],
      0.017,
      "#bcc793",
      quality,
      0.012,
    ),
  ];
  for (const z of [0.345, 0.393]) {
    parts.push(
      createOrganicTube({
        points: [
          [-0.105, -0.017, z],
          [0, -0.03, z + 0.002],
          [0.105, -0.015, z],
        ],
        radius: 0.026,
        endRadius: 0.027,
        color: "#aaa355",
        tipColor: "#b7b26d",
        flatten: 0.74,
        segments: quality === "low" ? 12 : 28,
        sides: quality === "low" ? 8 : 14,
        grain: 0.06,
      }),
    );
  }
  return joinOrgans(parts);
}

export function createPassionStyle(quality: Quality) {
  const parts = [
    createOrganicTube({
      points: [
        [0, 0, 0],
        [0.01, 0.115, 0.065],
        [0.012, 0.15, 0.19],
        [0.013, 0.106, 0.29],
      ],
      radius: 0.015,
      endRadius: 0.023,
      color: "#8c6287",
      tipColor: "#725674",
      segments: quality === "low" ? 14 : 30,
      sides: quality === "low" ? 8 : 14,
    }),
  ];
  // Slightly lobed receptive pad, with fine geometric relief at macro scale.
  parts.push(
    createOrganicTube({
      points: [
        [-0.042, 0.102, 0.29],
        [0.012, 0.11, 0.298],
        [0.065, 0.104, 0.29],
      ],
      radius: 0.036,
      endRadius: 0.034,
      color: "#aaa78a",
      tipColor: "#b9b593",
      flatten: 0.65,
      grain: 0.075,
      segments: quality === "low" ? 12 : 26,
      sides: quality === "low" ? 8 : 16,
    }),
  );
  return joinOrgans(parts);
}

/** One continuous five-lobed simple blade, sealed around its entire margin. */
export function createPassionLeaf(quality: Quality) {
  const sectors = quality === "low" ? 100 : quality === "medium" ? 160 : 240;
  const rings = quality === "low" ? 10 : quality === "medium" ? 16 : 24;
  const positions: number[] = [],
    colors: number[] = [],
    uv: number[] = [],
    indices: number[] = [];
  const leafColor = new Color("#37643b"),
    back = new Color("#5c7850"),
    vein = new Color("#779456"),
    tint = new Color();
  const lobes = [-2.04, -1.04, 0, 1.04, 2.04];
  const length = [0.62, 0.83, 0.97, 0.8, 0.6];
  const radiusAt = (a: number) => {
    let radius = 0.075;
    for (let l = 0; l < lobes.length; l++) {
      const d = Math.atan2(Math.sin(a - lobes[l]), Math.cos(a - lobes[l]));
      radius += length[l] * Math.exp(-Math.pow(Math.abs(d) / 0.245, 2.4));
    }
    return radius;
  };
  const sideSize = 1 + rings * sectors;
  for (let side = 0; side < 2; side++) {
    positions.push(0, 0, side ? -0.004 : 0.004);
    uv.push(0.5, 0);
    tint.copy(side ? back : leafColor);
    colors.push(tint.r, tint.g, tint.b);
    for (let j = 1; j <= rings; j++) {
      const t = j / rings;
      for (let i = 0; i < sectors; i++) {
        const a = (i / sectors) * Math.PI * 2;
        const radius = radiusAt(a),
          r = radius * t;
        const x = Math.sin(a) * r,
          y = Math.cos(a) * r;
        let distance = Math.PI;
        for (const axis of lobes)
          distance = Math.min(
            distance,
            Math.abs(Math.atan2(Math.sin(a - axis), Math.cos(a - axis))),
          );
        const primary = Math.exp(-Math.pow((distance * r) / 0.01, 2));
        const secondary =
          Math.pow(Math.max(0, Math.cos(r * 44 + distance * 11)), 22) *
          Math.exp(-distance * 2) *
          0.22;
        const z =
          0.1 * r * r +
          0.025 * Math.sin(a * 3) * r +
          0.014 * Math.sin(a * 9 + r * 7) * t * t +
          (side ? -1 : 1) * (0.0035 + primary * 0.005 * (1 - t));
        positions.push(x, y, z);
        uv.push(0.5 + x * 0.45, Math.max(0, Math.min(1, r)));
        tint
          .copy(side ? back : leafColor)
          .lerp(vein, primary * 0.5 + secondary)
          .multiplyScalar(0.94 + 0.06 * Math.sin(a * 21 + r * 23));
        colors.push(tint.r, tint.g, tint.b);
      }
    }
    const offset = side * sideSize;
    const tri = (a: number, b: number, c: number) =>
      side
        ? indices.push(offset + a, offset + c, offset + b)
        : indices.push(offset + a, offset + b, offset + c);
    for (let i = 0; i < sectors; i++) {
      const next = (i + 1) % sectors;
      tri(0, 1 + next, 1 + i);
      for (let j = 0; j < rings - 1; j++) {
        const a = 1 + j * sectors + i,
          b = 1 + j * sectors + next;
        tri(a, b, b + sectors);
        tri(a, b + sectors, a + sectors);
      }
    }
  }
  const edge = 1 + (rings - 1) * sectors;
  for (let i = 0; i < sectors; i++) {
    const a = edge + i,
      b = edge + ((i + 1) % sectors);
    indices.push(a, b, b + sideSize, a, b + sideSize, a + sideSize);
  }
  const g = new BufferGeometry();
  g.setAttribute("position", new Float32BufferAttribute(positions, 3));
  g.setAttribute("color", new Float32BufferAttribute(colors, 3));
  g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  g.setIndex(indices);
  g.computeVertexNormals();
  const folded = positions.slice();
  for (let i = 0; i < folded.length; i += 3) {
    const x = positions[i],
      y = positions[i + 1];
    folded[i] = x * 0.35;
    folded[i + 2] += Math.abs(x) * 0.65 + Math.max(0, y) ** 2 * 0.22;
  }
  const closed = new BufferGeometry();
  closed.setAttribute("position", new Float32BufferAttribute(folded, 3));
  closed.setIndex(indices);
  closed.computeVertexNormals();
  g.morphAttributes.position = [closed.getAttribute("position")];
  g.morphAttributes.normal = [closed.getAttribute("normal")];
  closed.dispose();
  g.computeBoundingSphere();
  return g;
}

export function createPassionPetiole(quality: Quality) {
  const parts = [
    organTube(
      [
        [0, 0, 0],
        [0.008, 0.15, 0],
        [0, 0.3, 0],
      ],
      0.011,
      "#547746",
      quality,
      0.008,
    ),
  ];
  for (const y of [0.1, 0.185])
    for (const side of [-1, 1]) {
      parts.push(
        organTube(
          [
            [0, y, 0],
            [side * 0.018, y + 0.008, 0],
            [side * 0.027, y + 0.02, 0.003],
          ],
          0.006,
          "#728951",
          quality,
          0.013,
        ),
      );
    }
  return joinOrgans(parts);
}

export function createPassionTendril(
  quality: Quality,
  seed: number,
  stemOffset = 0,
) {
  const random = seededRandom(seed);
  const points: Vec3[] = [
    [0, 0, 0],
    [-0.055, 0.02, 0.01],
    [-0.12, 0.05, 0.045],
  ];
  const phase = random() * 0.15;
  for (let i = 0; i <= 60; i++) {
    const t = i / 60,
      a = t * Math.PI * 7 + phase,
      r = 0.034 * (1 - t * 0.05);
    points.push([
      -0.17 - stemOffset + Math.cos(a) * r,
      0.05 + t * 0.32,
      0.045 + Math.sin(a) * r,
    ]);
  }
  return createOrganicTube({
    points,
    radius: 0.0065,
    endRadius: 0.003,
    color: "#657d46",
    tipColor: "#8b9a61",
    segments: quality === "low" ? 64 : 128,
    sides: quality === "low" ? 6 : 9,
  });
}
