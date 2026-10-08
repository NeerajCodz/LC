"use client";
import { useEffect, useLayoutEffect, useRef } from "react";
import { useStore, useThree } from "@react-three/fiber";
import { boundedDpr } from "@/lib/performance";
import { bindRendererDocumentExit } from "@/lib/three/documentRenderer";
import { GpuFrameGate } from "@/lib/three/gpuFrameGate";
import { SceneProgramPreparation } from "@/lib/three/sceneProgramPreparation";
import { markWebGL2Unavailable } from "./WebGLSupport";

/** One capped clock per Canvas. Two startup frames release readiness; inactive scenes then stay at zero FPS. */
export function RenderBudget({
  active = true,
  constrained,
  macro = false,
  gpuPacing = false,
  shaderScope,
}: {
  active?: boolean;
  constrained: boolean;
  macro?: boolean;
  gpuPacing?: boolean;
  shaderScope?: string;
}) {
  const get = useThree((state) => state.get);
  const { subscribe } = useStore();
  const simulation = useRef(0);
  const startupFrames = useRef(0);
  // Activity changes restart the RAF clock, not this Canvas's draw history.
  const rendered = useRef(0);
  useLayoutEffect(() => {
    const state = get();
    // Keep mobile at CSS-pixel resolution in both modes. Fractional upscaling
    // produced blank composited WebKit macro views despite valid draw calls.
    // Macro still upgrades the geometry; MSAA and the pixel budget stay enabled.
    const requested = constrained ? 1 : macro ? 2.5 : 2;
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
    const context = state.gl.getContext();
    const gate =
      gpuPacing && "fenceSync" in context ? new GpuFrameGate(context) : null;
    const preparation = shaderScope
      ? new SceneProgramPreparation(state.gl)
      : null;
    const before = state.scene.onBeforeRender,
      after = state.scene.onAfterRender;
    let hidden = false,
      visibility = state.scene.visible;
    const restoreVisibility = () => {
      if (hidden) state.scene.visible = visibility;
      hidden = false;
    };
    if (preparation) {
      canvas.dataset.shaderPreparation = "pending";
      state.scene.onBeforeRender = (...args) => {
        before.apply(state.scene, args);
        // Suspense can initially leave only an empty scene. Prepare the complete
        // garden once its named scope and initialized instance morphs are present.
        if (!state.scene.getObjectByName(shaderScope!)) return;
        preparation.begin(state.scene, args[2]);
        if (!preparation.ready()) {
          visibility = state.scene.visible;
          state.scene.visible = false;
          hidden = true;
        } else canvas.dataset.shaderPreparation = "ready";
      };
      state.scene.onAfterRender = (...args) => {
        restoreVisibility();
        after.apply(state.scene, args);
      };
    }
    let frame = 0,
      last = 0,
      lost = false;
    const interval = 1000 / (constrained ? 30 : 60);
    const tick = (now: number) => {
      const starting = startupFrames.current < 2;
      if ((!active && !starting) || document.hidden || lost) {
        frame = 0;
        return;
      }
      if (!last || now - last >= interval - 1) {
        // RAF exceptions are outside React error boundaries. Stop this clock
        // before notifying the DOM so a broken renderer cannot keep throwing.
        try {
          if (gate && !gate.ready()) {
            frame = requestAnimationFrame(tick);
            return;
          }
          if (preparation?.started) {
            if (!preparation.ready()) {
              frame = requestAnimationFrame(tick);
              return;
            }
            canvas.dataset.shaderPreparation = "ready";
          }
          simulation.current += last
            ? Math.min((now - last) / 1000, 0.05)
            : 1 / 60;
          last = now;
          state.advance(simulation.current, false);
          gate?.submitted();
        } catch (error) {
          lost = true;
          frame = 0;
          gate?.dispose();
          preparation?.reset();
          restoreVisibility();
          console.warn("Project LC stopped a failed render loop.", error);
          markWebGL2Unavailable();
          return;
        }
        startupFrames.current += 1;
        if (++rendered.current % 30 === 0)
          canvas.dataset.renderFrames = String(rendered.current);
      }
      frame = requestAnimationFrame(tick);
    };
    const resume = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      last = 0;
      if ((active || startupFrames.current < 2) && !document.hidden && !lost)
        frame = requestAnimationFrame(tick);
    };
    const onLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      gate?.dispose();
      preparation?.reset();
      restoreVisibility();
      resume();
    };
    const onRestored = () => {
      lost = false;
      if (preparation) canvas.dataset.shaderPreparation = "pending";
      resume();
    };
    document.addEventListener("visibilitychange", resume);
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);
    const detachDocumentExit = bindRendererDocumentExit(
      state.gl,
      window,
      () => {
        lost = true;
        cancelAnimationFrame(frame);
        frame = 0;
        gate?.dispose();
        preparation?.reset();
        restoreVisibility();
      },
    );
    resume();
    return () => {
      detachDocumentExit();
      cancelAnimationFrame(frame);
      gate?.dispose();
      preparation?.reset();
      restoreVisibility();
      if (preparation) {
        state.scene.onBeforeRender = before;
        state.scene.onAfterRender = after;
        delete canvas.dataset.shaderPreparation;
      }
      document.removeEventListener("visibilitychange", resume);
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
    };
  }, [get, active, constrained, gpuPacing, shaderScope]);
  return null;
}
