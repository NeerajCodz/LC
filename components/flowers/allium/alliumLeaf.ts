import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const ALLIUM_STEM_LENGTH = 2.25;
export const ALLIUM_LEAF_TILT = 1.19;
export const ALLIUM_FOLIAGE_NODES = [0.07, 0.105, 0.14, 0.17].map((t, i) => ({
  t,
  angle: i * 2.399963229728653,
  scale: 1 - i * 0.065,
}));
/** A substantial arching basal strap; muted pigments represent senescing foliage. */
export const ALLIUM_LEAF: SpecimenSurface = {
  name: "arching senescent allium strap",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.013,
  overviewColumns: 4,
  overviewRows: 10,
  sample: (u, v, open) => {
    const w = 2 * u - 1;
    return [
      w * (0.003 + 0.13 * Math.sin(Math.PI * v) ** 0.55) * (0.35 + 0.65 * open),
      1.65 * v,
      0.2 * Math.sin(Math.PI * v) -
        0.13 * v * v +
        0.027 * w * w * Math.sin(Math.PI * v),
    ];
  },
};
