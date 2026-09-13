import { test, expect } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";

test("passionflower tissue shaders work without WebGPU through bloom, macro and themes", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /THREE\.WebGLProgram|VALIDATE_STATUS|Shader Error|VALIDATION_ERROR/.test(
        message.text(),
      )
    )
      errors.push(message.text());
  });
  await page.addInitScript(() => {
    Object.defineProperty(Navigator.prototype, "gpu", {
      configurable: true,
      get: () => undefined,
    });
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/flower/passionflower/");
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
  await expectRenderedFlower(page.locator("canvas").first());
  const bloom = page.getByRole("slider", { name: "Bloom amount", exact: true });
  for (const key of ["Home", "End"] as const) {
    await bloom.press(key);
    await expect(bloom).toHaveValue(key === "Home" ? "0" : "1");
  }
  await page
    .getByRole("button", { name: "Explore close-up", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Return to full flower" }),
  ).toBeVisible();
  const canvas = page.locator("canvas").first();
  await expectRenderedFlower(canvas);
  for (let i = 0; i < 3; i++) {
    const before = Number(
      (await canvas.getAttribute("data-render-frames")) ?? 0,
    );
    await page.locator(".theme-toggle").click();
    await expect
      .poll(async () =>
        Number((await canvas.getAttribute("data-render-frames")) ?? 0),
      )
      .toBeGreaterThan(before);
    await expectRenderedFlower(canvas);
  }
  expect(errors).toEqual([]);
});
