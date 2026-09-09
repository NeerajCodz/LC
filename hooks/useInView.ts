"use client";
import { useEffect, useRef, useState } from "react";

export function useInView<T extends HTMLElement>(margin = "100px") {
  const ref = useRef<T>(null);
  const [{ visible, visited }, setVisibility] = useState({
    visible: false,
    visited: false,
  });
  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      ([entry]) =>
        setVisibility((previous) => ({
          visible: entry.isIntersecting,
          visited: previous.visited || entry.isIntersecting,
        })),
      { rootMargin: margin },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [margin]);
  return { ref, visible, visited };
}
