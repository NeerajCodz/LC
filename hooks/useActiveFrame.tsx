"use client";
import { createContext, useContext } from "react";
import { useFrame, type RenderCallback } from "@react-three/fiber";

export const RenderActivity = createContext(true);

/** Retain refs and GPU objects while completely pausing offscreen simulation. */
export function useActiveFrame(callback: RenderCallback, priority?: number) {
  const active = useContext(RenderActivity);
  useFrame((state, delta, frame) => {
    if (active) callback(state, Math.min(delta, 0.05), frame);
  }, priority);
}
