import { expect, test } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";

for (const failure of ["null", "throw"] as const) {
  test(`botanical browsing survives a ${failure} WebGL probe`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.addInitScript((mode) => {
      const original = HTMLCanvasElement.prototype.getContext;
      Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
        configurable: true,
        value(type: string, ...args: unknown[]) {
          if (type === "webgl2") {
            if (mode === "throw") throw new Error("Simulated blocked graphics");
            return null;
          }
          return Reflect.apply(original, this, [type, ...args]);
        },
      });
    }, failure);
    await page.goto("/");
    await expect(
      page.getByRole("button", { name: "Try 3D again" }),
    ).toBeVisible();
    await page
      .getByRole("searchbox", { name: "Search the collection" })
      .fill("lotus");
    await page
      .getByRole("link", { name: "Explore Lotus", exact: true })
      .click();
    await expect(
      page.getByRole("heading", { name: "Lotus.", exact: true }),
    ).toBeVisible();
    await expect(
      page.locator(".experience [data-renderer=unavailable]"),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Explore close-up", exact: true }),
    ).toBeDisabled();
    await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
    await page
      .getByRole("button", { name: "Next flower", exact: true })
      .click();
    await expect(page).not.toHaveURL(/lotus/);
    await page.goto("/garden/");
    await page
      .getByRole("combobox", { name: "Explore a garden flower" })
      .selectOption("lotus");
    await expect(
      page.getByRole("link", { name: "Specimen", exact: true }),
    ).toHaveAttribute("href", "/flower/lotus/");
    await expect(
      page.getByRole("button", { name: "A passing breeze" }),
    ).toBeDisabled();
    await page.goto("/gallery/");
    await expect(
      page.getByRole("button", { name: "Try 3D again" }),
    ).toBeVisible();
    await page.getByRole("button", { name: "Try 3D again" }).click();
    await expect(
      page.getByRole("button", { name: "Try 3D again" }),
    ).toBeVisible();
    await expect(page.locator("canvas")).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test("renderer setup rejection stays inside the optional scene", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value(type: string, ...args: unknown[]) {
        // The detached support probe succeeds; the real renderer then fails.
        if (type === "webgl2" && this.isConnected) return null;
        return Reflect.apply(original, this, [type, ...args]);
      },
    });
  });
  await page.goto("/flower/lotus/");
  await expect(
    page.locator(".experience [data-renderer=unavailable]"),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Lotus.", exact: true }),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
  expect(errors).toEqual([]);
});

test("context loss stops rendering and explicit retry keeps bloom state", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/flower/lotus/");
  const canvas = page.locator(".flower-canvas canvas");
  await expect(canvas).toHaveAttribute("data-render-frames", /\d+/);
  await expectRenderedFlower(canvas);
  await page.locator("#bloom").fill("0.37");
  await canvas.evaluate((element: HTMLCanvasElement) => {
    const extension = element
      .getContext("webgl2")
      ?.getExtension("WEBGL_lose_context");
    if (!extension)
      throw new Error("Context-loss extension missing in test browser");
    extension.loseContext();
  });
  await expect(
    page.locator(".experience [data-renderer=unavailable]"),
  ).toBeVisible();
  await expect(canvas).toHaveCount(0);
  await expect(page.locator("#bloom")).toHaveValue("0.37");
  await page
    .locator(".experience")
    .getByRole("button", { name: "Try 3D again" })
    .click();
  await expect(canvas).toHaveAttribute("data-render-frames", /\d+/);
  await expect(page.locator("#bloom")).toBeEnabled();
  await expect(page.locator("#bloom")).toHaveValue("0.37");
  await expectRenderedFlower(canvas);
  expect(errors).toEqual([]);
});

test("an exception during drawing stops the frame loop without failing the route", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.addInitScript(() => {
    const original = WebGL2RenderingContext.prototype.drawElementsInstanced;
    WebGL2RenderingContext.prototype.drawElementsInstanced = function (
      ...args
    ) {
      if (document.documentElement.dataset.failDraw === "true")
        throw new Error("Simulated draw failure");
      return original.apply(this, args);
    };
  });
  await page.goto("/flower/lotus/");
  await expect(page.locator(".flower-canvas canvas")).toHaveAttribute(
    "data-render-frames",
    /\d+/,
  );
  await page.evaluate(() => {
    document.documentElement.dataset.failDraw = "true";
  });
  await expect(
    page.locator(".experience [data-renderer=unavailable]"),
  ).toBeVisible();
  await expect(page.locator("canvas")).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Lotus.", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
