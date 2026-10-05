import type { Vec3 } from "@/lib/flowers/types";
import { SINGLE_CLUSTER, type SpecimenModel } from "@/lib/three/specimenModel";
export const PLUMERIA_BLOSSOMS: Vec3[] = [
  [0.4, 0.45, 0],
  [-0.55, 0.27, 0.08],
  [0.6, 0.07, 0.56],
];
/** The five fleshy limbs all overlap in one direction above a fused throat. */
export function plumeriaLobe(index: number) {
  const a = (index * Math.PI * 2) / 5;
  return (u: number, v: number, open: number): Vec3 => {
    const w = u * 2 - 1,
      width = 0.009 + 0.31 * Math.sin(v * Math.PI * 0.98) ** 0.72;
    const r = 0.073 + 0.75 * (v - 0.1 * w * w * v ** 8);
    const sweep = 0.26 * v * v + w * width;
    const y = 0.16 + 0.11 * v + (0.03 * w * w - 0.06) * Math.sin(v * Math.PI);
    // Five overlapping sectors wrap a contorted, tapered bud. Narrowing only
    // the flat open blade leaves five separate fingers and exposes its organs.
    const budAngle = a + v * 1.2 + w * 0.69;
    const budRadius =
      0.014 + 0.06 * (1 - v) + 0.095 * Math.sin(Math.PI * v) ** 0.8;
    const bx = Math.sin(budAngle) * budRadius,
      bz = Math.cos(budAngle) * budRadius;
    return [
      bx * (1 - open) + (Math.sin(a) * r + Math.cos(a) * sweep) * open,
      (0.16 + 0.68 * v) * (1 - open) + y * open,
      bz * (1 - open) + (Math.cos(a) * r - Math.sin(a) * sweep) * open,
    ];
  };
}
export const PLUMERIA_MODEL: SpecimenModel = {
  clusters: [
    { ...SINGLE_CLUSTER, nod: 0 },
    ...PLUMERIA_BLOSSOMS.map((position, i) => ({
      position,
      rotation: [0.3 + i * 0.08, i * 0.45, 0] as Vec3,
      scale: 0.92 - i * 0.12,
      nod: 0.012 + i * 0.008,
    })),
    {
      position: [0.02, 0.72, -0.1],
      rotation: [0.2, 0, -0.1],
      scale: 1,
      nod: 0.006,
    },
    {
      position: [-0.23, 0.53, -0.28],
      rotation: [0.12, 0, 0.22],
      scale: 0.78,
      nod: 0.01,
    },
  ],
  surfaces: [
    ...PLUMERIA_BLOSSOMS.flatMap((_, k) => [
      ...Array.from({ length: 5 }, (_, i) => ({
        name: `overlapping corolla lobe ${i + 1}`,
        cluster: k + 1,
        role: "petal" as const,
        thickness: 0.024,
        flexible: true,
        compliance: 0.000025,
        // Fleshy limbs restore their authored curvature more firmly than cloth.
        shapeCompliance: 0.00008,
        delay: k * 0.08,
        sample: plumeriaLobe(i),
        cage: [4, 5] as [number, number],
        mobileCage: [2, 4] as [number, number],
      })),
      {
        name: "fused corolla throat",
        contactObstacle: true,
        cage: [8, 3] as [number, number],
        mobileCage: [6, 3] as [number, number],
        cluster: k + 1,
        role: "tube" as const,
        thickness: 0.022,
        periodic: true,
        sample: (u: number, v: number): Vec3 => {
          const a = u * 2 * Math.PI,
            r = 0.047 + 0.031 * v ** 2;
          return [Math.sin(a) * r, 0.16 * v, Math.cos(a) * r];
        },
      },
    ]),
    ...[4, 5].map((cluster) => ({
      name: "furled younger bud",
      cluster,
      role: "petal" as const,
      thickness: 0.02,
      periodic: true,
      sample: (u: number, v: number, open: number): Vec3 => {
        const a = u * Math.PI * 2 + v * 1.5,
          r =
            0.012 +
            0.087 * Math.sin(Math.PI * v) ** 0.65 +
            open * 0.018 * v * (1 - v);
        return [Math.sin(a) * r, 0.44 * v, Math.cos(a) * r];
      },
    })),
  ],
  organs: [
    ...[
      ...PLUMERIA_BLOSSOMS,
      [0.02, 0.72, -0.1] as Vec3,
      [-0.23, 0.53, -0.28] as Vec3,
    ].map((p, i) => ({
      name: "succulent inflorescence branch",
      cluster: 0,
      points: [
        [0, -0.12, 0],
        [p[0] * 0.45, p[1] * 0.5, p[2] * 0.5],
        p,
      ] as Vec3[],
      radius: i < 3 ? 0.05 : 0.022,
      endRadius: i < 3 ? 0.026 : 0.011,
      color: "#748366",
    })),
    ...PLUMERIA_BLOSSOMS.flatMap((_, k) =>
      Array.from({ length: 5 }, (_, i) => {
        const a = (i * Math.PI * 2) / 5;
        return {
          name: "included anther",
          cluster: k + 1,
          points: [
            [Math.sin(a) * 0.045, 0.04, Math.cos(a) * 0.045],
            [Math.sin(a) * 0.035, 0.085, Math.cos(a) * 0.035],
            [Math.sin(a) * 0.027, 0.12, Math.cos(a) * 0.027],
          ] as Vec3[],
          radius: 0.006,
          endRadius: 0.012,
          color: "#d1a240",
        };
      }),
    ),
    ...PLUMERIA_BLOSSOMS.map((_, k) => ({
      name: "included pistil",
      cluster: k + 1,
      points: [
        [0, 0.01, 0],
        [0, 0.065, 0],
        [0, 0.11, 0],
      ] as Vec3[],
      radius: 0.009,
      endRadius: 0.014,
      color: "#b4bd86",
    })),
  ],
};
