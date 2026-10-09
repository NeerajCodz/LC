import { test, expect } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";

test("fuchsia renders through bloom, macro, themes and garden selection", async ({
  page,
}) => {
  test.setTimeout(180000);
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
  await page.goto("/flower/fuchsia/");
  const canvas = page.locator(".flower-canvas canvas");
  await expect(canvas).toHaveAttribute("data-render-frames", /\d+/);
  // An open, branching shoot covers less area than a dense radial flower head.
  await expectRenderedFlower(canvas, 0.018);
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
    .fill("Fuchsia");
  await expect(
    page.getByRole("link", { name: "Explore Hardy Fuchsia", exact: true }),
  ).toBeVisible();
  await page.goto("/garden/");
  await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0, {
    timeout: 60000,
  });
  await page
    .getByRole("combobox", { name: "Explore a garden flower" })
    .selectOption("fuchsia");
  await expect(
    page.getByRole("heading", { name: "Hardy Fuchsia", exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Specimen", exact: true }),
  ).toHaveAttribute("href", "/flower/fuchsia/");
  await expectRenderedFlower(page.locator(".garden-scene canvas"));
  expect(errors).toEqual([]);
});
