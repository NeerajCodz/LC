import { expect, test } from "@playwright/test";
import { FLOWER_TYPES } from "../../lib/flowers/types";

test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

test("mobile specimen, macro, collection and garden keep bounded buffers and live frames", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  async function checkBuffers() {
    const canvases = page.locator("canvas");
    await expect(canvases.first()).toHaveAttribute(
      "data-render-budget",
      "mobile",
    );
    for (const buffer of await canvases.evaluateAll((nodes) =>
      nodes.map((node) => ({ width: node.width, height: node.height })),
    )) {
      expect(buffer.width * buffer.height).toBeLessThanOrEqual(1_500_000);
      expect(Math.max(buffer.width, buffer.height)).toBeLessThanOrEqual(4096);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
    ).toBe(false);
  }
  async function checkLive() {
    const canvas = page.locator("canvas").first();
    const before = Number(
      (await canvas.getAttribute("data-render-frames")) ?? 0,
    );
    await expect
      .poll(async () =>
        Number((await canvas.getAttribute("data-render-frames")) ?? 0),
      )
      .toBeGreaterThan(before);
  }
  await page.goto("/flower/rose/");
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
  await checkBuffers();
  await checkLive();
  await page
    .getByRole("button", { name: "Explore close-up", exact: true })
    .tap();
  await expect(
    page.getByRole("button", { name: "Return to full flower" }),
  ).toBeVisible();
  await checkBuffers();
  await checkLive();
  await page.goto("/gallery/");
  const previews = page.locator(".flower-preview");
  await expect(previews).toHaveCount(FLOWER_TYPES.length);
  for (let i = 0; i < FLOWER_TYPES.length; i++) {
    await previews.nth(i).scrollIntoViewIfNeeded();
    await expect(previews.nth(i)).toHaveAttribute("data-render-rect", /,/);
  }
  await previews.first().scrollIntoViewIfNeeded();
  await expect(page.locator("canvas")).toHaveCount(1);
  await checkBuffers();
  await checkLive();
  await page.goto("/garden/");
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
  await checkBuffers();
  await page.getByRole("button", { name: "A passing breeze" }).tap();
  await checkLive();
  expect(errors).toEqual([]);
});
