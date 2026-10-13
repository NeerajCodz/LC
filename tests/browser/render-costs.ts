import { expect, type Locator } from "@playwright/test";

/** Approximate advance cadence in 30-frame bins, with a fresh warmup per view. */
export async function captureRenderingCost(canvas: Locator, frames = 120) {
  const count = async () =>
    Number(await canvas.getAttribute("data-render-frames"));
  const viewStart = await count();
  // A published count can lag by 29 advances. Ninety guarantees at least
  // sixty fresh advances even when the view changes within an unpublished bin.
  await expect
    .poll(count, { timeout: 120000 })
    .toBeGreaterThanOrEqual(viewStart + 90);
  const warm = await count();
  await expect
    .poll(count, { timeout: 60000, intervals: [50] })
    .toBeGreaterThan(warm);
  const first = await count(),
    solverStartSteps = Number(await canvas.getAttribute("data-petal-steps")),
    start = performance.now();
  await expect
    .poll(count, { timeout: 120000, intervals: [50] })
    .toBeGreaterThanOrEqual(first + frames);
  const last = await count(),
    elapsedMs = performance.now() - start;
  return canvas.evaluate(
    (node, sample) => {
      const c = node as HTMLCanvasElement,
        gl = c.getContext("webgl2")!;
      const debug = gl.getExtension("WEBGL_debug_renderer_info");
      return {
        ...sample,
        width: c.width,
        height: c.height,
        contextLost: gl.isContextLost(),
        budget: c.dataset.renderBudget,
        tissue: c.dataset.surfaceDetail,
        lighting: c.dataset.lightingBackend,
        transferMeanMs: Number(c.dataset.petalTransferMs ?? 0),
        renderer: gl.getParameter(
          debug?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER,
        ) as string,
        physics: c.dataset.petalPhysics ?? "ambient",
        nodes: Number(c.dataset.petalNodes ?? 0),
        solverMeanMs: Number(c.dataset.petalMs ?? 0),
        solverSteps: Number(c.dataset.petalSteps ?? 0),
        solverStepDelta:
          Number(c.dataset.petalSteps ?? 0) - sample.solverStartSteps,
      };
    },
    {
      frames: last - first,
      elapsedMs,
      solverStartSteps,
      fps: ((last - first) * 1000) / elapsedMs,
    },
  );
}
