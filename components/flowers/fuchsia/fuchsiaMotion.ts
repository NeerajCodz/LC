import type { SpringState } from "@/lib/three/easing";

/** Gravity-restored pendant, in seconds/radians/metres. Drag and forcing remain authored. */
export function stepFuchsiaPendant(
  state: SpringState,
  target: number,
  dt: number,
  length = 0.07,
) {
  const stiffness = 9.81 / Math.max(0.02, length),
    damping = 2 * Math.sqrt(stiffness) * 0.38;
  let remaining = Math.min(0.06, Math.max(0, dt));
  while (remaining > 0) {
    const h = Math.min(remaining, 1 / 240);
    state.velocity +=
      (stiffness *
        Math.sin(Math.max(-0.18, Math.min(0.18, target)) - state.value) -
        damping * state.velocity) *
      h;
    state.value += state.velocity * h;
    remaining -= h;
  }
}
