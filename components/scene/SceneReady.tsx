"use client";
import { useRef } from "react";
import { useFrame } from "@react-three/fiber";

/** Keep the loading ornament until the mounted scene has drawn its first frame. */
export function SceneReady({ onReady }: { onReady?: () => void }) {
  const frames = useRef(0);
  useFrame(() => {
    if (frames.current >= 2) return;
    frames.current += 1;
    if (frames.current === 2) onReady?.();
  });
  return null;
}
