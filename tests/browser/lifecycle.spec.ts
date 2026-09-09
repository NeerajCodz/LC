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
