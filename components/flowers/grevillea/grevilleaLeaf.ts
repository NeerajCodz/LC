import type { SpecimenSurface } from "@/lib/three/specimenModel";
export const GREVILLEA_STEM_LENGTH = 1.36;
export const GREVILLEA_LEAF_TILT = 1.1;
export const GREVILLEA_FOLIAGE_NODES = Array.from({ length: 18 }, (_, i) => ({
  t: 0.12 + i * 0.044,
  angle: i * 2.399963229728653,
  scale: 0.94 + 0.08 * Math.sin(i * 1.4),
}));
/** Narrow entire blade with rolled-under margins and a finite pungent tip. */
export const GREVILLEA_LEAF: SpecimenSurface = {
  name: "revolute rosemary grevillea blade",
  cluster: 0,
  role: "bract",
  tissue: "leaf",
  thickness: 0.009,
  overviewColumns: 6,
  overviewRows: 6,
  sample: (u, v, open) => {
    const w = 2 * u - 1,
      envelope = Math.sin(Math.PI * v);
    return [
      w * (0.0025 + 0.046 * envelope ** 0.42) * (0.4 + 0.6 * open),
      0.56 * v,
      0.042 * w ** 6 * envelope + 0.018 * v * v,
    ];
  },
};
