import { PCFShadowMap } from "three";

const enabledShadows = Object.freeze({ enabled: true, type: PCFShadowMap });
const disabledShadows = Object.freeze({ enabled: false, type: PCFShadowMap });

/** Fiber reapplies this during resize/configuration, including disabled shadows.
 * A startup-only override of its boolean default changed the program cache key
 * after layout, recompiling identical mobile shaders with no shadows in use.
 */
export function botanicalShadowOptions(enabled: boolean) {
  return enabled ? enabledShadows : disabledShadows;
}
