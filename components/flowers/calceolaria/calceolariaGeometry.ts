import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";

/** One fused wall, from the pinned posterior insertion round the sack to its open neck.
 * The upper sector stays shallow; the lower sector forms the inflated hollow lip.
 * Neither end is capped across the lumen. The two offset skins seal only tissue edges.
 */
export function calceolariaCorolla(
  u: number,
  v: number,
  open: number,
  young = false,
): Vec3 {
  const angle = (((u % 1) + 1) % 1) * Math.PI * 2,
    s = open * (young ? 0.06 : 1),
    upper = Math.max(0, Math.sin(angle)),
    lower = Math.max(0, -Math.sin(angle)),
    belly = Math.sin(Math.PI * v),
    inflation = 0.2 + 0.8 * s,
    width =
      0.034 * (1 - 0.5 * v ** 8) +
      (0.3 * belly ** 0.85 + 0.02 * v ** 5) * inflation,
    lowerDepth = 0.04 + (0.35 * belly ** 0.9 + 0.06 * v) * inflation,
    hoodHeight = 0.025 + (0.067 * v + 0.008 * belly) * (0.35 + 0.65 * s),
    projection =
      (0.46 * Math.sin(Math.PI * v * 0.8) - 0.04 * v) * (0.72 + 0.28 * s),
    // A gently raised dorsal lip, a forward lower rim, and a real narrow entrance.
    hood = 0.082 * upper ** 2 * v ** 5 * (0.65 + 0.35 * s),
    neck = 1 - 0.5 * v ** 8;
  return [
    Math.cos(angle) * width,
    0.012 * v + neck * (upper * hoodHeight - lower * lowerDepth),
    0.035 + projection - hood,
  ];
}

export const CALCEOLARIA_HEAD_CENTER: Vec3 = [0, 0.12, 0.22];

export const CALCEOLARIA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [
    {
      position: [-0.49, -0.07, 0.08],
      rotation: [-0.12, -0.3, -0.1],
      scale: 0.88,
      nod: 0.024,
    },
    {
      position: [0.44, 0.02, 0.04],
      rotation: [-0.08, 0.35, 0.11],
      scale: 0.84,
      nod: 0.024,
    },
    {
      position: [-0.2, 0.48, -0.07],
      rotation: [-0.15, -0.12, -0.06],
      scale: 0.78,
      nod: 0.021,
    },
    {
      position: [0.34, 0.59, -0.03],
      rotation: [-0.17, 0.2, 0.07],
      scale: 0.71,
      nod: 0.019,
    },
    {
      position: [-0.02, 0.84, -0.1],
      rotation: [-0.29, -0.17, -0.12],
      scale: 0.48,
      nod: 0.013,
    },
    {
      position: [0.23, 0.92, -0.12],
      rotation: [-0.34, 0.25, 0.14],
      scale: 0.36,
      nod: 0.011,
    },
  ],
  surfaces: [],
  organs: [],
};

/** Each stalk bridges the actual rooted shoot to its own corolla insertion. */
export const CALCEOLARIA_STALKS: SpecimenOrgan[] =
  CALCEOLARIA_MODEL.clusters.map((c, i) => ({
    name: "calceolaria flower pedicel",
    cluster: 0,
    points: [
      [0.013, i < 2 ? -0.64 : -0.3, 0],
      [c.position[0] * 0.52, c.position[1] - 0.18, c.position[2] * 0.5 - 0.02],
      c.position,
    ],
    radius: i < 4 ? 0.013 : 0.009,
    endRadius: i < 4 ? 0.008 : 0.006,
    color: "#80915a",
    overviewSides: 4,
  }));

/** Internal organs follow the same non-collapsing cavity expansion as the corolla. */
function internal(point: Vec3, open: number, young: boolean): Vec3 {
  const s = open * (young ? 0.06 : 1);
  return [
    point[0] * (0.55 + 0.45 * s),
    point[1] * (0.65 + 0.35 * s),
    0.035 + (point[2] - 0.035) * (0.72 + 0.28 * s),
  ];
}

for (let cluster = 0; cluster < CALCEOLARIA_MODEL.clusters.length; cluster++) {
  const young = cluster >= 4,
    delay = 0.035 + cluster * 0.027;
  CALCEOLARIA_MODEL.surfaces.push({
    name: young
      ? "young fused calceolaria pouch"
      : "fused bilabiate calceolaria pouch",
    cluster,
    role: "tube",
    periodic: true,
    outerSide: -1,
    thickness: 0.012,
    overviewColumns: 12,
    overviewRows: 8,
    minimumColumns: 12,
    minimumRows: 8,
    sample: (u, v, o) => calceolariaCorolla(u, v, o, young),
    flexible: true,
    cage: [16, 8],
    mobileCage: [8, 5],
    delay,
    compliance: 0.000045,
    shapeCompliance: 0.00024,
  });
  for (let sepal = 0; sepal < 4; sepal++) {
    const angle = (sepal * Math.PI) / 2 + Math.PI / 4;
    CALCEOLARIA_MODEL.surfaces.push({
      name: "free calceolaria sepal",
      cluster,
      role: "calyx",
      thickness: 0.008,
      overviewColumns: 2,
      overviewRows: 3,
      sample: (u, v): Vec3 => {
        const width =
            (u * 2 - 1) * (0.003 + 0.034 * Math.sin(Math.PI * v) ** 0.8),
          r = 0.04 + 0.031 * v - 0.012 * v * v;
        return [
          Math.cos(angle) * r - Math.sin(angle) * width,
          Math.sin(angle) * r + Math.cos(angle) * width,
          0.015 + 0.125 * v,
        ];
      },
    });
  }

  const add = (organ: Omit<SpecimenOrgan, "cluster" | "foldedPoints">) => {
    CALCEOLARIA_MODEL.organs.push({
      ...organ,
      cluster,
      bloomMorph: true,
      points: organ.points.map((p) => internal(p, 1, young)),
      foldedPoints: organ.points.map((p) => internal(p, 0, young)),
    });
  };
  // Exactly two filaments. Their paired divaricate thecae are not extra stamens.
  for (const side of [-1, 1]) {
    const insertion = calceolariaCorolla(side === 1 ? 0 : 0.5, 0.04, 1, young),
      foldedInsertion = calceolariaCorolla(
        side === 1 ? 0 : 0.5,
        0.04,
        0,
        young,
      ),
      filament: SpecimenOrgan = {
        name: "included calceolaria stamen filament",
        cluster,
        bloomMorph: true,
        overviewSides: 3,
        points: [
          insertion,
          internal([side * 0.038, -0.004, 0.13], 1, young),
          internal([side * 0.027, -0.008, 0.182], 1, young),
        ],
        foldedPoints: [
          foldedInsertion,
          internal([side * 0.038, -0.004, 0.13], 0, young),
          internal([side * 0.027, -0.008, 0.182], 0, young),
        ],
        radius: 0.0035,
        endRadius: 0.003,
        color: "#e6d58c",
      };
    CALCEOLARIA_MODEL.organs.push(filament);
    for (const half of [-1, 1])
      add({
        name: "divaricate calceolaria anther theca",
        overviewSides: 3,
        points: [
          [side * 0.027, -0.008, 0.182],
          [side * 0.027 + half * 0.009, -0.007, 0.184],
          [side * 0.027 + half * 0.017, -0.01, 0.18],
        ],
        radius: 0.006,
        endRadius: 0.004,
        color: "#ad8434",
        flatten: 0.72,
      });
  }
  add({
    name: "calceolaria superior ovary",
    overviewSides: 4,
    points: [
      [0, -0.003, 0.035],
      [0, -0.001, 0.055],
      [0, 0.002, 0.075],
    ],
    radius: 0.017,
    endRadius: 0.011,
    color: "#a5aa54",
  });
  add({
    name: "included calceolaria style",
    overviewSides: 3,
    points: [
      [0, 0.002, 0.075],
      [0, -0.005, 0.132],
      [0, -0.009, 0.197],
    ],
    radius: 0.0035,
    endRadius: 0.003,
    color: "#d5cd84",
  });
  add({
    name: "capitate calceolaria stigma",
    overviewSides: 3,
    points: [
      [0, -0.009, 0.195],
      [0, -0.008, 0.201],
      [0, -0.009, 0.207],
    ],
    radius: 0.0065,
    endRadius: 0.0045,
    color: "#d8cb70",
  });
}
