import { test, expect } from "@playwright/test";
import { captureRenderingCost } from "./render-costs";
import { expectRenderedFlower } from "./pixel-content";

test("cost sampler measures fresh drawn frames after a counter boundary", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.goto("/flower/rose/");
  await page.bringToFront();
  const canvas = page.locator(".flower-canvas canvas");
  await expectRenderedFlower(canvas, 0.01);
  const cost = await captureRenderingCost(canvas);
  expect(cost.frames).toBeGreaterThanOrEqual(120);
  expect(cost.elapsedMs).toBeGreaterThan(0);
  expect(cost.fps).toBeGreaterThan(0);
  expect(cost.contextLost).toBe(false);
  expect(cost.width * cost.height).toBeLessThanOrEqual(
    info.project.name === "mobile" ? 1500000 : 6000000,
  );
  await info.attach("render-cost", {
    body: JSON.stringify(cost, null, 2),
    contentType: "application/json",
  });
});
