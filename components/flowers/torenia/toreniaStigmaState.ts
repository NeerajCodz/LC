export interface ToreniaStigmaState {
  closure: [number, number];
  target: [number, number];
}

/** Imperative Three resource update, independent of React's immutable props. */
export function writeToreniaStigmaMorph(
  mesh: Mesh | null,
  open: number,
  closure: number,
) {
  const weights = mesh?.morphTargetInfluences;
  if (weights) {
    weights[0] = 1 - open;
    weights[1] = closure * open;
  }
}
export function createToreniaStigmaState(): ToreniaStigmaState {
  return { closure: [0, 0], target: [0, 0] };
}
/** The caller must supply an actual inner-face hit. Proximity alone does not trigger this organ. */
export function touchToreniaStigma(
  state: ToreniaStigmaState,
  lobe: 0 | 1,
  innerFace: boolean,
  bloom: number,
) {
  if (innerFace && Number.isFinite(bloom) && bloom >= 0.65)
    state.target[lobe] = 1;
}
/** UI reset and damping are authored; this is not a biological reopening time course. */
export function advanceToreniaStigma(
  state: ToreniaStigmaState,
  dt: number,
  paused = false,
  reducedMotion = false,
  reset = false,
) {
  if (reducedMotion) {
    state.closure[0] = state.closure[1] = state.target[0] = state.target[1] = 0;
    return;
  }
  if (paused) return;
  if (reset) state.target[0] = state.target[1] = 0;
  const elapsed = Number.isFinite(dt) ? Math.max(0, Math.min(0.05, dt)) : 0,
    weight = 1 - Math.exp(-5.5 * elapsed);
  for (let lobe = 0; lobe < 2; lobe++)
    state.closure[lobe] += (state.target[lobe] - state.closure[lobe]) * weight;
}
import type { Mesh } from "three";
