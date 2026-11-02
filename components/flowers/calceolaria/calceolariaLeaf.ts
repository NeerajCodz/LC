import type { SpecimenOrgan, SpecimenSurface } from "@/lib/three/specimenModel";
export const CALCEOLARIA_STEM_LENGTH = 1.78;
export const CALCEOLARIA_LEAF: SpecimenSurface = {
  name: "calceolaria oblong rugose blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.011,
  overviewColumns: 6,
  overviewRows: 8,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      e = Math.sin(Math.PI * v);
    return [
      w * (0.004 + 0.18 * e ** 0.55) * (0.32 + 0.68 * open),
      0.08 + 0.92 * v,
      0.045 * e +
        0.02 * v * v +
        0.03 * w * w * e +
        0.025 * Math.sin(v * 72) * e * (1 - w * w) * Math.abs(w),
    ];
  },
};
export const CALCEOLARIA_PETIOLE: SpecimenOrgan = {
  name: "calceolaria short petiole",
  cluster: 0,
  points: [
    [0, 0, 0],
    [0, 0.04, 0],
    [0, 0.08, 0],
  ],
  radius: 0.008,
  endRadius: 0.005,
  color: "#839461",
};
export const CALCEOLARIA_LEAF_NODES = [0.16, 0.4, 0.67].flatMap((t, i) =>
  [0, Math.PI].map((side) => ({
    t,
    angle: (i * Math.PI) / 2 + side,
    scale: 1 - i * 0.14,
  })),
);
export const CALCEOLARIA_LEAF_TILT = 1.07;
