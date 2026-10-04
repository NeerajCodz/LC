import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
/** Writes at most once a second, never schedules a React update from the render loop. */
export function RenderDiagnostics() {
  const sample = useRef({ frames: 0, started: 0 });
  useFrame(() => {
    const now = performance.now();
    if (!sample.current.started) sample.current.started = now;
    sample.current.frames++;
    // R3F receives a bounded simulation clock. It cannot measure drawing time
    // when a long frame is clamped; sample actual wall time instead.
    const elapsed = (now - sample.current.started) / 1000;
    if (elapsed < 1) return;
    const output = document.getElementById("render-stats");
    if (output) {
      output.dataset.fps = String(Math.round(sample.current.frames / elapsed));
      output.textContent = `${output.dataset.fps} frames per second`;
    }
    sample.current.frames = 0;
    sample.current.started = now;
  });
  return null;
}
