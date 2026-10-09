import { expect, test, type Page } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";
import { trackNativeBuffers } from "./native-buffers";

async function holdPrograms(page: Page) {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(trackNativeBuffers);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    });
    Object.assign(window, { lcHoldGardenPrograms: true });
    const completion = new WeakMap<WebGL2RenderingContext, number>();
    const prototype = WebGL2RenderingContext.prototype,
      extension = prototype.getExtension,
      query = prototype.getProgramParameter;
    prototype.getExtension = function (this: WebGL2RenderingContext, name: string) {
      const value = Reflect.apply(extension, this, [name]);
      if (name === "KHR_parallel_shader_compile" && value)
        completion.set(
          this,
          (value as { COMPLETION_STATUS_KHR: number }).COMPLETION_STATUS_KHR,
        );
      return value;
    } as typeof extension;
    prototype.getProgramParameter = function (program, name) {
      if (
        name === completion.get(this) &&
        (window as typeof window & { lcHoldGardenPrograms: boolean })
          .lcHoldGardenPrograms
      )
        return false;
      return query.call(this, program, name);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
}

async function releasePrograms(page: Page) {
  await page.evaluate(() =>
    Object.assign(window, { lcHoldGardenPrograms: false }),
  );
}

test("early garden selection preserves its loader until real shaders and flower pixels are ready", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await holdPrograms(page);
  await page.goto("/garden/");
  const canvas = page.locator(".garden-scene canvas");
  await expect(canvas).toHaveAttribute("data-shader-preparation", "pending", {
    timeout: 60000,
  });
  // At least one native program must have reached the controlled completion gate.
  await expect
    .poll(
      () =>
        canvas.evaluate((node) =>
          (
            node as HTMLCanvasElement & { nativeProgramCount: () => number }
          ).nativeProgramCount(),
        ),
      { timeout: 60000 },
    )
    .toBeGreaterThan(10);
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(1);
  await page
    .getByRole("combobox", { name: "Explore a garden flower" })
    .selectOption("primrose");
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(1);
  await releasePrograms(page);
  await expect(canvas).toHaveAttribute("data-shader-preparation", "ready", {
    timeout: 60000,
  });
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
  await expectRenderedFlower(canvas, 0.007);
  await expect
    .poll(() =>
      canvas.evaluate((node) =>
        (
          node as HTMLCanvasElement & { nativeProgramCount: () => number }
        ).nativeProgramCount(),
      ),
    )
    .toBeLessThan(15);
  await page.getByRole("button", { name: "Return to garden" }).click();
  await expectRenderedFlower(canvas, 0.007);
  expect(errors).toEqual([]);
});

test("context loss during shader preparation cancels polling and explicit retry draws the garden", async ({
  page,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await holdPrograms(page);
  await page.goto("/garden/");
  const canvas = page.locator(".garden-scene canvas");
  await expect(canvas).toHaveAttribute("data-shader-preparation", "pending", {
    timeout: 60000,
  });
  await expect
    .poll(
      () =>
        canvas.evaluate((node) =>
          (
            node as HTMLCanvasElement & { nativeProgramCount: () => number }
          ).nativeProgramCount(),
        ),
      { timeout: 60000 },
    )
    .toBeGreaterThan(10);
  await canvas.evaluate((node) =>
    (node as HTMLCanvasElement)
      .getContext("webgl2")!
      .getExtension("WEBGL_lose_context")!
      .loseContext(),
  );
  await expect(
    page.getByRole("button", { name: "Try 3D again" }),
  ).toBeVisible();
  await releasePrograms(page);
  await page.getByRole("button", { name: "Try 3D again" }).click();
  await expect(canvas).toHaveAttribute("data-shader-preparation", "ready", {
    timeout: 60000,
  });
  await expectRenderedFlower(canvas, 0.007);
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
  expect(errors).toEqual([]);
});
