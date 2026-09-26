import { BufferGeometry, Float32BufferAttribute, Vector3 } from "three";
import type { Quality, Vec3 } from "@/lib/flowers/types";
import { createOrganicTube } from "@/lib/three/organicTube";
import { joinOrgans, organTube } from "@/lib/three/floralOrgans";
import { seededRandom } from "@/lib/three/noise";

/** A periodic surface: the five regions share their edges, never separate petals. */
export function morningCorollaPoint(
  angle: number,
  t: number,
  open: number,
): Vec3 {
  const ribs = Math.cos(5 * angle + 0.12 * Math.sin(angle * 2));
  const matureRadius =
    (0.052 + 0.11 * t + 0.96 * t ** 3.6) *
    (1 + 0.025 * ribs * t ** 2 + 0.012 * Math.sin(angle * 3 + 0.7) * t);
  const budRadius =
    (0.054 + 0.135 * Math.sin(Math.PI * t) ** 0.8) *
    (1 - 0.85 * t ** 8) *
    (0.81 + 0.19 * ribs);
  const theta = angle + (1 - open) * 2.15 * t ** 1.4;
  const radius = budRadius + (matureRadius - budRadius) * open;
  const height =
    (1.76 - 0.17 * open) * t +
    open *
      t ** 6 *
      (0.018 * Math.sin(angle * 5) + 0.012 * Math.sin(angle * 13 + t * 7));
  return [Math.sin(theta) * radius, height, Math.cos(theta) * radius];
}

export function createMorningCorolla(quality: Quality) {
  const columns =
    quality === "low"
      ? 60
      : quality === "medium"
        ? 90
        : quality === "high"
          ? 140
          : 200;
  const rows = quality === "low" ? 28 : quality === "medium" ? 40 : 60;
  const count = columns * (rows + 1),
    indices: number[] = [],
    uv: number[] = [];
  for (let side = 0; side < 2; side++) {
    for (let row = 0; row <= rows; row++) {
      for (let i = 0; i < columns; i++) {
        uv.push(i / columns, row / rows);
        if (row === rows) continue;
        const a = side * count + row * columns + i;
        const b = side * count + row * columns + ((i + 1) % columns);
        const c = a + columns,
          d = b + columns;
        indices.push(...(side ? [a, b, d, a, d, c] : [a, d, b, a, c, d]));
      }
    }
  }
  for (const row of [0, rows])
    for (let i = 0; i < columns; i++) {
      const a = row * columns + i,
        b = row * columns + ((i + 1) % columns);
      indices.push(
        ...(row === 0
          ? [a, b, b + count, a, b + count, a + count]
          : [a, b + count, b, a, a + count, b + count]),
      );
    }
  const state = (open: number) => {
    const points: number[] = [],
      da = new Vector3(),
      dt = new Vector3(),
      normal = new Vector3();
    for (let side = 0; side < 2; side++)
      for (let row = 0; row <= rows; row++)
        for (let i = 0; i < columns; i++) {
          const a = (i / columns) * Math.PI * 2,
            t = row / rows;
          const p = morningCorollaPoint(a, t, open);
          const left = morningCorollaPoint(a - 0.0001, t, open),
            right = morningCorollaPoint(a + 0.0001, t, open);
          const down = morningCorollaPoint(a, Math.max(0, t - 0.0001), open),
            up = morningCorollaPoint(a, Math.min(1, t + 0.0001), open);
          da.set(right[0] - left[0], right[1] - left[1], right[2] - left[2]);
          dt.set(up[0] - down[0], up[1] - down[1], up[2] - down[2]);
          normal.crossVectors(dt, da).normalize();
          const thickness = (0.009 - 0.004 * t) * (side ? -0.5 : 0.5);
          points.push(
            p[0] + normal.x * thickness,
            p[1] + normal.y * thickness,
            p[2] + normal.z * thickness,
          );
        }
    const geometry = new BufferGeometry();
    geometry.setAttribute("position", new Float32BufferAttribute(points, 3));
    geometry.setIndex(indices);
    geometry.computeVertexNormals();
    return geometry;
  };
  const geometry = state(1),
    bud = state(0);
  geometry.setAttribute("uv", new Float32BufferAttribute(uv, 2));
  geometry.morphAttributes.position = [bud.getAttribute("position")];
  geometry.morphAttributes.normal = [bud.getAttribute("normal")];
  bud.dispose();
  geometry.computeBoundingSphere();
  return geometry;
}

export function createMorningReproductiveOrgans(quality: Quality) {
  const parts: BufferGeometry[] = [];
  // Unequal epipetalous stamens remain included in the pale tube.
  for (let i = 0; i < 5; i++) {
    const angle = (i * Math.PI * 2) / 5 + 0.3,
      height = 0.48 + i * 0.042;
    const x = Math.sin(angle) * 0.06,
      z = Math.cos(angle) * 0.06;
    parts.push(
      organTube(
        [
          [x, 0.2, z],
          [x * 0.8, height * 0.65, z * 0.8],
          [x, height, z],
        ],
        0.008,
        "#f1e8ce",
        quality,
        0.005,
      ),
    );
    for (const side of [-1, 1])
      parts.push(
        organTube(
          [
            [x + side * 0.01, height - 0.035, z],
            [x + side * 0.012, height, z],
            [x + side * 0.009, height + 0.038, z],
          ],
          0.012,
          "#ece3bf",
          quality,
          0.01,
        ),
      );
  }
  parts.push(
    organTube(
      [
        [0, 0.07, 0],
        [0.008, 0.42, 0],
        [0.013, 0.74, 0.004],
      ],
      0.011,
      "#e9dfc2",
      quality,
      0.008,
    ),
  );
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    parts.push(
      organTube(
        [
          [0.013, 0.73, 0.004],
          [0.013 + Math.sin(a) * 0.018, 0.763, 0.004 + Math.cos(a) * 0.018],
          [0.013 + Math.sin(a) * 0.016, 0.775, 0.004 + Math.cos(a) * 0.016],
        ],
        0.014,
        "#d3d2a8",
        quality,
        0.01,
      ),
    );
  }
  parts.push(
    organTube(
      [
        [0, 0, 0],
        [0, 0.06, 0],
        [0, 0.1, 0],
      ],
      0.04,
      "#89954d",
      quality,
      0.027,
    ),
  );
  return joinOrgans(parts);
}

/** The main shoot, not a tendril, winds around the fixed support. */
export function morningVinePoint(t: number, length: number): Vec3 {
  const release = Math.max(0, Math.min(1, (t - 0.72) / 0.28));
  const radius = 0.052 * (1 - release * release * (3 - 2 * release));
  const angle = t * Math.PI * 6.2;
  return [
    Math.sin(angle) * radius,
    -length + length * t,
    Math.cos(angle) * radius,
  ];
}

export function createMorningShoot(quality: Quality, length: number) {
  const points: Vec3[] = Array.from({ length: 65 }, (_, i) =>
    morningVinePoint(i / 64, length),
  );
  const parts = [
    createOrganicTube({
      points,
      radius: 0.019,
      endRadius: 0.012,
      segments: quality === "low" ? 96 : 180,
      sides: quality === "low" ? 7 : 12,
      color: "#716844",
      tipColor: "#76934f",
      grain: 0.07,
    }),
  ];
  const random = seededRandom(4199),
    hairs = quality === "low" ? 100 : 280;
  for (let i = 0; i < hairs; i++) {
    const t = random() * 0.97,
      p = morningVinePoint(t, length),
      a = random() * Math.PI * 2;
    const radius = 0.013,
      dx = Math.sin(a),
      dz = Math.cos(a),
      h = 0.016 + random() * 0.018;
    parts.push(
      createOrganicTube({
        points: [
          [p[0] + dx * radius, p[1], p[2] + dz * radius],
          [
            p[0] + dx * (radius + h * 0.5),
            p[1] - h * 0.4,
            p[2] + dz * (radius + h * 0.5),
          ],
          [
            p[0] + dx * (radius + h * 0.7),
            p[1] - h,
            p[2] + dz * (radius + h * 0.7),
          ],
        ],
        radius: 0.0009,
        endRadius: 0.0002,
        segments: 3,
        sides: 3,
        color: "#acb393",
      }),
    );
  }
  return joinOrgans(parts);
}
