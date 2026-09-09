import type { FlowerType } from "./types";

export interface PetalPalette {
  root: string;
  body: string;
  tip: string;
  vein: string;
  rootFalloff: number;
  tipStart: number;
  veinStrength: number;
}

/** Pigment zones, authored separately from light and geometry. */
const palette = (
  root: string,
  body: string,
  tip: string,
  vein: string,
  rootFalloff = 0.48,
  tipStart = 0.7,
  veinStrength = 0.08,
): PetalPalette => ({
  root,
  body,
  tip,
  vein,
  rootFalloff,
  tipStart,
  veinStrength,
});

export const PETAL_PALETTES: Record<FlowerType, PetalPalette> = {
  rose: palette("#540921", "#b31e47", "#db536c", "#800d31", 0.58, 0.8),
  lotus: palette("#ebe6bc", "#f0c2d3", "#ca3a79", "#be658b", 0.3, 0.42, 0.13),
  marigold: palette("#a63305", "#e36a08", "#ffa017", "#bd4506", 0.55),
  sunflower: palette("#b86806", "#f6bb13", "#ffe051", "#d78d0e", 0.35),
  tulip: palette("#e5b355", "#d83d39", "#f4755a", "#b92d3c", 0.25, 0.83, 0.11),
  lily: palette("#bd7284", "#f5e7dc", "#fff8ed", "#b86180", 0.5, 0.74, 0.06),
  jasmine: palette("#c3cc9f", "#f5f2e9", "#fffdf7", "#d6d5bd", 0.3, 0.7, 0.035),
  orchid: palette("#faf0df", "#c185cb", "#9145ad", "#792b94", 0.25, 0.75, 0.13),
  hibiscus: palette(
    "#620d35",
    "#e63e4b",
    "#f97873",
    "#b42548",
    0.35,
    0.84,
    0.1,
  ),
  dahlia: palette("#641144", "#c1477b", "#f291b0", "#93305e", 0.6, 0.7),
  peony: palette("#a83764", "#e094b0", "#f5c6d3", "#ba6285", 0.6, 0.65, 0.05),
  lavender: palette("#35265f", "#7751aa", "#b39ad5", "#50347f", 0.5, 0.77),
  chrysanthemum: palette("#b08123", "#e6c96e", "#f5e8b6", "#bca145", 0.5),
  daisy: palette("#d3c78a", "#f5f4e9", "#fffdf6", "#c5c8b9", 0.25, 0.65, 0.035),
  "cherry-blossom": palette(
    "#cf6596",
    "#f4dbe4",
    "#fff0f2",
    "#d59caf",
    0.53,
    0.62,
    0.05,
  ),
};
