"use client";

import { Canvas, type CanvasProps } from "@react-three/fiber";
import { useEffect, useRef, type ReactNode } from "react";
import {
  markWebGL2Unavailable,
  useWebGL2Support,
  WebGLUnavailable,
} from "./WebGLSupport";

/**
 * Only mounts R3F after a WebGL 2 context succeeds. Software WebGL remains valid;
 * unavailable or lost contexts become DOM content instead of rejected Canvas setup.
 */
export function SafeCanvas({
  unavailableFallback = <WebGLUnavailable />,
  onUnavailable,
  ...props
}: CanvasProps & {
  unavailableFallback?: ReactNode;
  onUnavailable?: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const unavailableNotified = useRef(false);
  const available = useWebGL2Support();

  useEffect(() => {
    if (available !== false || unavailableNotified.current) return;
    unavailableNotified.current = true;
    onUnavailable?.();
  }, [available, onUnavailable]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!available || !canvas) return;

    const handleContextLoss = (event: Event) => {
      event.preventDefault();
      markWebGL2Unavailable();
    };
    canvas.addEventListener("webglcontextlost", handleContextLoss);
    return () =>
      canvas.removeEventListener("webglcontextlost", handleContextLoss);
  }, [available]);

  if (available === null) return null;
  if (!available) return unavailableFallback;

  return <Canvas ref={canvasRef} {...props} />;
}
