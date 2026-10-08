import { expect, test } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";

test("document navigation releases its renderer contexts and back navigation restores viewing", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const contexts = new WeakMap<
      WebGL2RenderingContext,
      { released: boolean }
    >();
    const owned: { released: boolean }[] = [];
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args
    ) {
      const context = Reflect.apply(getContext, this, args);
      if (
        args[0] === "webgl2" &&
        context &&
        this.isConnected &&
        !contexts.has(context)
      ) {
        const state = { released: false };
        contexts.set(context, state);
        owned.push(state);
      }
      return context;
    } as typeof getContext;
    const getExtension = WebGL2RenderingContext.prototype.getExtension;
    const wrapped = new WeakSet<WEBGL_lose_context>();
    WebGL2RenderingContext.prototype.getExtension = function (
      this: WebGL2RenderingContext,
      name: string,
    ) {
      const extension = Reflect.apply(getExtension, this, [name]);
      if (
        name === "WEBGL_lose_context" &&
        extension &&
        !wrapped.has(extension)
      ) {
        const lose = extension as WEBGL_lose_context,
          original = lose.loseContext;
        wrapped.add(lose);
        lose.loseContext = () => {
          original.call(lose);
          const state = contexts.get(this);
          if (state) state.released = true;
        };
      }
      return extension;
    } as typeof getExtension;
    Object.assign(window, {
      recordDocumentGpuExit: () => {
        // Register after the renderer's exit listener. Synchronous storage
        // survives document disposal, unlike a pending Playwright binding.
        window.addEventListener("pagehide", (event) => {
          sessionStorage.setItem(
            "document-gpu-exit",
            JSON.stringify({ persisted: event.persisted, contexts: owned }),
          );
        });
      },
    });
    window.addEventListener("pageshow", (event) => {
      document.documentElement.dataset.restoredDocument = String(
        event.persisted,
      );
    });
  });
  await page.goto("/flower/rose/");
  await expect(page.locator(".flower-canvas canvas")).toHaveAttribute(
    "data-render-frames",
    /\d+/,
    { timeout: 60000 },
  );
  await expectRenderedFlower(page.locator(".flower-canvas canvas"), 0.007);
  await page.locator("#bloom").fill("0.37");
  await page.evaluate(() =>
    (
      window as typeof window & { recordDocumentGpuExit: () => void }
    ).recordDocumentGpuExit(),
  );
  await page.goto("/gallery/");
  const exit: { persisted: boolean; contexts: { released: boolean }[] } =
    await page.evaluate(() =>
      JSON.parse(sessionStorage.getItem("document-gpu-exit") ?? "null"),
    );
  expect(exit).not.toBeNull();
  expect(exit.contexts.length).toBeGreaterThan(0);
  expect(
    exit.contexts.every(
      (context) => context.released === !exit.persisted,
    ),
  ).toBe(true);
  await page.goBack();
  await expect(
    page.getByRole("heading", { name: "Rose.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".flower-canvas canvas")).toHaveAttribute(
    "data-render-frames",
    /\d+/,
    { timeout: 60000 },
  );
  await expectRenderedFlower(page.locator(".flower-canvas canvas"), 0.007);
  if (
    (await page.locator("html").getAttribute("data-restored-document")) ===
    "true"
  ) {
    await expect(page.locator("#bloom")).toHaveValue("0.37");
  }
  expect(errors).toEqual([]);
});
