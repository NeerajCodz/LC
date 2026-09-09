"use client";
import { useEffect, useState } from "react";
import type { Quality } from "@/lib/flowers/types";

export function useExperienceSettings() {
  const [settings, setSettings] = useState<{
    quality: Quality;
    reducedMotion: boolean;
  }>({ quality: "medium", reducedMotion: false });
  useEffect(() => {
    const small = matchMedia("(max-width: 768px)");
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const update = () =>
      setSettings({
        quality: small.matches ? "low" : "high",
        reducedMotion: reduced.matches,
      });
    update();
    small.addEventListener("change", update);
    reduced.addEventListener("change", update);
    return () => {
      small.removeEventListener("change", update);
      reduced.removeEventListener("change", update);
    };
  }, []);
  return settings;
}
