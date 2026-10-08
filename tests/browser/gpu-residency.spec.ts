import { expect, test } from "@playwright/test";
import { FLOWER_TYPES } from "../../lib/flowers/types";
import { expectRenderedFlower } from "./pixel-content";

test("offscreen retained previews release GPU buffers while keeping their scenes", async ({
  page,
}) => {
  test.setTimeout(180000 + FLOWER_TYPES.length * 2000);
  await page.addInitScript(() => {
    // Track actual native allocations without synchronous getParameter queries.
    const contexts = new WeakMap<
      WebGL2RenderingContext,
      {
        bindings: Map<number, WebGLBuffer | null>;
        sizes: WeakMap<WebGLBuffer, number>;
        bytes: number;
      }
    >();
    const originalContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args
    ) {
      const context = Reflect.apply(originalContext, this, args);
      if (args[0] === "webgl2" && context && !contexts.has(context)) {
        const allocations = {
          bindings: new Map(),
          sizes: new WeakMap(),
          bytes: 0,
        };
        contexts.set(context, allocations);
        Object.defineProperty(this, "residentBufferBytes", {
          value: () => allocations.bytes,
        });
      }
      return context;
    } as typeof originalContext;
    const prototype = WebGL2RenderingContext.prototype;
    const bind = prototype.bindBuffer,
      allocate = prototype.bufferData,
      free = prototype.deleteBuffer;
    prototype.bindBuffer = function (target, buffer) {
      contexts.get(this)?.bindings.set(target, buffer);
      return bind.call(this, target, buffer);
    };
    prototype.bufferData = function (this: WebGL2RenderingContext, ...args) {
      const state = contexts.get(this),
        buffer = state?.bindings.get(args[0]);
      if (state && buffer) {
        const size =
          typeof args[1] === "number" ? args[1] : (args[1]?.byteLength ?? 0);
        state.bytes += size - (state.sizes.get(buffer) ?? 0);
        state.sizes.set(buffer, size);
      }
      return Reflect.apply(allocate, this, args);
    } as typeof allocate;
    prototype.deleteBuffer = function (buffer) {
      const state = contexts.get(this);
      if (state && buffer) {
        state.bytes -= state.sizes.get(buffer) ?? 0;
        state.sizes.delete(buffer);
      }
      return free.call(this, buffer);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/gallery/");
  const previews = page.locator(
    ".gallery-specimen:not([hidden]) .flower-preview",
  );
  const first = page.locator("[data-flower-preview=rose]");
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute("data-render-rect", /,/);
  const identity = await first.getAttribute("data-scene-id");
  const canvas = page.locator(".preview-stage canvas");
  const bytes = () =>
    canvas.evaluate((node) =>
      (
        node as HTMLCanvasElement & { residentBufferBytes: () => number }
      ).residentBufferBytes(),
    );
  const pages = Math.ceil(FLOWER_TYPES.length / 15);
  for (let p = 1; p <= pages; p++) {
    if (p > 1)
      await page
        .getByRole("button", { name: `Page ${p}`, exact: true })
        .click();
    for (let i = 0; i < (await previews.count()); i++) {
      await previews.nth(i).scrollIntoViewIfNeeded();
      await expect(previews.nth(i)).toHaveAttribute("data-render-rect", /,/);
    }
    await expect.poll(bytes).toBeLessThan(32_000_000);
  }
  if (pages > 1)
    await page.getByRole("button", { name: "Page 1", exact: true }).click();
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute("data-scene-id", identity!);
  await expectRenderedFlower(canvas, 0.007);
  await expect(page.locator(".preview-stage")).toHaveAttribute(
    "data-retained-scenes",
    String(FLOWER_TYPES.length),
  );
  await expect(canvas).toHaveCount(1);
});
