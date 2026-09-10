import { FLOWER_TYPES, type FlowerType, type Vec3 } from "./types";
import { FLOWER_STRUCTURES } from "./structures";
import { flowerEnvelope, resolvePlantContacts } from "./wind";

export const GARDEN_GROUND = -1.8;
interface Planting {
  type: FlowerType;
  position: Vec3;
  scale: number;
}
// Every catalog species is planted on both layouts. A deterministic spiral
// gives the collection room to grow without a separate hand-maintained subset.
function collectionPlantings(mobile: boolean): Planting[] {
  return arrange(
    FLOWER_TYPES.map((type, index) => {
      const angle = index * Math.PI * (3 - Math.sqrt(5));
      const radius = Math.sqrt(index + 0.5);
      return {
        type,
        position: [
          Math.cos(angle) * radius * (mobile ? 0.58 : 1.05),
          GARDEN_GROUND,
          Math.sin(angle) * radius * (mobile ? 0.9 : 0.85),
        ],
        scale: (mobile ? 0.43 : 0.66) * (0.94 + (index % 3) * 0.06),
      };
    }),
  );
}
export const GARDEN_PLANTINGS = collectionPlantings(false);
export const MOBILE_GARDEN_PLANTINGS = collectionPlantings(true);

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
