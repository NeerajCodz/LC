import type { FlowerStructure } from "@/lib/flowers/types";
import { PETAL } from "@/lib/three/geometry";

export const roseStructure: FlowerStructure = {
  layers: [
    { count: 9, radius: 0.16, height: -0.11, angle: 1.29, delay: -0.05, offset: 0.2, variation: 0.14, profile: { ...PETAL, length: 1.02, width: 1.12, cup: 0.27, curl: 0.3, edge: 0.19, ripple: 0.022 } },
    { count: 10, radius: 0.135, height: -0.025, angle: 1.05, delay: 0.02, offset: 0.53, variation: 0.1, profile: { ...PETAL, length: 0.97, width: 1.01, cup: 0.32, curl: 0.29, edge: 0.18 } },
    { count: 9, radius: 0.11, height: 0.065, angle: 0.8, delay: 0.08, offset: 0.1, profile: { ...PETAL, length: 0.82, width: 0.79, cup: 0.33, curl: 0.27, edge: 0.16 } },
    { count: 8, radius: 0.09, height: 0.135, angle: 0.58, delay: 0.13, offset: 0.42, profile: { ...PETAL, length: 0.66, width: 0.59, cup: 0.3, curl: 0.24, edge: 0.14 } },
    { count: 7, radius: 0.065, height: 0.2, angle: 0.34, delay: 0.18, offset: 0.04, profile: { ...PETAL, length: 0.49, width: 0.43, cup: 0.22, curl: 0.18, twist: 0.08, edge: 0.13 } },
    { count: 5, radius: 0.035, height: 0.235, angle: 0.1, delay: 0.21, offset: 0.3, profile: { ...PETAL, length: 0.35, width: 0.28, cup: 0.12, curl: 0.1, twist: 0.08, edge: 0.12 } },
  ],
  center: "none", centerRadius: 0, centerHeight: 0, stemLength: 2.15, stemRadius: 0.031,
  leafShape: "serrated", leafCount: 3, headTilt: 0.48, roughness: 0.62, sheen: 0.75,
};
