/** Conservative before hydration; never initialize a phone at desktop quality. */
export function isConstrainedDevice(): boolean {
  if (typeof window === "undefined") return true;
  const memory = (navigator as Navigator & { deviceMemory?: number })
    .deviceMemory;
  return (
    matchMedia("(max-width: 768px), (pointer: coarse)").matches ||
    (navigator.hardwareConcurrency > 0 && navigator.hardwareConcurrency <= 4) ||
    (memory !== undefined && memory <= 4)
  );
}

/** Public detail defaults, with an optional lower cap for multi-view inspection. */
export function renderDprRequest(
  constrained: boolean,
  macro: boolean,
  maxDpr = Infinity,
) {
  return Math.min(constrained ? 1 : macro ? 2.5 : 2, maxDpr);
}

/** Bound total render-buffer area as well as the GPU's maximum dimension. */
export function boundedDpr(
  width: number,
  height: number,
  requested: number,
  constrained: boolean,
  maxDimension = 4096,
) {
  if (width <= 0 || height <= 0) return 1;
  const pixels = constrained ? 1_500_000 : 6_000_000;
  return Math.min(
    requested,
    Math.sqrt(pixels / (width * height)),
    maxDimension / width,
    maxDimension / height,
  );
}
