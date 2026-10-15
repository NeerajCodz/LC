import type { Vec3 } from "@/lib/flowers/types";
import type {
  SpecimenModel,
  SpecimenOrgan,
  SpecimenSurface,
} from "@/lib/three/specimenModel";

/** Four connected limbs emerge from a long narrow tube; the bud is contorted. */
export function ixoraCorolla(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.08 : 1),
    a = u * Math.PI * 2,
    limb = Math.max(0, (v - 0.73) / 0.27);
  const lobe = (0.5 + 0.5 * Math.cos(4 * a)) ** 3;
  const full = 0.021 + 0.006 * v + limb ** 1.6 * (0.037 + 0.24 * lobe);
  const closed = 0.019 + 0.022 * Math.sin(Math.PI * v) + 0.01 * limb;
  const r = closed * (1 - open) + full * open;
  const turn = a + 0.48 * (1 - open) * limb;
  return [
    Math.sin(turn) * r,
    1.15 * Math.min(v / 0.73, 1) + 0.05 * limb - 0.023 * lobe * limb * open,
    Math.cos(turn) * r,
  ];
}
export const IXORA_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 22 }, (_, i) => {
    const a = i * 2.399963229728653,
      r = i < 19 ? 0.17 + 0.53 * Math.sqrt(i / 19) : 0.35 + (i - 19) * 0.12;
    return {
      position: [
        Math.sin(a) * r,
        0.12 + 0.16 * (1 - r * r),
        Math.cos(a) * r,
      ] as Vec3,
      rotation: [0.1 * Math.cos(a), 0, -0.1 * Math.sin(a)] as Vec3,
      scale: i < 19 ? 0.64 + 0.04 * Math.sin(i * 3) : 0.4,
      nod: 0.012,
    };
  }),
  surfaces: [],
  organs: [],
};
export const IXORA_STALKS: SpecimenOrgan[] = [
  {
    name: "woody terminal cyme axis",
    cluster: 0,
    points: [
      [0, -0.36, 0],
      [0, -0.1, 0],
      [0, 0.08, 0],
    ],
    radius: 0.033,
    endRadius: 0.022,
    color: "#846f50",
  },
  ...IXORA_MODEL.clusters.map((c, i): SpecimenOrgan => {
    const sector = (Math.floor(i / 4) * Math.PI) / 3,
      root: Vec3 = [Math.sin(sector) * 0.16, -0.06, Math.cos(sector) * 0.16];
    return {
      name: "cyme terminal branch",
      cluster: 0,
      points: [
        [0, -0.19, 0],
        root,
        [c.position[0] * 0.8, c.position[1] - 0.07, c.position[2] * 0.8],
        c.position,
      ],
      radius: 0.012,
      endRadius: 0.006,
      color: "#82925b",
    };
  }),
];
for (let c = 0; c < 22; c++) {
  const young = c >= 19,
    delay = 0.055 + (c % 5) * 0.013;
  IXORA_MODEL.surfaces.push({
    name: "four-lobed slender ixora corolla",
    cluster: c,
    role: "tube",
    periodic: true,
    thickness: 0.009,
    overviewRows: 4,
    overviewColumns: 16,
    sample: (u, v, o) => ixoraCorolla(u, v, o, young),
    flexible: true,
    cage: [8, 4],
    mobileCage: [4, 3],
    delay,
    compliance: 0.000025,
    shapeCompliance: 0.0003,
  });
  for (let i = 0; i < 4; i++) {
    const direction = (i * Math.PI) / 2;
    const tip: SpecimenSurface = {
      name: "contorted terminal lobe tissue",
      cluster: c,
      role: "petal",
      thickness: 0.009,
      overviewRows: 2,
      overviewColumns: 4,
      delay,
      sample: (u, v, stage) => {
        const open = stage * (young ? 0.08 : 1),
          w = u * 2 - 1,
          a = direction + w * 0.82;
        const root = ixoraCorolla(a / (Math.PI * 2), 0.84, stage, young),
          rim = ixoraCorolla(a / (Math.PI * 2), 1, stage, young);
        const closedAngle = direction + 0.6 + 0.2 * v,
          wid = w * (0.008 + 0.013 * Math.sin(Math.PI * v)),
          radial = 0.046 * (1 - v) - 0.009 * v;
        const closed: Vec3 = [
          Math.sin(closedAngle) * radial + Math.cos(closedAngle) * wid,
          1.17 + 0.061 * v + i * 0.002 * v,
          Math.cos(closedAngle) * radial - Math.sin(closedAngle) * wid,
        ];
        const full: Vec3 = [
          root[0] * (1 - v) + rim[0] * v + Math.sin(a) * 0.028 * v,
          root[1] * (1 - v) + rim[1] * v + 0.005 * Math.sin(Math.PI * v),
          root[2] * (1 - v) + rim[2] * v + Math.cos(a) * 0.028 * v,
        ];
        // Substantial overlap covers different shell/carrier phases without exposing a bud hole.
        return [
          closed[0] * (1 - open) + full[0] * open,
          closed[1] * (1 - open) + full[1] * open,
          closed[2] * (1 - open) + full[2] * open,
        ];
      },
    };
    IXORA_MODEL.surfaces.push(tip);
  }
  IXORA_MODEL.surfaces.push({
    name: "four-toothed ixora calyx",
    cluster: c,
    role: "calyx",
    periodic: true,
    thickness: 0.007,
    overviewRows: 1,
    overviewColumns: 8,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r = 0.034 + 0.008 * v;
      return [
        Math.sin(a) * r,
        -0.015 + 0.094 * v + 0.019 * Math.cos(4 * a) * v ** 5,
        Math.cos(a) * r,
      ];
    },
  });
  for (let i = 0; i < 4; i++) {
    const a = ((i + 0.5) * Math.PI) / 2,
      x = Math.sin(a) * 0.023,
      z = Math.cos(a) * 0.023;
    IXORA_MODEL.organs.push({
      name: "throat stamen filament",
      cluster: c,
      points: [
        [x, 0.99, z],
        [x, 1.13, z],
        [x, 1.17, z],
      ],
      foldedPoints: [
        [x * 0.65, 0.99, z * 0.65],
        [x * 0.65, 1.11, z * 0.65],
        [x * 0.65, 1.15, z * 0.65],
      ],
      radius: 0.003,
      endRadius: 0.0025,
      color: "#e5bb75",
    });
    for (const side of [-1, 1])
      IXORA_MODEL.organs.push({
        name: "throat anther chamber",
        cluster: c,
        points: [
          [x + side * 0.004, 1.16, z],
          [x + side * 0.006, 1.185, z],
          [x + side * 0.004, 1.205, z],
        ],
        foldedPoints: [
          [x * 0.65 + side * 0.003, 1.15, z * 0.65],
          [x * 0.65 + side * 0.004, 1.17, z * 0.65],
          [x * 0.65 + side * 0.003, 1.19, z * 0.65],
        ],
        radius: 0.0045,
        endRadius: 0.0025,
        flatten: 0.65,
        color: "#d6a95d",
      });
  }
  IXORA_MODEL.organs.push({
    name: "exserted ixora style",
    cluster: c,
    points: [
      [0, 0.03, 0],
      [0.002, 0.64, 0],
      [0.006, 1.27, 0.003],
    ],
    foldedPoints: [
      [0, 0.03, 0],
      [0, 0.63, 0],
      [0, 1.17, 0],
    ],
    radius: 0.004,
    endRadius: 0.003,
    color: "#e9b18d",
  });
  for (const side of [-1, 1])
    IXORA_MODEL.organs.push({
      name: "bifid ixora stigma",
      cluster: c,
      points: [
        [0.006, 1.27, 0.003],
        [side * 0.012, 1.29, 0.003],
        [side * 0.025, 1.296, 0.003],
      ],
      foldedPoints: [
        [0, 1.17, 0],
        [side * 0.004, 1.178, 0],
        [side * 0.006, 1.186, 0],
      ],
      radius: 0.004,
      endRadius: 0.0025,
      color: "#eacbaa",
    });
}
export const IXORA_HEAD_CENTER: Vec3 = [0, 0.88, 0];
for (let cluster = 0; cluster < 22; cluster++)
  IXORA_MODEL.organs.push({
    name: "inferior ixora ovary",
    cluster,
    points: [
      [0, -0.07, 0],
      [0, -0.026, 0],
      [0, 0.035, 0],
    ],
    radius: 0.035,
    endRadius: 0.019,
    color: "#6b8c58",
  });
// Permanent young flowers retain complete organs at their enclosed authored stage.
for (const organ of IXORA_MODEL.organs)
  if (organ.cluster >= 19 && organ.foldedPoints)
    organ.points = organ.foldedPoints.map((p) => [...p] as Vec3);
