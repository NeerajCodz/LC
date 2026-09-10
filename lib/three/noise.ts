/** Mulberry32: deterministic across browsers and React remounts. */
export function seededRandom(seed: number): () => number {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let value = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function hashString(value: string): number {
  let hash = 2166136261;
  for (let i = 0; i < value.length; i++)
    hash = Math.imul(hash ^ value.charCodeAt(i), 16777619);
  return hash >>> 0;
}

export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

export function layeredWind(time: number, phase: number): number {
  return (
    Math.sin(time * 0.63 + phase) * 0.55 +
    Math.sin(time * 1.17 + phase * 1.7) * 0.27 +
    Math.sin(time * 2.31 + phase * 0.8) * 0.12
  );
}
