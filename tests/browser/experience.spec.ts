import { expect, test } from "@playwright/test";
import { FLOWER_TYPES } from "../../lib/flowers/types";
test("collection search and pagination expose every species", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await page.goto("/");
  await expect(
    page.getByRole("heading", { name: "A world in bloom." }),
  ).toBeVisible();

  const visiblePreviews = page.locator(
    ".gallery-specimen:not([hidden]) .preview-link",
  );
  const pageCount = Math.ceil(FLOWER_TYPES.length / 20);
  await expect(visiblePreviews).toHaveCount(Math.min(20, FLOWER_TYPES.length));
  await expect(page.locator(".gallery-pagination > div button")).toHaveCount(
    pageCount,
  );
  await expect(page.getByRole("button", { name: "Page 1" })).toHaveAttribute(
    "aria-current",
    "page",
  );
  if (pageCount > 1) {
    await page.getByRole("button", { name: "Page 2" }).click();
    await expect(visiblePreviews).toHaveCount(
      Math.min(20, FLOWER_TYPES.length - 20),
    );
    await expect(page.getByRole("button", { name: "Page 2" })).toHaveAttribute(
      "aria-current",
      "page",
    );
  }

  const search = page.getByRole("searchbox", {
    name: "Search the collection",
  });
  await search.fill("Phalaenopsis");
  await expect(visiblePreviews).toHaveCount(1);
  await page.getByRole("button", { name: "Side", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Side", exact: true }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("link", { name: "Explore Orchid", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Orchid." })).toBeVisible();
  await expect(page).toHaveURL(/\/flower\/orchid\/?$/);
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
  expect(errors).toEqual([]);
});
test("bloom, macro, lighting, pause, and switching remain operable", async ({
  page,
}) => {
  await page.goto("/flower/rose/");
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
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
  const light = page.getByRole("button", { name: "Lock light here" });
  await light.click();
  await expect(
    page.getByRole("button", { name: "Unlock light" }),
  ).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "Unlock light" }).click();
  await expect(light).toHaveAttribute("aria-pressed", "false");
  await page.getByRole("button", { name: "Pause motion" }).click();
  await expect(
    page.getByRole("button", { name: "Resume motion" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Next flower" }).click();
  await expect(page.getByRole("heading", { name: "Lotus." })).toBeVisible();
  await expect(page).toHaveURL(/\/flower\/lotus\/?$/);
});
test("reduced motion and small screens keep viewing functional", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/flower/sunflower");
  await expect(page.getByRole("heading", { name: "Sunflower." })).toBeVisible();
  await expect(page.locator(".bloom-loader")).toHaveCount(0);
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

test("themes persist and the specimen gallery exposes four angles", async ({
  page,
}) => {
  await page.goto("/flower/lotus");
  await page
    .getByRole("button", {
      name: "Theme: Current. Switch to Black theme",
      exact: true,
    })
    .click();
  await page
    .getByRole("button", {
      name: "Theme: Black. Switch to White theme",
      exact: true,
    })
    .click();
  await expect(page.locator("html")).toHaveAttribute("data-theme", "white");
  await page.reload();
  await expect(
    page.getByRole("button", {
      name: "Theme: White. Switch to Current theme",
      exact: true,
    }),
  ).toBeVisible();
  await page
    .getByRole("link", { name: "View every angle", exact: true })
    .click();
  await expect(page.locator("#angles .angle-frame")).toHaveCount(4);
  const bloom = page.getByRole("slider", { name: "Angle gallery bloom" });
  await bloom.focus();
  await bloom.press("Home");
  await expect(bloom).toHaveValue("0");
  await bloom.press("End");
  await expect(bloom).toHaveValue("1");
  await page.goto("/?flower=lotus");
  await expect(page).toHaveURL(/\/flower\/lotus\/?$/);
});
