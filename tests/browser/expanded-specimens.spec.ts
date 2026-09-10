import { test, expect } from "@playwright/test";
const additions = [
  "poppy",
  "daffodil",
  "iris",
  "calla-lily",
  "anthurium",
  "columbine",
  "bleeding-heart",
  "bird-of-paradise",
];
test("expanded specimens render on their routes and remain operable in garden macro", async ({
  page,
}) => {
  test.setTimeout(150000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.emulateMedia({ reducedMotion: "reduce" });
  for (const slug of additions) {
    await page.goto(`/flower/${slug}/`);
    await expect(page.locator(".bloom-loader")).toHaveCount(0);
    await expect(page.locator("canvas").first()).toBeVisible();
    const bloom = page.getByRole("slider", {
      name: "Bloom amount",
      exact: true,
    });
    await bloom.press("Home");
    await expect(bloom).toHaveValue("0");
    await bloom.press("End");
    await expect(bloom).toHaveValue("1");
    await page
      .getByRole("button", { name: "Explore close-up", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Return to full flower" }),
    ).toBeVisible();
  }
  await page.goto("/garden/");
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
  for (const slug of additions) {
    await page.getByLabel("Explore a garden flower").selectOption(slug);
    await expect(
      page.getByRole("button", { name: "Return to garden" }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Specimen", exact: true }),
    ).toHaveAttribute("href", `/flower/${slug}/`);
  }
  expect(errors).toEqual([]);
});
