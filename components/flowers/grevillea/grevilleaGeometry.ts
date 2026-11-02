import type { Vec3 } from "@/lib/flowers/types";
import type {
  SpecimenModel,
  SpecimenOrgan,
  SpecimenSurface,
} from "@/lib/three/specimenModel";

export const GREVILLEA_HEAD_CENTER: Vec3 = [0, 0.38, 0.18];
/** Four separate tepals cohere into a narrow bud, then curl back from the style. */
export function grevilleaPerianth(
  index: number,
  u: number,
  v: number,
  open: number,
): Vec3 {
  const split = open * Math.min(1, v / 0.6),
    a = (index * Math.PI) / 2 + (u - 0.5) * Math.PI * 0.51 * (1 - 0.82 * split),
    width = 0.042 + 0.012 * Math.sin(Math.PI * v),
    flare = 0.22 * Math.sin(v * Math.PI * 0.9) * open,
    r = width + flare,
    x = 0.095 * Math.sin(Math.PI * v) * (1 - open),
    y = 0.64 * v - 0.52 * v * v * open,
    z = 0.09 * v * v * (1 - open);
  return [x + Math.sin(a) * r, y, z + Math.cos(a) * r];
}
export const GREVILLEA_PAIRS: [number, number][] = Array.from(
  { length: 6 },
  (_, i) => [i * 2 + 1, i * 2 + 2],
);
export const GREVILLEA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  surfaces: [],
  organs: [],
};
for (let pair = 0; pair < 6; pair++) {
  const a = pair * 2.399963229728653,
    r = 0.22 + (pair % 2) * 0.07,
    root: Vec3 = [Math.sin(a) * r, -0.12 + 0.07 * pair, Math.cos(a) * r];
  for (const side of [-1, 1])
    GREVILLEA_MODEL.clusters.push({
      position: [
        root[0] + Math.cos(a) * side * 0.065,
        root[1] + 0.012 * side,
        root[2] - Math.sin(a) * side * 0.065,
      ],
      rotation: [0.58 * Math.cos(a), a + side * 0.19, -0.58 * Math.sin(a)],
      scale: 0.72 + (pair % 3) * 0.045,
      nod: 0.009,
    });
}
export const GREVILLEA_STALKS: SpecimenOrgan[] = [
  {
    name: "woody condensed floral rachis",
    cluster: 0,
    points: [
      [0, -0.35, 0],
      [0, -0.08, 0],
      [0, 0.21, 0],
    ],
    radius: 0.031,
    endRadius: 0.015,
    color: "#796044",
  },
  ...GREVILLEA_MODEL.clusters.slice(1).map((c, i): SpecimenOrgan => ({
    name: "paired flower pedicel",
    cluster: 0,
    points: [
      [0, -0.15 + 0.06 * Math.floor(i / 2), 0],
      [c.position[0] * 0.48, c.position[1] - 0.04, c.position[2] * 0.48],
      c.position,
    ],
    radius: 0.009,
    endRadius: 0.006,
    color: "#9d624f",
  })),
];
for (let c = 1; c < GREVILLEA_MODEL.clusters.length; c++) {
  const delay = 0.03 + (c % 6) * 0.015;
  for (let i = 0; i < 4; i++) {
    const perianth: SpecimenSurface = {
      name: "separate recurved perianth segment",
      cluster: c,
      role: "petal",
      thickness: 0.009,
      flexible: true,
      pinMidrib: true,
      cage: [4, 5],
      mobileCage: [2, 2],
      overviewColumns: 4,
      overviewRows: 7,
      minimumRows: 7,
      delay,
      compliance: 0.000018,
      shapeCompliance: 0.00015,
      sample: (u, v, o) => grevilleaPerianth(i, u, v, o),
    };
    GREVILLEA_MODEL.surfaces.push(perianth);
    // Cream distal pigment belongs to this same two-sided perianth wall.
    const points = (open: number): Vec3[] =>
      [0.965, 0.986, 1.006].map((v) => grevilleaPerianth(i, 0.5, v, open));
    GREVILLEA_MODEL.organs.push({
      name: "sessile perianth anther",
      cluster: c,
      points: points(1),
      foldedPoints: points(0),
      radius: 0.014,
      endRadius: 0.009,
      flatten: 0.55,
      color: "#e9d9b0",
      overviewSides: 4,
    });
  }
  const style: Vec3[] = [
      [0, 0.036, 0],
      [0.1, 0.29, 0.005],
      [0.21, 0.62, 0.035],
      [0.18, 0.91, 0.08],
    ],
    folded: Vec3[] = [
      [0, 0.036, 0],
      [0.12, 0.3, 0.01],
      [0.1, 0.52, 0.05],
      [0.005, 0.625, 0.09],
    ],
    tip = style.at(-1)!,
    foldedTip = folded.at(-1)!;
  GREVILLEA_MODEL.organs.push(
    {
      name: "small stipitate ovary",
      cluster: c,
      points: [
        [0, -0.018, 0],
        [0, 0.027, 0],
        [0, 0.063, 0],
      ],
      radius: 0.024,
      endRadius: 0.016,
      color: "#b86a64",
      overviewSides: 4,
    },
    {
      name: "curved pollen-presenting style",
      cluster: c,
      points: style,
      foldedPoints: folded,
      radius: 0.012,
      endRadius: 0.01,
      color: "#c92e52",
      tipColor: "#df526b",
      overviewSides: 4,
    },
    {
      name: "flattened lateral pollen presenter",
      cluster: c,
      points: [
        tip,
        [tip[0] + 0.025, tip[1] + 0.018, tip[2]],
        [tip[0] + 0.045, tip[1] + 0.026, tip[2]],
      ],
      foldedPoints: [
        foldedTip,
        [foldedTip[0] + 0.025, foldedTip[1] + 0.018, foldedTip[2]],
        [foldedTip[0] + 0.045, foldedTip[1] + 0.026, foldedTip[2]],
      ],
      radius: 0.032,
      endRadius: 0.021,
      flatten: 0.28,
      sectionRoll: 0.65,
      color: "#ead4ac",
      bloomMorph: true,
      overviewSides: 6,
    },
    {
      name: "central receptive stigma",
      cluster: c,
      points: [
        [tip[0] + 0.025, tip[1] + 0.018, tip[2]],
        [tip[0] + 0.026, tip[1] + 0.019, tip[2] + 0.006],
      ],
      foldedPoints: [
        [foldedTip[0] + 0.025, foldedTip[1] + 0.018, foldedTip[2]],
        [foldedTip[0] + 0.026, foldedTip[1] + 0.019, foldedTip[2] + 0.006],
      ],
      radius: 0.006,
      endRadius: 0.004,
      color: "#c6a77c",
      overviewSides: 3,
    },
  );
}
