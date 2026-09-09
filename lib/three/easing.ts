export const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
export const smoothstep = (value: number) => {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
};
export const damp = (
  current: number,
  target: number,
  lambda: number,
  dt: number,
) => target + (current - target) * Math.exp(-lambda * Math.min(dt, 0.1));

export function petalOpenness(
  bloom: number,
  delay: number,
  variation: number,
): number {
  const start = Math.min(0.8, Math.max(0, delay + variation * 0.004));
  return smoothstep((bloom - start) / (1 - start));
}

export interface SpringState {
  value: number;
  velocity: number;
}
/** Critically damped spring integrated in bounded substeps after inactive tabs. */
export function stepSpring(
  state: SpringState,
  target: number,
  dt: number,
  stiffness = 55,
): void {
  const damping = 2 * Math.sqrt(stiffness);
  let remaining = Math.min(dt, 0.1);
  while (remaining > 0) {
    const h = Math.min(remaining, 1 / 120);
    state.velocity +=
      (stiffness * (target - state.value) - damping * state.velocity) * h;
    state.value += state.velocity * h;
    remaining -= h;
  }
}
