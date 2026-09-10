"use client";
import { useSyncExternalStore } from "react";
import { isConstrainedDevice } from "@/lib/performance";
import type { Quality } from "@/lib/flowers/types";

function subscribe(callback: () => void) {
  const media = [
    matchMedia("(max-width: 768px), (pointer: coarse)"),
    matchMedia("(prefers-reduced-motion: reduce)"),
  ];
  media.forEach((query) => query.addEventListener("change", callback));
  return () =>
    media.forEach((query) => query.removeEventListener("change", callback));
}
const server = () => true;
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

export function useExperienceSettings() {
  const constrained = useSyncExternalStore(
    subscribe,
    isConstrainedDevice,
    server,
  );
  const reducedMotion = useSyncExternalStore(subscribe, reduced, server);
  const quality: Quality = constrained ? "low" : "high";
  return { quality, reducedMotion, constrained };
}
