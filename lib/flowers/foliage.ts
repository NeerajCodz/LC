import type { FlowerType } from "./types";

export interface FoliageProfile {
  basalLobes?: boolean;
  length: number;
  width: number;
  color: string;
  teeth?: number;
  depth?: number;
  lobes?: number;
  leaflets?: number;
  rachis?: number;
  parallel?: boolean;
  basal?: boolean;
  roughness?: number;
  opposite?: boolean;
}

/** Cultivar-independent leaf traits; lotus has its own peltate blade generator. */
export const FOLIAGE: Record<FlowerType, FoliageProfile> = {
  "bird-of-paradise": {
    length: 1.7,
    width: 0.64,
    color: "#577b66",
    parallel: true,
    basal: true,
    roughness: 0.48,
  },
  "bleeding-heart": {
    length: 0.48,
    width: 0.31,
    color: "#648453",
    leaflets: 3,
    rachis: 0.46,
    lobes: 0.4,
  },
  columbine: {
    length: 0.4,
    width: 0.32,
    color: "#587b52",
    leaflets: 3,
    rachis: 0.38,
    lobes: 0.3,
  },
  anthurium: {
    basalLobes: true,
    length: 1.1,
    width: 0.82,
    color: "#315d3a",
    basal: true,
    roughness: 0.42,
  },
  "calla-lily": {
    basalLobes: true,
    length: 1.35,
    width: 0.75,
    color: "#42643c",
    basal: true,
    lobes: 0.1,
    roughness: 0.5,
  },
  iris: {
    length: 1.85,
    width: 0.18,
    color: "#627b62",
    parallel: true,
    basal: true,
  },
  daffodil: {
    length: 1.65,
    width: 0.13,
    color: "#637b53",
    parallel: true,
    basal: true,
  },
  poppy: {
    length: 0.75,
    width: 0.3,
    color: "#607846",
    teeth: 10,
    depth: 0.16,
    lobes: 0.5,
  },
  rose: {
    length: 0.43,
    width: 0.26,
    color: "#365d32",
    teeth: 15,
    depth: 0.09,
    leaflets: 5,
    rachis: 0.56,
  },
  lotus: { length: 1, width: 1, color: "#507e67" },
  marigold: {
    length: 0.32,
    width: 0.09,
    color: "#4d7034",
    teeth: 12,
    depth: 0.14,
    leaflets: 9,
    rachis: 0.66,
  },
  sunflower: {
    length: 0.95,
    width: 0.83,
    color: "#4a6a30",
    teeth: 16,
    depth: 0.075,
    roughness: 0.88,
  },
  tulip: {
    length: 1.6,
    width: 0.43,
    color: "#638779",
    parallel: true,
    basal: true,
    roughness: 0.59,
  },
  lily: { length: 0.95, width: 0.14, color: "#45683b", parallel: true },
  jasmine: {
    length: 0.34,
    width: 0.17,
    color: "#3d6433",
    leaflets: 7,
    rachis: 0.54,
  },
  orchid: {
    length: 1.1,
    width: 0.49,
    color: "#385f3c",
    parallel: true,
    basal: true,
    roughness: 0.48,
  },
  hibiscus: {
    length: 0.84,
    width: 0.61,
    color: "#31592e",
    teeth: 13,
    depth: 0.09,
    roughness: 0.55,
  },
  dahlia: {
    length: 0.57,
    width: 0.3,
    color: "#436332",
    teeth: 13,
    depth: 0.08,
    leaflets: 3,
    rachis: 0.35,
  },
  peony: {
    length: 0.64,
    width: 0.3,
    color: "#426334",
    lobes: 0.17,
    leaflets: 3,
    rachis: 0.38,
  },
  lavender: {
    length: 0.46,
    width: 0.045,
    color: "#829384",
    parallel: true,
    roughness: 0.92,
    opposite: true,
  },
  chrysanthemum: {
    length: 0.83,
    width: 0.5,
    color: "#5b7756",
    teeth: 10,
    depth: 0.11,
    lobes: 0.43,
  },
  daisy: {
    length: 0.65,
    width: 0.19,
    color: "#517337",
    teeth: 10,
    depth: 0.13,
  },
  "cherry-blossom": {
    length: 0.64,
    width: 0.32,
    color: "#66804a",
    teeth: 18,
    depth: 0.065,
  },
};
