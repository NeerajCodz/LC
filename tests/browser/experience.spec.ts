import { expect, test } from "@playwright/test";
test("all species are reachable through the collection", async ({ page }) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/gallery");
  await expect(
    page.getByRole("heading", { name: "Fifteen little wonders." }),
  ).toBeVisible();
  const previews = page.locator(".preview-link");
  await expect(previews).toHaveCount(15);
  await page.getByRole("button", { name: "Side", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Side", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Explore Orchid", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Orchid." })).toBeVisible();
  await expect(page.locator(".growing")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("bloom, macro, pause, and switching remain operable", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator(".growing")).toHaveCount(0);
  const slider = page.getByRole("slider", { name: "Bloom amount" });
  await slider.focus();
  await slider.press("Home");
  await expect(slider).toHaveValue("0");
  await slider.press("End");
  await expect(slider).toHaveValue("1");
  await page
    .getByRole("button", { name: "Explore close-up", exact: true })
    .click();
  await expect(
    page.getByRole("button", { name: "Return to full flower" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(
    page.getByRole("button", { name: "Resume motion" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next flower" }).click();
  await expect(page.getByRole("heading", { name: "Lotus." })).toBeVisible();
});
test("reduced motion and small screens keep viewing functional", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?flower=sunflower");
  await expect(page.getByRole("heading", { name: "Sunflower." })).toBeVisible();
  await expect(page.locator(".growing")).toHaveCount(0);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.goto("/garden");
  await expect(
    page.getByRole("heading", { name: "Let it grow." }),
  ).toBeVisible();
  await expect(
    page.getByRole("slider", { name: "Garden bloom amount" }),
  ).toBeVisible();
});
