import type { Vec3 } from "@/lib/flowers/types";
import {
  SINGLE_CLUSTER,
  radialTube,
  type SpecimenModel,
} from "@/lib/three/specimenModel";

/** Cultivated double form: authored 40 petals, rather than the wild five. */
export const CARNATION_PETALS = 40;
export function carnationPetal(index: number) {
  const layer = Math.floor(index / 10),
    a = index * 2.399963 + layer * 0.17;
  const length = 0.94 - layer * 0.085,
    spread = 1.23 - layer * 0.17;
  return (u: number, v: number, open: number): Vec3 => {
    const w = u * 2 - 1;
    const width =
      0.006 + (0.36 - layer * 0.024) * Math.sin(v * Math.PI * 0.55) ** 1.7;
    const fringe =
      0.036 * (0.5 + 0.5 * Math.cos(u * Math.PI * 30 + index * 0.7)) * v ** 12;
    const t = v - fringe;
    const angle = 0.09 + spread * open;
    const radius = 0.045 + layer * 0.019 + Math.sin(angle) * length * t;
    const y =
      0.16 +
      layer * 0.043 +
      Math.cos(angle) * length * t * (0.48 + 0.52 * open) +
      open *
        (0.062 * Math.sin(w * 11 + v * 13 + index) * v ** 2 + 0.08 * w * w * v);
    const across = w * width * (0.12 + 0.88 * open);
    const r = radius + open * 0.045 * Math.sin(w * 8 + index) * v ** 2;
    return [
      Math.sin(a) * r + Math.cos(a) * across,
      y,
      Math.cos(a) * r - Math.sin(a) * across,
    ];
  };
}
export const CARNATION_MODEL: SpecimenModel = {
  clusters: [SINGLE_CLUSTER],
  surfaces: [
    ...Array.from({ length: CARNATION_PETALS }, (_, i) => ({
      name: `fringed petal ${i + 1}`,
      cluster: 0,
      role: "petal" as const,
      sample: carnationPetal(i),
      thickness: 0.009,
      flexible: true,
      delay: Math.floor(i / 10) * 0.085,
      cage: [3, 4] as [number, number],
      mobileCage: [2, 3] as [number, number],
    })),
    {
      name: "cylindrical five-toothed calyx",
      cluster: 0,
      role: "calyx",
      thickness: 0.016,
      periodic: true,
      sample: radialTube(0.135, 0.39, 5, 0.16),
    },
    ...Array.from({ length: 4 }, (_, i) => ({
      name: `basal bract ${i + 1}`,
      cluster: 0,
      role: "calyx" as const,
      thickness: 0.008,
      sample: (u: number, v: number): Vec3 => {
        const a = (i * Math.PI) / 2;
        const r = 0.1 + 0.09 * v,
          w = (u * 2 - 1) * (0.035 * Math.sin(Math.PI * v) + 0.004);
        return [
          Math.sin(a) * r + Math.cos(a) * w,
          -0.055 + 0.26 * v,
          Math.cos(a) * r - Math.sin(a) * w,
        ];
      },
    })),
  ],
  organs: [
    ...Array.from({ length: 10 }, (_, i) => {
      const a = (i * Math.PI) / 5;
      return {
        cluster: 0,
        name: "included stamen",
        points: [
          [Math.sin(a) * 0.035, 0.05, Math.cos(a) * 0.035],
          [Math.sin(a) * 0.055, 0.23, Math.cos(a) * 0.055],
          [Math.sin(a) * 0.045, 0.3, Math.cos(a) * 0.045],
        ] as Vec3[],
        radius: 0.006,
        endRadius: 0.011,
        color: "#d8be83",
      };
    }),
    ...[-1, 1].map((sign) => ({
      cluster: 0,
      name: "style",
      points: [
        [0, 0.05, 0],
        [sign * 0.012, 0.23, 0],
        [sign * 0.027, 0.32, 0],
      ] as Vec3[],
      radius: 0.006,
      color: "#e3d6ba",
    })),
  ],
};
