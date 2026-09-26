import { test, expect } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";

test("morning glory renders through bloom, macro, themes and garden selection", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error" && /shader|THREE.WebGLProgram/i.test(m.text()))
      errors.push(m.text());
  });
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/flower/morning-glory/");
  const canvas = page.locator(".flower-canvas canvas");
  await expect(canvas).toHaveAttribute("data-render-frames", /\d+/);
  await expectRenderedFlower(canvas);
  for (const value of ["0", "0.5", "1"]) {
    await page.locator("#bloom").fill(value);
    await expect(page.locator("#bloom")).toHaveValue(value);
  }
  await page
    .getByRole("button", { name: "Explore close-up", exact: true })
    .click();
  await expectRenderedFlower(canvas);
  for (let i = 0; i < 3; i++) {
    await page.getByRole("button", { name: /Theme:/ }).click();
    await expectRenderedFlower(canvas);
  }
  await page.goto("/gallery/");
  await page
    .getByRole("searchbox", { name: "Search the collection" })
    .fill("Ipomoea");
  await expect(
    page.getByRole("link", { name: "Explore Morning Glory", exact: true }),
  ).toBeVisible();
  await page.goto("/garden/");
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0);
  await page
    .getByRole("combobox", { name: "Explore a garden flower" })
    .selectOption("morning-glory");
  await expect(
    page.getByRole("heading", { name: "Morning Glory", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Specimen", exact: true }),
  ).toHaveAttribute("href", "/flower/morning-glory/");
  await expectRenderedFlower(page.locator(".garden-scene canvas"));
  expect(errors).toEqual([]);
});
