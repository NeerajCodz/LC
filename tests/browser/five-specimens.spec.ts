import { test, expect } from "@playwright/test";
import { expectRenderedFlower } from "./pixel-content";
const specimens = [
  { slug: "carnation", name: "Carnation", latin: "Dianthus caryophyllus" },
  { slug: "plumeria", name: "Plumeria", latin: "Plumeria rubra" },
  { slug: "foxglove", name: "Foxglove", latin: "Digitalis purpurea" },
  { slug: "sweet-pea", name: "Sweet Pea", latin: "Lathyrus odoratus" },
  {
    slug: "bougainvillea",
    name: "Bougainvillea",
    latin: "Bougainvillea glabra",
  },
];
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
});
for (const specimen of specimens)
  test(`${specimen.slug}: anatomy renders through bloom, themes, search and garden`, async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    const errors: string[] = [];
    page.on("pageerror", (e) => errors.push(e.message));
    page.on("console", (m) => {
      if (m.type() === "error" && /shader|THREE.WebGLProgram/.test(m.text()))
        errors.push(m.text());
    });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`/flower/${specimen.slug}/`);
    const canvas = page.locator(".flower-canvas canvas");
    await expect(canvas).toHaveAttribute("data-petal-physics", "settled", {
      timeout: 60000,
    });
    expect(
      Number(await canvas.getAttribute("data-petal-nodes")),
    ).toBeLessThanOrEqual(info.project.name === "mobile" ? 512 : 2048);
    await expectRenderedFlower(canvas, 0.012);
    for (const value of ["0", "0.5", "1", "0", "1"]) {
      await page.locator("#bloom").fill(value);
      await expectRenderedFlower(canvas, 0.007);
    }
    await page
      .getByRole("button", { name: "Explore close-up", exact: true })
      .click();
    await expectRenderedFlower(canvas, 0.012);
    for (let i = 0; i < 3; i++) {
      await page.getByRole("button", { name: /Theme:/ }).click();
      await expectRenderedFlower(canvas, 0.007);
    }
    await page.goto("/gallery/");
    await page
      .getByRole("searchbox", { name: "Search the collection" })
      .fill(specimen.latin);
    await expect(
      page.getByRole("link", { name: `Explore ${specimen.name}`, exact: true }),
    ).toBeVisible();
    await page.goto("/garden/");
    await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0, {
      timeout: 60000,
    });
    await page
      .getByRole("combobox", { name: "Explore a garden flower" })
      .selectOption(specimen.slug);
    await expectRenderedFlower(page.locator(".garden-scene canvas"), 0.007);
    await expect(
      page.getByRole("link", { name: "Specimen", exact: true }),
    ).toHaveAttribute("href", `/flower/${specimen.slug}/`);
    expect(errors).toEqual([]);
  });
test("focused cages survive macro, pause, keyboard pulse and reduced motion", async ({
  page,
}) => {
  test.setTimeout(180000);
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto("/flower/sweet-pea/");
  const canvas = page.locator(".flower-canvas canvas");
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-petal-steps")), {
      timeout: 60000,
    })
    .toBeGreaterThan(30);
  const nodes = await canvas.getAttribute("data-petal-nodes"),
    before = Number(await canvas.getAttribute("data-petal-steps"));
  await page
    .getByRole("button", { name: "Explore close-up", exact: true })
    .click();
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-petal-steps")))
    .toBeGreaterThan(before);
  await expect(canvas).toHaveAttribute("data-petal-nodes", nodes!);
  await expectRenderedFlower(canvas, 0.01);
  const pulse = page.getByRole("button", {
    name: "Pulse the flower",
    exact: true,
  });
  await pulse.focus();
  await pulse.press("Enter");
  await page.getByRole("button", { name: "Pause motion" }).click();
  const stopped = await canvas.getAttribute("data-petal-steps");
  await page.waitForTimeout(800);
  await expect(canvas).toHaveAttribute("data-petal-steps", stopped!);
  await page.getByRole("button", { name: "Resume motion" }).click();
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-petal-steps")))
    .toBeGreaterThan(Number(stopped));
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(canvas).toHaveAttribute("data-petal-physics", "settled");
  await expect(pulse).toBeDisabled();
  const desktopBudget =
    (await canvas.getAttribute("data-render-budget")) === "desktop";
  await page.setViewportSize({ width: 390, height: 844 });
  await expect
    .poll(async () => Number(await canvas.getAttribute("data-petal-nodes")))
    .toBeLessThanOrEqual(512);
  if (desktopBudget) {
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-petal-nodes")))
      .toBeLessThan(Number(nodes));
    await page.setViewportSize({ width: 1280, height: 720 });
    await expect(canvas).toHaveAttribute("data-petal-nodes", nodes!);
  }
  await expectRenderedFlower(canvas, 0.007);
});
