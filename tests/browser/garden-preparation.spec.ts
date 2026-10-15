import { expect, test, type Page } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";
import { trackNativeBuffers } from "./native-buffers";

async function holdPrograms(page: Page, nativeProfile = false) {
  if (!nativeProfile) await page.setViewportSize({ width: 390, height: 844 });
  await page.addInitScript(trackNativeBuffers);
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    });
    Object.assign(window, {
      lcHoldGardenPrograms: true,
      lcHeldGardenProgramQueries: 0,
    });
    const completion = new WeakMap<WebGL2RenderingContext, number>();
    const prototype = WebGL2RenderingContext.prototype,
      extension = prototype.getExtension,
      query = prototype.getProgramParameter;
    prototype.getExtension = function (
      this: WebGL2RenderingContext,
      name: string,
    ) {
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
      ) {
        (window as typeof window & { lcHeldGardenProgramQueries: number })
          .lcHeldGardenProgramQueries++;
        return false;
      }
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

for (const nativeProfile of [false, true]) {
  test(
    nativeProfile
      ? "native-profile garden return polls recreated programs without blocking page controls"
      : "returning to the retained garden polls recreated programs without restarting its canvas or loader",
    async ({ page }) => {
      test.setTimeout(180000);
      const errors: string[] = [];
      page.on("pageerror", (error) => errors.push(error.message));
      await holdPrograms(page, nativeProfile);
      await page.goto("/garden/");
      const canvas = page.locator(".garden-scene canvas"),
        programs = () =>
          canvas.evaluate((node) =>
            (
              node as HTMLCanvasElement & { nativeProgramCount: () => number }
            ).nativeProgramCount(),
          );
      await expect(canvas).toHaveAttribute(
        "data-shader-preparation",
        "pending",
        {
          timeout: 60000,
        },
      );
      await expect.poll(programs, { timeout: 60000 }).toBeGreaterThan(10);
      const heldQueries = () =>
        page.evaluate(
          () =>
            (window as typeof window & { lcHeldGardenProgramQueries: number })
              .lcHeldGardenProgramQueries,
        );
      await expect.poll(heldQueries).toBeGreaterThan(0);
      await releasePrograms(page);
      await expect(canvas).toHaveAttribute("data-shader-preparation", "ready", {
        timeout: 60000,
      });
      await expectRenderedFlower(canvas, 0.007);
      await expect(canvas).toHaveAttribute("data-render-frames", /\d+/, {
        timeout: 60000,
      });
      const fullPrograms = await programs(),
        retainedCanvas = await canvas.elementHandle();
      if (!retainedCanvas) throw new Error("Missing retained garden canvas");
      await page
        .getByRole("combobox", { name: "Explore a garden flower" })
        .selectOption("rose");
      await expectRenderedFlower(canvas, 0.007);
      await expect.poll(programs).toBeLessThan(fullPrograms * 0.5);
      const selectedPrograms = await programs(),
        priorFrames = Number(await canvas.getAttribute("data-render-frames"));
      expect(priorFrames).toBeGreaterThan(0);
      await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
      await page.evaluate(() =>
        Object.assign(window, {
          lcHoldGardenPrograms: true,
          lcHeldGardenProgramQueries: 0,
        }),
      );
      await page.getByRole("button", { name: "Return to garden" }).click();
      await expect(canvas).toHaveAttribute(
        "data-shader-preparation",
        "pending",
      );
      await expect.poll(programs).toBeGreaterThan(selectedPrograms);
      await expect.poll(heldQueries).toBeGreaterThan(0);
      // Completion is withheld for newly linked programs. The page must continue
      // receiving RAF callbacks while the guarded renderer waits instead of drawing.
      expect(
        await page.evaluate(
          () =>
            new Promise<number>((resolve) => {
              let frames = 0;
              const next = () => {
                if (++frames === 8) resolve(frames);
                else requestAnimationFrame(next);
              };
              requestAnimationFrame(next);
            }),
        ),
      ).toBe(8);
      await expect(canvas).toHaveAttribute(
        "data-shader-preparation",
        "pending",
      );
      await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
      expect(
        Number(await canvas.getAttribute("data-render-frames")),
      ).toBeGreaterThanOrEqual(priorFrames);
      await releasePrograms(page);
      await expect(canvas).toHaveAttribute("data-shader-preparation", "ready", {
        timeout: 60000,
      });
      await expectRenderedFlower(canvas, 0.007);
      expect(
        await canvas.evaluate(
          (current, original) => current === original,
          retainedCanvas,
        ),
      ).toBe(true);
      await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
      expect(errors).toEqual([]);
      await retainedCanvas.dispose();
    },
  );
}

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
