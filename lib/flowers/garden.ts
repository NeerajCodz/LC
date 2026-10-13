import { FLOWER_TYPES, type FlowerType, type Vec3 } from "./types";
import { FLOWER_STRUCTURES } from "./structures";
import { flowerEnvelope } from "./wind";

export const GARDEN_GROUND = -1.8;
interface Planting {
  type: FlowerType;
  position: Vec3;
  scale: number;
}
// Every catalog species is planted on both layouts. A deterministic spiral
// gives the collection room to grow without a separate hand-maintained subset.
function collectionPlantings(mobile: boolean): Planting[] {
  return arrangePlantings(
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

export function arrangePlantings(plants: readonly Planting[]): Planting[] {
  const bounds = plants.map((plant) => ({
    x: plant.position[0],
    y: GARDEN_GROUND + FLOWER_STRUCTURES[plant.type].stemLength * plant.scale,
    z: plant.position[2],
    radius: flowerEnvelope(FLOWER_STRUCTURES[plant.type]) * plant.scale + 0.08,
  }));
  // Placement resolves the full overlap once; runtime head contact keeps its
  // small displacement cap and never moves these planted roots.
  for (let pass = 0; pass < Math.max(64, plants.length * 4); pass++) {
    let largest = 0;
    for (let i = 0; i < bounds.length; i++)
      for (let j = i + 1; j < bounds.length; j++) {
        const a = bounds[i],
          b = bounds[j],
          dy = (b.y - a.y) * 1.65,
          reach = a.radius + b.radius;
        if (Math.abs(dy) >= reach) continue;
        const dx = b.x - a.x,
          dz = b.z - a.z,
          distance = Math.hypot(dx, dz);
        const overlap = Math.sqrt(reach * reach - dy * dy) - distance;
        if (overlap <= 0) continue;
        largest = Math.max(largest, overlap);
        const angle = (i + j * 0.5) * Math.PI * (3 - Math.sqrt(5));
        const nx = distance > 1e-6 ? dx / distance : Math.cos(angle),
          nz = distance > 1e-6 ? dz / distance : Math.sin(angle);
        const push = (overlap + 0.002) / 2;
        a.x -= nx * push;
        a.z -= nz * push;
        b.x += nx * push;
        b.z += nz * push;
      }
    if (largest < 0.00001) break;
  }
  return plants.map((plant, i) => ({
    ...plant,
    position: [bounds[i].x, GARDEN_GROUND, bounds[i].z],
  }));
}

/** Framing grows with the actual planted envelopes, not a catalog-size constant. */
export function gardenDistance(mobile: boolean): number {
  const plants = mobile ? MOBILE_GARDEN_PLANTINGS : GARDEN_PLANTINGS;
  const extent = plants.reduce(
    (max, plant) =>
      Math.max(
        max,
        Math.abs(plant.position[0]) +
          flowerEnvelope(FLOWER_STRUCTURES[plant.type]) * plant.scale,
      ),
    0,
  );
  return Math.max(mobile ? 15 : 14, extent * (mobile ? 5.2 : 2.35));
}
