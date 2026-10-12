import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";

/** The raceme bends to one side; every pedicel is attached to this same axis. */
export const bluebellAxis = (t: number): Vec3 => [
  0.04 + 0.5 * t * t,
  0.04 + 1.58 * t - 0.27 * t * t,
  -0.025 * Math.sin(Math.PI * t),
];

/** A narrow fused bell with six deeply recurved lobes, not six separate petals. */
export function bluebellPerianth(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.1 : 1),
    angle = u * Math.PI * 2,
    lobe = (0.5 + 0.5 * Math.cos(angle * 6)) ** 2,
    limb = Math.max(0, (v - 0.66) / 0.34),
    mature =
      0.066 +
      0.105 * Math.sin(v * Math.PI * 0.76) +
      (0.025 + 0.112 * lobe) * limb ** 2,
    folded = 0.05 + 0.061 * Math.sin(Math.PI * v) - 0.032 * v,
    radius = folded * (1 - open) + mature * open;
  return [
    Math.cos(angle) * radius,
    0.79 * v - 0.125 * lobe * limb ** 3 * open,
    Math.sin(angle) * radius,
  ];
}

export const BLUEBELL_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 10 }, (_, i) => {
    const p = bluebellAxis(i / 9);
    return {
      position: [
        p[0] + 0.17,
        p[1] - 0.055,
        p[2] + 0.06 + (i % 2) * 0.05,
      ] as Vec3,
      rotation: [2.37 + (i % 3) * 0.09, 0.12 - (i % 2) * 0.24, -0.3] as Vec3,
      scale: i < 8 ? 0.53 - i * 0.016 : 0.31 - (i - 8) * 0.025,
      nod: i < 8 ? 0.065 : 0.03,
    };
  }),
  surfaces: [],
  organs: [],
};

export const BLUEBELL_STALKS: SpecimenOrgan[] = [
  {
    name: "one-sided arched raceme axis",
    cluster: 0,
    points: Array.from({ length: 10 }, (_, i) => bluebellAxis(i / 9)),
    radius: 0.021,
    endRadius: 0.008,
    color: "#6c8551",
  },
  ...BLUEBELL_MODEL.clusters.map((cluster, i): SpecimenOrgan => {
    const p = bluebellAxis(i / 9);
    return {
      name: "nodding bell pedicel",
      cluster: 0,
      points: [p, [p[0] + 0.09, p[1] + 0.025, p[2] + 0.055], cluster.position],
      radius: 0.009,
      endRadius: 0.006,
      color: "#809460",
    };
  }),
];

for (let cluster = 0; cluster < 10; cluster++) {
  const young = cluster >= 8;
  BLUEBELL_MODEL.surfaces.push({
    name: "nodding six-lobed bell",
    cluster,
    role: "tube",
    sample: (u, v, open) => bluebellPerianth(u, v, open, young),
    periodic: true,
    thickness: 0.015,
    flexible: true,
    cage: [12, 5],
    mobileCage: [8, 3],
    delay: cluster * 0.022,
    compliance: 0.000045,
    shapeCompliance: 0.0003,
  });
  BLUEBELL_MODEL.surfaces.push({
    name: "superior three-celled ovary",
    cluster,
    role: "calyx",
    periodic: true,
    thickness: 0.012,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r =
          (0.029 + 0.025 * Math.sin(Math.PI * v)) *
          (1 + 0.06 * Math.cos(a * 3));
      return [Math.cos(a) * r, -0.015 + 0.155 * v, Math.sin(a) * r];
    },
  });
  const stamens = floralStamens({
    count: 6,
    cluster,
    radius: 0.105,
    base: 0.15,
    height: 0.57,
    foldedHeight: 0.44,
    filamentRadius: 0.005,
    antherLength: 0.065,
    filament: "#dfd9bb",
    anther: "#f1efe0",
  });
  // Alternating longer/shorter filament sets distinguish the English species.
  stamens.forEach((organ, index) => {
    const short = Math.floor(index / 3) % 2 === 0;
    if (short)
      for (const points of [organ.points, organ.foldedPoints])
        points?.forEach((p) => {
          p[1] = 0.15 + (p[1] - 0.15) * 0.78;
        });
    if (young)
      for (const points of [organ.points, organ.foldedPoints])
        points?.forEach((p) => {
          p[0] *= 0.27;
          p[2] *= 0.27;
        });
  });
  BLUEBELL_MODEL.organs.push(...stamens, {
    name: "included central style",
    cluster,
    points: [
      [0, 0.11, 0],
      [0.004, 0.36, 0.003],
      [0.012, 0.65, 0.008],
    ],
    foldedPoints: [
      [0, 0.11, 0],
      [0.003, 0.31, 0.002],
      [0.007, 0.52, 0.005],
    ],
    radius: 0.006,
    endRadius: 0.009,
    color: "#dfdfbb",
  });
  const insertion = bluebellAxis(cluster / 9);
  for (const side of [-1, 1])
    BLUEBELL_STALKS.push({
      name: "paired narrow raceme bract",
      cluster: 0,
      points: [
        insertion,
        [
          insertion[0] + 0.035 * side,
          insertion[1] + 0.055,
          insertion[2] - 0.018,
        ],
        [insertion[0] + 0.065 * side, insertion[1] + 0.1, insertion[2] - 0.025],
      ],
      radius: 0.009,
      endRadius: 0.0015,
      flatten: 0.25,
      color: "#a2ab75",
    });
}
