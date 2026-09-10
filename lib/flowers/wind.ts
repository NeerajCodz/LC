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
  "iris": {"compliance": 0.14, "stiffness": 36, "damping": 0.78, "flutter": 0.85},
  "daffodil": {"compliance": 0.19, "stiffness": 29, "damping": 0.78, "flutter": 0.55},
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
