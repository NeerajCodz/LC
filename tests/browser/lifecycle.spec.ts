import { expect, test } from "@playwright/test";

test("gallery preview teardown and route changes keep Canvas providers alive", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/gallery/");
  await expect(page.locator(".preview-stage canvas")).toBeVisible();
  for (let i = 0; i < 3; i++) {
    await page.mouse.wheel(0, 1500);
    await page.mouse.wheel(0, -1500);
  }
  await page.getByRole("link", { name: "Explore Lotus", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Lotus.", exact: true }),
  ).toBeVisible();
  await page.getByRole("link", { name: "The collection", exact: true }).click();
  await expect(page.locator(".preview-stage canvas")).toBeVisible();
  expect(errors).toEqual([]);
});

test("complete flower viewing works when WebGPU is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/flower/lotus/");
  await expect(page.locator(".flower-canvas canvas")).toHaveAttribute(
    "data-surface-detail",
    "webgl",
    { timeout: 15000 },
  );
  await expect(page.locator(".flower-canvas canvas")).toHaveAttribute(
    "data-lighting-backend",
    "webgl",
    { timeout: 15000 },
  );
  await page
    .getByRole("button", { name: "Explore close-up", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Return to full flower", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("catalog routes stay usable when WebGL 2 is unavailable", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, "getContext", {
      configurable: true,
      value(type: string, ...args: unknown[]) {
        if (type === "webgl2") return null;
        return Reflect.apply(getContext, this, [type, ...args]);
      },
    });
  });
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("/garden/");
  await expect(
    page.locator('.garden-scene [data-renderer="unavailable"]'),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Let it grow.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);

  await page.goto("/flower/lotus/");
  await expect(
    page.locator('.experience [data-renderer="unavailable"]'),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Lotus.", exact: true }),
  ).toBeVisible();
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);

  await page.goto("/gallery/");
  await expect(page.locator(".preview-stage canvas")).toHaveCount(0);
  await expect(
    page.locator(".flower-preview-unavailable").first(),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Explore Lotus", exact: true }),
  ).toBeVisible();
  expect(errors).toEqual([]);
});
