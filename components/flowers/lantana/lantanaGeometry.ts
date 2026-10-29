import type { Vec3 } from "@/lib/flowers/types";
import { Euler, Matrix4, Vector3 } from "three";
import type {
  SpecimenModel,
  SpecimenOrgan,
  SpecimenTissue,
} from "@/lib/three/specimenModel";

/** Unequal rounded lobes belong to the same salverform wall, without overlaid petals. */
export function lantanaCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const a = u * Math.PI * 2,
    open = stage * (young ? 0.035 : 1),
    limb = Math.max(0, (v - 0.72) / 0.28),
    lobe = (0.5 + 0.5 * Math.cos(4 * a)) ** 0.6,
    unequal = 1 + 0.15 * Math.cos(a) - 0.065 * Math.cos(2 * a),
    full = 0.022 + 0.006 * v + limb ** 1.65 * (0.028 + 0.093 * lobe * unequal),
    closed = 0.018 + 0.009 * Math.sin(Math.PI * v) - 0.009 * v ** 8,
    r = closed * (1 - open) + full * open,
    y =
      0.43 * v +
      open * limb * (0.027 - 0.025 * lobe) +
      0.008 * Math.sin(a) * limb * open;
  return [Math.sin(a) * r + 0.014 * v * v, y, Math.cos(a) * r];
}
export const LANTANA_HEADS: Vec3[] = [
  [-0.62, 0.01, 0],
  [0.62, -0.31, 0.14],
];
export const LANTANA_HEAD_CENTER: Vec3 = [0, 0.28, 0.07];
export const LANTANA_MODEL: SpecimenModel = {
  ambientSurfaceBatching: true,
  clusters: [],
  surfaces: [],
  organs: [],
};
/** Roots occur at leaf axils; tips meet the center of each broad receptacle. */
export const LANTANA_STALKS: SpecimenOrgan[] = LANTANA_HEADS.map((head, i) => ({
  name: "axillary lantana peduncle",
  cluster: 0,
  points: [
    [0, i ? -0.78 : -0.39, 0],
    [head[0] * 0.44, head[1] - 0.25, head[2] * 0.4],
    head,
  ],
  radius: 0.026,
  endRadius: 0.02,
  color: "#71854e",
}));
for (let head = 0; head < 2; head++) {
  const center = LANTANA_HEADS[head];
  // A short axial support meets the continuous receptacle above it.
  LANTANA_STALKS.push({
    name: "short lantana receptacle axis",
    cluster: 0,
    points: [
      [center[0], center[1] - 0.025, center[2]],
      [center[0], center[1] + 0.06, center[2]],
      [center[0], center[1] + 0.125, center[2]],
    ],
    radius: 0.045,
    endRadius: 0.035,
    color: "#6e844b",
  });
  for (let j = 0; j < 21; j++) {
    const ring = j < 10 ? 0 : j < 15 ? 1 : j < 18 ? 2 : 3,
      n = [10, 5, 3, 3][ring],
      k = j - [0, 10, 15, 18][ring],
      a = (k / n) * Math.PI * 2 + head * 0.36 + ring * 0.72,
      r = [0.395, 0.235, 0.098, 0.055][ring],
      young = ring === 3,
      c = LANTANA_MODEL.clusters.length,
      tilt = ring === 0 ? 0.2 : ring === 1 ? 0.1 : 0,
      tissue: SpecimenTissue | undefined =
        ring === 0 ? undefined : ring === 1 ? "disc" : "guide";
    LANTANA_MODEL.clusters.push({
      position: [
        center[0] + Math.sin(a) * r,
        center[1] + 0.055 + 0.09 * (1 - r / 0.42) - (young ? 0.06 : 0),
        center[2] + Math.cos(a) * r,
      ],
      rotation: [tilt * Math.cos(a), a * 0.13, -tilt * Math.sin(a)],
      scale: young ? 0.6 : 0.9 + 0.045 * Math.sin(j * 2.3 + head),
      nod: 0,
    });
    LANTANA_MODEL.surfaces.push(
      {
        name: "irregular four-lobed lantana corolla",
        cluster: c,
        role: "tube",
        tissue,
        periodic: true,
        thickness: 0.0055,
        overviewColumns: 16,
        overviewRows: 4,
        minimumColumns: 16,
        flexible: true,
        cage: [8, 4],
        mobileCage: [4, 2],
        delay: 0.035 + ring * 0.018,
        compliance: 0.000035,
        shapeCompliance: 0.0003,
        sample: (u, v, o) => lantanaCorolla(u, v, o, young),
      },
      {
        name: "minute membranous lantana calyx",
        cluster: c,
        role: "calyx",
        periodic: true,
        thickness: 0.004,
        overviewColumns: 8,
        overviewRows: 1,
        sample: (u, v) => {
          const a = u * Math.PI * 2,
            r = 0.025 + 0.004 * v;
          return [
            Math.sin(a) * r,
            -0.015 + 0.049 * v + 0.006 * v ** 4 * Math.cos(2 * a),
            Math.cos(a) * r,
          ];
        },
      },
      {
        name: "imbricate subtending lantana bract",
        cluster: c,
        role: "bract",
        tissue: "leaf",
        thickness: 0.006,
        overviewColumns: 2,
        overviewRows: 3,
        sample: (u, v) => {
          const w = 2 * u - 1;
          return [
            w * (0.003 + 0.027 * Math.sin(Math.PI * v)),
            0.16 * v,
            0.025 + 0.052 * v + 0.01 * w * w,
          ];
        },
      },
    );
    for (let s = 0; s < 4; s++) {
      const a = ((s + 0.5) * Math.PI) / 2,
        y = s % 2 ? 0.235 : 0.27,
        x = Math.sin(a) * 0.017 + 0.005,
        z = Math.cos(a) * 0.017;
      LANTANA_MODEL.organs.push({
        name: "included lantana stamen filament",
        cluster: c,
        points: [
          [x, 0.205, z],
          [x, y - 0.005, z],
        ],
        foldedPoints: [
          [x, 0.205, z],
          [x, y - 0.005, z],
        ],
        radius: 0.0022,
        endRadius: 0.0017,
        color: "#f1dbac",
        overviewSides: 3,
      });
      for (const side of [-1, 1])
        LANTANA_MODEL.organs.push({
          name: "included lantana anther chamber",
          cluster: c,
          points: [
            [x + side * 0.003, y - 0.007, z],
            [x + side * 0.003, y + 0.004, z],
            [x + side * 0.002, y + 0.013, z],
          ],
          foldedPoints: [
            [x + side * 0.003, y - 0.007, z],
            [x + side * 0.003, y + 0.004, z],
            [x + side * 0.002, y + 0.013, z],
          ],
          radius: 0.003,
          endRadius: 0.0018,
          flatten: 0.7,
          color: "#d4b477",
          overviewSides: 3,
        });
    }
    LANTANA_MODEL.organs.push(
      {
        name: "included lantana style",
        cluster: c,
        points: [
          [0, 0.012, 0],
          [0.001, 0.12, 0],
          [0.003, 0.18, 0.002],
        ],
        foldedPoints: [
          [0, 0.012, 0],
          [0.001, 0.12, 0],
          [0.003, 0.18, 0.002],
        ],
        radius: 0.0025,
        endRadius: 0.0019,
        color: "#e6dcad",
      },
      {
        name: "oblique subcapitate lantana stigma",
        cluster: c,
        points: [
          [0.003, 0.178, 0.002],
          [0.005, 0.185, 0.002],
          [0.009, 0.188, 0.002],
        ],
        foldedPoints: [
          [0.003, 0.178, 0.002],
          [0.005, 0.185, 0.002],
          [0.009, 0.188, 0.002],
        ],
        radius: 0.005,
        endRadius: 0.003,
        flatten: 0.75,
        color: "#dcca8f",
      },
      {
        name: "superior lantana ovary",
        cluster: c,
        points: [
          [0, -0.01, 0],
          [0, 0.012, 0],
          [0, 0.028, 0],
        ],
        radius: 0.016,
        endRadius: 0.011,
        color: "#9baf69",
      },
    );
    if (young)
      LANTANA_MODEL.organs.push({
        name: "valvate lantana bud crown",
        cluster: c,
        points: [
          [0.012, 0.418, 0],
          [0.014, 0.433, 0],
          [0.014, 0.445, 0],
        ],
        radius: 0.014,
        endRadius: 0.006,
        color: "#e2b83e",
      });
  }
}
for (let head = 0; head < 2; head++) {
  const c = head * 21,
    cluster = LANTANA_MODEL.clusters[c],
    center = LANTANA_HEADS[head],
    e = new Matrix4()
      .makeRotationFromEuler(new Euler(...cluster.rotation))
      .scale(new Vector3(cluster.scale, cluster.scale, cluster.scale))
      .setPosition(...cluster.position)
      .invert().elements;
  LANTANA_MODEL.surfaces.push({
    name: "continuous domed lantana receptacle",
    cluster: c,
    role: "calyx",
    tissue: "leaf",
    periodic: true,
    thickness: 0.035,
    overviewColumns: 24,
    overviewRows: 6,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.008 + 0.427 * (1 - v),
        x = center[0] + Math.sin(a) * r,
        y = center[1] + 0.055 + 0.09 * v,
        z = center[2] + Math.cos(a) * r;
      return [
        e[0] * x + e[4] * y + e[8] * z + e[12],
        e[1] * x + e[5] * y + e[9] * z + e[13],
        e[2] * x + e[6] * y + e[10] * z + e[14],
      ];
    },
  });
}
