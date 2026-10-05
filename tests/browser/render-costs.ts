import { expect, type Locator } from "@playwright/test";

/** Counters update in 30-frame batches; start at a fresh boundary after warmup. */
export async function captureRenderingCost(canvas: Locator, frames = 120) {
  const count = async () =>
    Number(await canvas.getAttribute("data-render-frames"));
  await expect.poll(count, { timeout: 120000 }).toBeGreaterThanOrEqual(60);
  const warm = await count();
  await expect
    .poll(count, { timeout: 60000, intervals: [50] })
    .toBeGreaterThan(warm);
  const first = await count(),
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
        renderer: gl.getParameter(
          debug?.UNMASKED_RENDERER_WEBGL ?? gl.RENDERER,
        ) as string,
        physics: c.dataset.petalPhysics ?? "ambient",
        nodes: Number(c.dataset.petalNodes ?? 0),
        solverMeanMs: Number(c.dataset.petalMs ?? 0),
        solverSteps: Number(c.dataset.petalSteps ?? 0),
      };
    },
    {
      frames: last - first,
      elapsedMs,
      fps: ((last - first) * 1000) / elapsedMs,
    },
  );
}
