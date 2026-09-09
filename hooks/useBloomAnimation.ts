import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { clamp01, damp } from '@/lib/three/easing';

export function useBloomAnimation(target: number, speed = 1, reducedMotion = false, paused = false) {
  const bloom = useRef(reducedMotion ? clamp01(target) : 0);
  useFrame((_, dt) => {
    if (!paused) bloom.current = reducedMotion ? clamp01(target) : damp(bloom.current, clamp01(target), 2.6 * speed, dt);
  });
  return bloom;
}
