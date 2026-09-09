import { useRef } from "react";
import { useActiveFrame as useFrame } from "@/hooks/useActiveFrame";
import { clamp01, damp } from "@/lib/three/easing";

export function useBloomAnimation(
  target: number,
  speed = 1,
  reducedMotion = false,
  paused = false,
  animateEntrance = true,
) {
  const bloom = useRef(reducedMotion || !animateEntrance ? clamp01(target) : 0);
  useFrame((_, dt) => {
    if (!paused)
      bloom.current = reducedMotion
        ? clamp01(target)
        : damp(bloom.current, clamp01(target), 2.6 * speed, dt);
  });
  return bloom;
}
