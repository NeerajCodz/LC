"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useStore, useThree } from "@react-three/fiber";
import { boundedDpr } from "@/lib/performance";

/** One capped clock per Canvas. Offscreen/background scenes retain state at zero FPS. */
export function RenderBudget({
  active = true,
  constrained,
  macro = false,
}: {
  active?: boolean;
  constrained: boolean;
  macro?: boolean;
}) {
  const get = useThree((state) => state.get);
  const { subscribe } = useStore();
  const simulation = useRef(0);
  useLayoutEffect(() => {
    const state = get();
    const requested = constrained ? (macro ? 1.25 : 1) : macro ? 2.5 : 2;
    const context = state.gl.getContext();
    const limit = Math.min(
      state.gl.capabilities.maxTextureSize,
      context.getParameter(context.MAX_RENDERBUFFER_SIZE) as number,
      constrained ? 4096 : 8192,
    );
    const applyBudget = () => {
      const current = get();
      const dpr = boundedDpr(
        current.size.width,
        current.size.height,
        requested,
        constrained,
        limit,
      );
      if (current.viewport.dpr !== dpr) current.setDpr(dpr);
    };
    // Canvas can reconfigure DPR when retained portals register. Enforce the
    // budget on store changes too, before the next render allocates a buffer.
    applyBudget();
    state.gl.domElement.dataset.renderBudget = constrained
      ? "mobile"
      : "desktop";
    return subscribe(applyBudget);
  }, [get, subscribe, constrained, macro]);
  useEffect(() => {
    const state = get();
    const canvas = state.gl.domElement;
    let frame = 0,
      last = 0,
      lost = false,
      rendered = 0;
    const interval = 1000 / (constrained ? 30 : 60);
    const tick = (now: number) => {
      if (!active || document.hidden || lost) {
        frame = 0;
        return;
      }
      if (!last || now - last >= interval - 1) {
        simulation.current += last
          ? Math.min((now - last) / 1000, 0.05)
          : 1 / 60;
        last = now;
        state.advance(simulation.current, false);
        if (++rendered % 30 === 0)
          canvas.dataset.renderFrames = String(rendered);
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if (active && !document.hidden && !lost)
        frame = requestAnimationFrame(tick);
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      resume();
    };
    const onRestored = () => {
      lost = false;
      resume();
    };
    document.addEventListener("visibilitychange", resume);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    resume();
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener("visibilitychange", resume);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [get, active, constrained]);
  return null;
}
