import { expect, test } from "@playwright/test";
test("garden macro stays in the garden and supports orbit, zoom and return", async ({
  page,
  isMobile,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/garden/");
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
  await page.getByLabel("Explore a garden flower").selectOption("lotus");
  await expect(
    page.getByRole("heading", { name: "Lotus", exact: true }),
  ).toBeVisible();
  const canvas = page.locator("canvas");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-viewer-distance")))
    .toBeLessThan(5);
  const bounds = await canvas.boundingBox();
  if (!bounds) throw new Error("Missing garden canvas");
  await page.mouse.move(
    bounds.x + bounds.width * 0.5,
    bounds.y + bounds.height * 0.45,
  );
  const before = await canvas.getAttribute("data-viewer-angle");
  await page.mouse.down();
  await page.mouse.move(
    bounds.x + bounds.width * 0.62,
    bounds.y + bounds.height * 0.45,
    { steps: 12 },
  );
  await page.mouse.up();
  await expect
    .poll(() => canvas.getAttribute("data-viewer-angle"))
    .not.toBe(before);
  await expect(
    page.getByRole("heading", { name: "Lotus", exact: true }),
  ).toBeVisible();
  const distance = Number(await canvas.getAttribute("data-viewer-distance"));
  if (isMobile) {
    // Mobile WebKit has no native mouse-wheel injection API.
    await canvas.dispatchEvent("wheel", {
      deltaY: -240,
      bubbles: true,
      cancelable: true,
    });
  } else await page.mouse.wheel(0, -240);
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-viewer-distance")))
    .toBeLessThan(distance);
  await page.getByRole("button", { name: "Return to garden" }).click();
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-viewer-distance")))
    .toBeGreaterThan(10);
  await expect(page).toHaveURL(/\/garden\/$/);
  expect(errors).toEqual([]);
});
