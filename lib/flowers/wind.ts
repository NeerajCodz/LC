import type { FlowerType, FlowerStructure } from "./types";
import type { SpringState } from "../three/easing";

export interface WindProfile {
  compliance: number;
  stiffness: number;
  damping: number;
  flutter: number;
}
// Art-directed response classes informed by habit, stem construction and head load.
// These are not measured species-specific elastic constants. See wind-and-contact.md.
export const WIND_PROFILES: Record<FlowerType, WindProfile> = {
  camellia: { compliance: 0.065, stiffness: 58, damping: 0.91, flutter: 0.26 },
  lisianthus: { compliance: 0.11, stiffness: 48, damping: 0.88, flutter: 0.43 },
  freesia: { compliance: 0.12, stiffness: 47, damping: 0.88, flutter: 0.42 },
  crocus: { compliance: 0.08, stiffness: 50, damping: 0.9, flutter: 0.3 },
  anemone: { compliance: 0.16, stiffness: 43, damping: 0.87, flutter: 0.65 },
  ranunculus: { compliance: 0.12, stiffness: 46, damping: 0.88, flutter: 0.5 },
  zinnia: { compliance: 0.13, stiffness: 46, damping: 0.87, flutter: 0.58 },
  gerbera: { compliance: 0.15, stiffness: 44, damping: 0.86, flutter: 0.62 },
  alstroemeria: {
    compliance: 0.11,
    stiffness: 48,
    damping: 0.86,
    flutter: 0.48,
  },
  delphinium: { compliance: 0.14, stiffness: 46, damping: 0.85, flutter: 0.58 },
  gladiolus: { compliance: 0.12, stiffness: 49, damping: 0.86, flutter: 0.55 },
  snowdrop: { compliance: 0.09, stiffness: 46, damping: 0.88, flutter: 0.42 },
  "lily-of-the-valley": {
    compliance: 0.15,
    stiffness: 38,
    damping: 0.84,
    flutter: 0.36,
  },
  petunia: { compliance: 0.14, stiffness: 44, damping: 0.82, flutter: 1.05 },
  primrose: { compliance: 0.12, stiffness: 40, damping: 0.83, flutter: 0.62 },
  hellebore: { compliance: 0.095, stiffness: 49, damping: 0.86, flutter: 0.5 },
  "king-protea": {
    compliance: 0.06,
    stiffness: 72,
    damping: 0.92,
    flutter: 0.28,
  },
  hydrangea: { compliance: 0.11, stiffness: 49, damping: 0.89, flutter: 0.53 },
  "hardy-begonia": {
    compliance: 0.16,
    stiffness: 34,
    damping: 0.81,
    flutter: 0.75,
  },
  snapdragon: { compliance: 0.12, stiffness: 46, damping: 0.85, flutter: 0.48 },
  cyclamen: { compliance: 0.08, stiffness: 43, damping: 0.85, flutter: 0.45 },
  bougainvillea: {
    compliance: 0.09,
    stiffness: 53,
    damping: 0.87,
    flutter: 1.1,
  },
  "sweet-pea": {
    compliance: 0.072,
    stiffness: 38,
    damping: 0.82,
    flutter: 0.85,
  },
  foxglove: { compliance: 0.19, stiffness: 32, damping: 0.83, flutter: 0.6 },
  plumeria: { compliance: 0.065, stiffness: 67, damping: 0.9, flutter: 0.38 },
  carnation: { compliance: 0.13, stiffness: 44, damping: 0.82, flutter: 0.7 },
  fuchsia: { compliance: 0.13, stiffness: 43, damping: 0.81, flutter: 0.7 },
  "morning-glory": {
    compliance: 0.085,
    stiffness: 38,
    damping: 0.8,
    flutter: 1.15,
  },
  passionflower: {
    compliance: 0.075,
    stiffness: 42,
    damping: 0.82,
    flutter: 0.8,
  },
  "bird-of-paradise": {
    compliance: 0.1,
    stiffness: 49,
    damping: 0.84,
    flutter: 0.6,
  },
  "bleeding-heart": {
    compliance: 0.2,
    stiffness: 25,
    damping: 0.77,
    flutter: 0.7,
  },
  columbine: { compliance: 0.27, stiffness: 23, damping: 0.74, flutter: 1.2 },
  anthurium: { compliance: 0.12, stiffness: 40, damping: 0.84, flutter: 0.35 },
  "calla-lily": {
    compliance: 0.16,
    stiffness: 33,
    damping: 0.8,
    flutter: 0.45,
  },
  iris: { compliance: 0.14, stiffness: 36, damping: 0.78, flutter: 0.85 },
  daffodil: { compliance: 0.19, stiffness: 29, damping: 0.78, flutter: 0.55 },
  poppy: { compliance: 0.29, stiffness: 25, damping: 0.7, flutter: 1.6 },
  rose: { compliance: 0.12, stiffness: 48, damping: 0.75, flutter: 0.65 },
  lotus: { compliance: 0.24, stiffness: 20, damping: 0.78, flutter: 0.55 },
  marigold: { compliance: 0.18, stiffness: 26, damping: 0.8, flutter: 0.65 },
  sunflower: { compliance: 0.18, stiffness: 22, damping: 0.82, flutter: 1 },
  tulip: { compliance: 0.22, stiffness: 29, damping: 0.72, flutter: 0.4 },
  lily: { compliance: 0.18, stiffness: 27, damping: 0.74, flutter: 1.1 },
  jasmine: { compliance: 0.14, stiffness: 42, damping: 0.7, flutter: 1.25 },
  orchid: { compliance: 0.18, stiffness: 24, damping: 0.8, flutter: 0.5 },
  hibiscus: { compliance: 0.11, stiffness: 58, damping: 0.76, flutter: 1.5 },
  dahlia: { compliance: 0.23, stiffness: 19, damping: 0.82, flutter: 0.65 },
  peony: { compliance: 0.25, stiffness: 17, damping: 0.85, flutter: 0.7 },
  lavender: { compliance: 0.28, stiffness: 36, damping: 0.65, flutter: 1.3 },
  chrysanthemum: {
    compliance: 0.17,
    stiffness: 30,
    damping: 0.78,
    flutter: 0.75,
  },
  daisy: { compliance: 0.26, stiffness: 32, damping: 0.68, flutter: 1.2 },
  "cherry-blossom": {
    compliance: 0.075,
    stiffness: 70,
    damping: 0.78,
    flutter: 1.2,
  },
};

export interface PlantMotion {
  x: number;
  z: number;
  drop: number;
  contact: number;
  contactAngle: number;
  air: number;
}

export function flowerEnvelope(structure: FlowerStructure): number {
  const radius = Math.max(
    structure.headRadius ?? 0,
    ...structure.layers.map(
      (layer) =>
        layer.radius +
        layer.profile.length *
          Math.sin(Math.min(Math.PI / 2, layer.angle + 0.25)) +
        layer.profile.width * 0.12,
    ),
  );
  return structure.blossoms
    ? Math.max(
        ...structure.blossoms.map(
          (blossom) =>
            Math.hypot(blossom.position[0], blossom.position[2]) +
            radius * blossom.scale,
        ),
      )
    : radius;
}

/** Clamped cantilever shape: zero displacement AND zero slope at the root. */
export const bendWeight = (height: number) =>
  (height * height * (3 - height)) / 2;
export const bendSlope = (height: number) => 3 * height - 1.5 * height * height;

/** A tendril-supported vine has a second fixed boundary above its planting point. */
export function supportedBendWeight(height: number, support = 0) {
  const free = Math.max(0.05, 1 - support);
  return bendWeight(Math.max(0, Math.min(1, (height - support) / free)));
}
export function supportedBendSlope(height: number, support = 0) {
  const free = Math.max(0.05, 1 - support);
  return bendSlope(Math.max(0, Math.min(1, (height - support) / free))) / free;
}
export function freeStemLength(structure: FlowerStructure) {
  return (
    structure.stemLength * Math.max(0.05, 1 - (structure.supportHeight ?? 0))
  );
}

export function windLoad(time: number, x: number, z: number, gust = 0) {
  const phase = time - x * 0.16 - z * 0.24;
  const velocity =
    0.42 +
    Math.sin(phase * 0.62) * 0.34 +
    Math.sin(phase * 1.37 + 0.9) * 0.15 +
    gust * 2;
  // Quadratic drag, moderated by reconfiguration as stems/leaves turn downwind.
  return (velocity * Math.abs(velocity)) / (1 + 0.55 * Math.abs(velocity));
}

export function gustEnvelope(age: number): number {
  if (age <= 0 || age >= 4.5) return 0;
  return Math.sin((Math.PI * age) / 4.5) ** 2;
}

export function stepPlantSpring(
  spring: SpringState,
  target: number,
  dt: number,
  profile: WindProfile,
) {
  let left = Math.min(0.08, Math.max(0, dt));
  const damping = 2 * Math.sqrt(profile.stiffness) * profile.damping;
  while (left > 0) {
    const h = Math.min(left, 1 / 120);
    spring.velocity +=
      (profile.stiffness * (target - spring.value) -
        damping * spring.velocity) *
      h;
    spring.value += spring.velocity * h;
    left -= h;
  }
}

export interface ContactBody {
  x: number;
  y: number;
  z: number;
  radius: number;
  compliance: number;
  dx: number;
  dz: number;
  pressure: number;
}

/** Small conservative bloom envelopes; positional constraints, not rigid bouncing. */
export function resolvePlantContacts(bodies: ContactBody[]) {
  for (const body of bodies) {
    body.dx = 0;
    body.dz = 0;
    body.pressure = 0;
  }
  for (let iteration = 0; iteration < 4; iteration++) {
    for (let i = 0; i < bodies.length; i++)
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i],
          b = bodies[j];
        const dx = b.x - a.x,
          dz = b.z - a.z;
        const dy = (b.y - a.y) * 1.65;
        const reach = a.radius + b.radius;
        if (Math.abs(dy) >= reach) continue;
        const required = Math.sqrt(reach * reach - dy * dy);
        const distance = Math.hypot(dx, dz);
        const overlap = required - distance;
        if (overlap <= 0) continue;
        const nx = distance > 1e-6 ? dx / distance : 1;
        const nz = distance > 1e-6 ? dz / distance : 0;
        const push = Math.min(0.08, overlap);
        const share = a.compliance / (a.compliance + b.compliance);
        const ax = nx * push * share,
          az = nz * push * share;
        const bx = nx * push * (1 - share),
          bz = nz * push * (1 - share);
        a.x -= ax;
        a.z -= az;
        a.dx -= ax;
        a.dz -= az;
        b.x += bx;
        b.z += bz;
        b.dx += bx;
        b.dz += bz;
        a.pressure = b.pressure = Math.max(
          a.pressure,
          b.pressure,
          Math.min(1, overlap / 0.12),
        );
      }
  }
}
