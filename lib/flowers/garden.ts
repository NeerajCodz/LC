import type { FlowerType, Vec3 } from "./types";
import { FLOWER_STRUCTURES } from "./structures";
import { flowerEnvelope, resolvePlantContacts } from "./wind";

export const GARDEN_GROUND = -1.8;
interface Planting {
  type: FlowerType;
  position: Vec3;
  scale: number;
}
// Coordinates are fixed planting points. Depth provides growing room, not just
// projected separation; narrow screens get a smaller composition, never squeezed X.
export const GARDEN_PLANTINGS: Planting[] = arrange([
  { type: "lavender", position: [-3.5, GARDEN_GROUND, -1.9], scale: 1.05 },
  { type: "sunflower", position: [-1.5, GARDEN_GROUND, -2.2], scale: 1.2 },
  { type: "lily", position: [0.9, GARDEN_GROUND, -2.0], scale: 1 },
  { type: "cherry-blossom", position: [3.2, GARDEN_GROUND, -1.5], scale: 0.9 },
  { type: "peony", position: [2.0, GARDEN_GROUND, 0.6], scale: 0.82 },
  { type: "rose", position: [-0.3, GARDEN_GROUND, 0.35], scale: 0.82 },
  { type: "marigold", position: [-2.7, GARDEN_GROUND, 0.75], scale: 0.72 },
  { type: "tulip", position: [-1.3, GARDEN_GROUND, 2.6], scale: 0.68 },
  { type: "daisy", position: [1.0, GARDEN_GROUND, 2.65], scale: 0.64 },
]);
export const MOBILE_GARDEN_PLANTINGS: Planting[] = arrange([
  { type: "sunflower", position: [0, GARDEN_GROUND, -2.1], scale: 1 },
  { type: "lily", position: [-1.25, GARDEN_GROUND, -0.4], scale: 0.75 },
  { type: "peony", position: [1.15, GARDEN_GROUND, -0.1], scale: 0.75 },
  { type: "rose", position: [-0.95, GARDEN_GROUND, 1.65], scale: 0.68 },
  { type: "daisy", position: [0.95, GARDEN_GROUND, 2.2], scale: 0.62 },
]);

function arrange(plants: Planting[]): Planting[] {
  const bounds = plants.map((plant) => ({
    x: plant.position[0],
    y: GARDEN_GROUND + FLOWER_STRUCTURES[plant.type].stemLength * plant.scale,
    z: plant.position[2],
    radius: flowerEnvelope(FLOWER_STRUCTURES[plant.type]) * plant.scale + 0.08,
    compliance: 1,
    dx: 0,
    dz: 0,
    pressure: 0,
  }));
  // Solve spacing before planting. Runtime contact bends stems, never moves roots.
  for (let pass = 0; pass < 16; pass++) resolvePlantContacts(bounds);
  return plants.map((plant, i) => ({
    ...plant,
    position: [bounds[i].x, GARDEN_GROUND, bounds[i].z],
  }));
}
