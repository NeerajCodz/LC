"use client";

import { useSyncExternalStore } from "react";

let webGL2Support: boolean | null = null;
let supportProbeScheduled = false;
const subscribers = new Set<() => void>();

function detectWebGL2() {
  try {
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("webgl2", {
      failIfMajorPerformanceCaveat: false,
      powerPreference: "default",
    });
    const available = context !== null;
    context?.getExtension("WEBGL_lose_context")?.loseContext();
    return available;
  } catch {
    return false;
  }
}

function publishWebGL2Support(available: boolean | null) {
  if (webGL2Support === available) return;
  webGL2Support = available;
  subscribers.forEach((notify) => notify());
}

export function markWebGL2Unavailable() {
  publishWebGL2Support(false);
}

function subscribe(notify: () => void) {
  subscribers.add(notify);
  scheduleProbe();
  return () => {
    subscribers.delete(notify);
  };
}

function scheduleProbe() {
  if (webGL2Support !== null || supportProbeScheduled) return;
  supportProbeScheduled = true;
  setTimeout(() => {
    supportProbeScheduled = false;
    publishWebGL2Support(detectWebGL2());
  }, 0);
}

export function retryWebGL2() {
  publishWebGL2Support(null);
  scheduleProbe();
}

export function useWebGL2Support() {
  return useSyncExternalStore(
    subscribe,
    () => webGL2Support,
    () => null,
  );
}

export function WebGLUnavailable({ inline = false }: { inline?: boolean }) {
  return (
    <div
      className={`webgl-message${inline ? " webgl-message--inline" : ""}`}
      role="status"
      aria-label="Interactive 3D is unavailable"
      data-renderer="unavailable"
    >
      <p>Interactive 3D is unavailable.</p>
      <span>You can still browse every flower and its botanical notes.</span>
      <button type="button" onClick={retryWebGL2}>
        Try 3D again
      </button>
    </div>
  );
}
