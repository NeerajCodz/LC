import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
/** Writes at most once a second, never schedules a React update from the render loop. */
export function RenderDiagnostics() {
  const sample = useRef({ frames: 0, elapsed: 0 });
  useFrame((_, dt) => {
    sample.current.frames++;
    sample.current.elapsed += dt;
    if (sample.current.elapsed < 1) return;
    const output = document.getElementById("render-stats");
    if (output) {
      output.dataset.fps = String(
        Math.round(sample.current.frames / sample.current.elapsed),
      );
      output.textContent = `${output.dataset.fps} frames per second`;
    }
    sample.current.frames = 0;
    sample.current.elapsed = 0;
  });
  return null;
}
