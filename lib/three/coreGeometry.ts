import { SphereGeometry } from "three";
import type { Quality } from "../flowers/types";

/** Counts and seeded placement stay intact; only the distant prototype changes. */
export function createCoreGrainGeometry(quality: Quality) {
  return quality === "overview"
    ? new SphereGeometry(1, 8, 5)
    : new SphereGeometry(1, 20, 14);
}
