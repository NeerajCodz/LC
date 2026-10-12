import type { Vec3 } from "@/lib/flowers/types";
import type { SpecimenModel, SpecimenOrgan } from "@/lib/three/specimenModel";
import { floralStamens } from "@/lib/three/floralStamens";
import { Euler, Quaternion, Vector3 } from "three";

/** Authored single-flowered pink form, with six fleshy reflexed perianth lobes. */
export function hyacinthPerianth(
  u: number,
  v: number,
  stage: number,
  young = false,
): Vec3 {
  const open = stage * (young ? 0.08 : 1),
    a = u * Math.PI * 2,
    lobe = (0.5 + 0.5 * Math.cos(a * 6)) ** 1.65,
    limb = Math.max(0, (v - 0.53) / 0.47),
    mature =
      0.052 +
      0.091 * Math.sin(v * Math.PI * 0.68) +
      (0.016 + 0.175 * lobe) * limb ** 1.4,
    folded = 0.047 + 0.055 * Math.sin(v * Math.PI) - 0.029 * v,
    radius = mature * open + folded * (1 - open);
  return [
    Math.cos(a) * radius,
    0.65 * v - 0.178 * lobe * limb ** 2 * open,
    Math.sin(a) * radius,
  ];
}

export const HYACINTH_MODEL: SpecimenModel = {
  clusters: Array.from({ length: 21 }, (_, i) => {
    const a = i * 2.399963229728653,
      young = i >= 18,
      inclination = young ? 0.55 : 1.67 + (i % 3) * 0.04,
      orientation = new Euler().setFromQuaternion(
        new Quaternion().setFromUnitVectors(
          new Vector3(0, 1, 0),
          new Vector3(
            Math.sin(a) * Math.sin(inclination),
            Math.cos(inclination),
            Math.cos(a) * Math.sin(inclination),
          ),
        ),
      );
    return {
      position: [
        Math.sin(a) * (young ? 0.085 : 0.135),
        0.06 + i * 0.069,
        Math.cos(a) * (young ? 0.085 : 0.135),
      ] as Vec3,
      rotation: [orientation.x, orientation.y, orientation.z] as Vec3,
      scale: young ? 0.32 - (i - 18) * 0.025 : 0.59 - Math.floor(i / 6) * 0.035,
      nod: young ? 0.012 : 0.02,
    };
  }),
  surfaces: [],
  organs: [],
};

export const HYACINTH_STALKS: SpecimenOrgan[] = [
  {
    name: "stout cylindrical raceme axis",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.012, 0.55, 0],
      [0, 1.12, 0],
      [0, 1.57, 0],
    ],
    radius: 0.046,
    endRadius: 0.019,
    color: "#7d9560",
  },
  ...HYACINTH_MODEL.clusters.map((c, i): SpecimenOrgan => ({
    name: "short fleshy pedicel",
    cluster: 0,
    points: [
      [0, c.position[1] - 0.025, 0],
      [c.position[0] * 0.6, c.position[1] + 0.008, c.position[2] * 0.6],
      c.position,
    ],
    radius: i >= 18 ? 0.012 : 0.016,
    endRadius: 0.01,
    color: "#93a576",
  })),
];

for (let cluster = 0; cluster < 21; cluster++) {
  const young = cluster >= 18;
  HYACINTH_MODEL.surfaces.push({
    name: "waxy reflexed perianth",
    cluster,
    role: "tube",
    periodic: true,
    sample: (u, v, open) => hyacinthPerianth(u, v, open, young),
    thickness: 0.023,
    flexible: true,
    cage: [12, 4],
    mobileCage: [12, 1],
    delay: cluster * 0.013,
    compliance: 0.000018,
    shapeCompliance: 0.00014,
  });
  if (young)
    for (let i = 0; i < 6; i++) {
      const a = (i * Math.PI) / 3;
      HYACINTH_MODEL.surfaces.push({
        name: "imbricated closed-bud tepal tip",
        cluster,
        role: "petal",
        thickness: 0.023,
        delay: cluster * 0.013,
        sample: (u, v, stage) => {
          const w = 2 * u - 1,
            rim = hyacinthPerianth(
              (a + w * 0.57) / (Math.PI * 2),
              1,
              stage,
              true,
            ),
            tipWidth = w * (0.006 + 0.014 * Math.sin(Math.PI * v));
          return [
            (1 - v) * rim[0] +
              v * (-Math.cos(a) * 0.005 - Math.sin(a) * tipWidth),
            rim[1] + 0.036 * v,
            (1 - v) * rim[2] +
              v * (-Math.sin(a) * 0.005 + Math.cos(a) * tipWidth),
          ];
        },
      });
    }
  HYACINTH_MODEL.surfaces.push({
    name: "superior hyacinth ovary",
    cluster,
    role: "calyx",
    periodic: true,
    thickness: 0.014,
    sample: (u, v) => {
      const a = u * Math.PI * 2,
        r =
          (0.026 + 0.023 * Math.sin(Math.PI * v)) *
          (1 + 0.055 * Math.cos(a * 3));
      return [Math.cos(a) * r, -0.025 + 0.155 * v, Math.sin(a) * r];
    },
  });
  const stamens = floralStamens({
    count: 6,
    cluster,
    radius: young ? 0.024 : 0.066,
    base: 0.14,
    height: 0.37,
    foldedHeight: 0.32,
    filamentRadius: 0.006,
    antherLength: 0.053,
    filament: "#e8d5c0",
    anther: "#d8c388",
  });
  HYACINTH_MODEL.organs.push(...stamens, {
    name: "included hyacinth style",
    cluster,
    points: [
      [0, 0.09, 0],
      [0, 0.29, 0.002],
      [0.005, 0.435, 0.005],
    ],
    foldedPoints: [
      [0, 0.09, 0],
      [0, 0.25, 0.001],
      [0.003, 0.35, 0.003],
    ],
    radius: 0.007,
    endRadius: 0.009,
    color: "#d6d9ac",
  });
  for (let i = 0; i < 3; i++) {
    const a = (i * Math.PI * 2) / 3;
    HYACINTH_MODEL.organs.push({
      name: "three-lobed hyacinth stigma",
      cluster,
      points: [
        [0.005, 0.425, 0.005],
        [0.005 + Math.sin(a) * 0.01, 0.442, 0.005 + Math.cos(a) * 0.01],
        [0.005 + Math.sin(a) * 0.018, 0.448, 0.005 + Math.cos(a) * 0.018],
      ],
      foldedPoints: [
        [0.003, 0.34, 0.003],
        [0.003 + Math.sin(a) * 0.006, 0.357, 0.003 + Math.cos(a) * 0.006],
        [0.003 + Math.sin(a) * 0.01, 0.363, 0.003 + Math.cos(a) * 0.01],
      ],
      radius: 0.007,
      endRadius: 0.008,
      color: "#d6d9ac",
    });
  }
  const c = HYACINTH_MODEL.clusters[cluster],
    a = cluster * 2.399963229728653;
  HYACINTH_STALKS.push({
    name: "small perianth-subtending bract",
    cluster: 0,
    points: [
      [Math.sin(a) * 0.03, c.position[1] - 0.026, Math.cos(a) * 0.03],
      [Math.sin(a) * 0.065, c.position[1] + 0.035, Math.cos(a) * 0.065],
      [Math.sin(a) * 0.087, c.position[1] + 0.066, Math.cos(a) * 0.087],
    ],
    radius: 0.012,
    endRadius: 0.002,
    flatten: 0.35,
    color: "#a4b080",
  });
}
