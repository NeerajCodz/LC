import { leafBlade } from "@/lib/three/botanicalBlades";
const blade = leafBlade("waxy clasping lisianthus leaf", 0.84, 0.31, {
  cup: 0.055,
  thickness: 0.015,
});
export const LISIANTHUS_LEAF = {
  ...blade,
  sample: (u: number, v: number, open: number) => {
    const p = blade.sample(u, v, open);
    p[0] += (2 * u - 1) * 0.05 * (1 - v) ** 4;
    return p;
  },
};
