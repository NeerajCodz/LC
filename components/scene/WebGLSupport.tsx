"use client";

import { useEffect, useState } from "react";

let webGL2Support: boolean | null = null;
let supportProbeScheduled = false;
const subscribers = new Set<(available: boolean) => void>();

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

function publishWebGL2Support(available: boolean) {
  if (webGL2Support === available) return;
  webGL2Support = available;
  subscribers.forEach((notify) => notify(available));
}

export function markWebGL2Unavailable() {
  publishWebGL2Support(false);
}

export function useWebGL2Support() {
  const [available, setAvailable] = useState(webGL2Support);
  useEffect(() => {
    subscribers.add(setAvailable);
    if (webGL2Support === null && !supportProbeScheduled) {
      supportProbeScheduled = true;
      setTimeout(() => publishWebGL2Support(detectWebGL2()), 0);
    }
    return () => {
      subscribers.delete(setAvailable);
    };
  }, []);
  return available;
}

export function WebGLUnavailable() {
  return (
    <div
      className="webgl-message"
      role="status"
      aria-label="Interactive 3D is unavailable"
      data-renderer="unavailable"
    >
      <p>Interactive 3D is unavailable.</p>
      <span>You can still browse every flower and its botanical notes.</span>
    </div>
  );
}
