import { test, expect } from "@playwright/test";
import { FLOWERS } from "../../lib/flowers/catalog";
import { expectRenderedFlower } from "./pixel-content";
import {
  advancePublishedFrames,
  catalogSpecimen,
  expectConstrainedBuffer,
  observeRendering,
} from "./cymes-and-spikes-cases";

// Exercise the real WebGL-compatible tissue/HDR fallback without replacing a renderer.
test.beforeEach(async ({ page }) => {
  await page.addInitScript(() =>
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    }),
  );
});

for (const slug of [
  "gazania",
  "salvia",
  "nicotiana",
  "lantana",
  "echinacea",
] as const) {
  test(`${slug}: five floral forms preserve bloom, macro, pulse, pause and reduced motion`, async ({
    page,
  }, info) => {
    test.setTimeout(240000);
    const specimen = catalogSpecimen(slug),
      healthy = await observeRendering(page);
    await page.emulateMedia({ reducedMotion: "no-preference" });
    await page.goto(`/flower/${slug}/`);
    await expect(page).toHaveURL(new RegExp(`/flower/${slug}/$`));
    await expect(
      page.getByRole("heading", { name: `${specimen.name}.`, exact: true }),
    ).toBeVisible();
    const canvas = page.locator(".flower-canvas canvas"),
      bloom = page.getByRole("slider", { name: "Bloom amount", exact: true });
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-petal-steps")), {
        timeout: 120000,
      })
      .toBeGreaterThan(30);
    const nodes = Number(await canvas.getAttribute("data-petal-nodes"));
    expect(nodes).toBeGreaterThan(0);
    expect(nodes).toBeLessThanOrEqual(
      info.project.name === "mobile" ? 512 : 2048,
    );
    const retainedCanvas = await canvas.elementHandle();
    if (!retainedCanvas) throw new Error("Missing specimen canvas");
    if (info.project.name === "mobile") await expectConstrainedBuffer(canvas);

    await bloom.focus();
    await bloom.press("Home");
    await expect(bloom).toHaveValue("0");
    await bloom.fill("0.5");
    await expect(bloom).toHaveValue("0.5");
    await page
      .getByRole("button", { name: "Explore close-up", exact: true })
      .click();
    await expect(
      page.getByRole("button", { name: "Return to full flower", exact: true }),
    ).toBeVisible();
    await expect(bloom).toHaveValue("0.5");
    await expect(canvas).toHaveAttribute("data-petal-nodes", String(nodes));
    expect(
      await canvas.evaluate(
        (current, original) => current === original,
        retainedCanvas,
      ),
    ).toBe(true);
    if (info.project.name === "mobile") await expectConstrainedBuffer(canvas);
    await expectRenderedFlower(canvas, 0.007);

    const pulse = page.getByRole("button", {
      name: "Pulse the flower",
      exact: true,
    });
    await pulse.focus();
    await pulse.press("Enter");
    await expect(bloom).toHaveValue("0.5");
    await page
      .getByRole("button", { name: "Pause motion", exact: true })
      .click();
    // Publish any steps taken before React applied the pause before sampling it.
    await advancePublishedFrames(canvas);
    const paused = await canvas.getAttribute("data-petal-steps");
    // Cross two publication boundaries so a cached counter cannot mask work during pause.
    await advancePublishedFrames(canvas);
    await expect(canvas).toHaveAttribute("data-petal-steps", paused!);
    await page
      .getByRole("button", { name: "Resume motion", exact: true })
      .click();
    await expect
      .poll(async () => Number(await canvas.getAttribute("data-petal-steps")), {
        timeout: 60000,
      })
      .toBeGreaterThan(Number(paused));
    await expect(bloom).toHaveValue("0.5");
    await page
      .getByRole("button", { name: "Return to full flower", exact: true })
      .click();
    await expect(bloom).toHaveValue("0.5");
    expect(
      await canvas.evaluate(
        (current, original) => current === original,
        retainedCanvas,
      ),
    ).toBe(true);
    if (info.project.name === "mobile") await expectConstrainedBuffer(canvas);

    await page.emulateMedia({ reducedMotion: "reduce" });
    await expect(canvas).toHaveAttribute("data-petal-physics", "settled");
    await expect(pulse).toBeDisabled();
    for (const value of ["0", "0.5", "1", "0.5", "0", "1"]) {
      await bloom.fill(value);
      await expect(bloom).toHaveValue(value);
      await expectRenderedFlower(canvas, 0.007);
    }
    const settledSteps = await canvas.getAttribute("data-petal-steps");
    await advancePublishedFrames(canvas);
    await expect(canvas).toHaveAttribute("data-petal-steps", settledSteps!);
    const themes = new Set<string>();
    for (let theme = 0; theme < 3; theme++) {
      await page.getByRole("button", { name: /Theme:/ }).click();
      themes.add((await page.locator("html").getAttribute("data-theme"))!);
      await expectRenderedFlower(canvas, 0.007);
    }
    expect([...themes].sort()).toEqual(["black", "current", "white"]);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await healthy();
    await retainedCanvas.dispose();
  });

  test(`${slug}: five floral forms collection, canonical redirect and selected garden stay usable`, async ({
    page,
  }, info) => {
    test.setTimeout(240000);
    const specimen = catalogSpecimen(slug),
      healthy = await observeRendering(page);
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/gallery/");
    const search = page.getByRole("searchbox", {
        name: "Search the collection",
        exact: true,
      }),
      link = page.getByRole("link", {
        name: `Explore ${specimen.name}`,
        exact: true,
      });
    for (const query of [specimen.name, specimen.latin]) {
      await search.fill(query);
      await expect(link).toBeVisible();
      await expect(link).toHaveAttribute("href", `/flower/${slug}/`);
    }
    await page
      .getByRole("button", {
        name: "Theme: Current. Switch to Black theme",
        exact: true,
      })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "black");
    await healthy();
    await link.click();
    await expect(page).toHaveURL(new RegExp(`/flower/${slug}/$`));
    const linkedCanvas = page.locator(".flower-canvas canvas");
    // Navigation can commit the DOM before the new renderer has initialized.
    await expect
      .poll(
        async () =>
          Number(await linkedCanvas.getAttribute("data-render-frames")),
        { timeout: 120000 },
      )
      .toBeGreaterThanOrEqual(30);
    await expectRenderedFlower(linkedCanvas, 0.007);
    await healthy();
    await page.goto(`/?flower=${slug}`);
    await expect(page).toHaveURL(new RegExp(`/flower/${slug}/$`));
    await expect(
      page.getByRole("heading", { name: `${specimen.name}.`, exact: true }),
    ).toBeVisible();
    await expect(page.locator("html")).toHaveAttribute("data-theme", "black");
    await healthy();

    await page.goto("/garden/");
    await expect(page.locator(".bloom-loader--overlay")).toHaveCount(0, {
      timeout: 120000,
    });
    const selection = page.getByRole("combobox", {
        name: "Explore a garden flower",
        exact: true,
      }),
      canvas = page.locator(".garden-scene canvas"),
      bloom = page.getByRole("slider", {
        name: "Garden bloom amount",
        exact: true,
      });
    expect(
      await selection
        .locator("option")
        .evaluateAll((options) =>
          options
            .map((option) => (option as HTMLOptionElement).value)
            .filter(Boolean),
        ),
    ).toEqual(FLOWERS.map((flower) => flower.type));
    await bloom.fill("0.5");
    await selection.selectOption(slug);
    await expect(
      page.getByRole("heading", { name: specimen.name, exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Specimen", exact: true }),
    ).toHaveAttribute("href", `/flower/${slug}/`);
    await expect(page).toHaveURL(/\/garden\/$/);
    await expect(canvas).toHaveAttribute("data-petal-physics", "settled", {
      timeout: 120000,
    });
    const nodes = Number(await canvas.getAttribute("data-petal-nodes"));
    expect(nodes).toBeGreaterThan(0);
    expect(nodes).toBeLessThanOrEqual(
      info.project.name === "mobile" ? 512 : 2048,
    );
    await expect(bloom).toHaveValue("0.5");
    await expect(canvas).toHaveAttribute("data-shader-preparation", "ready", {
      timeout: 120000,
    });
    await expectRenderedFlower(canvas, 0.007);
    if (info.project.name === "mobile") await expectConstrainedBuffer(canvas);
    const retainedCanvas = await canvas.elementHandle();
    if (!retainedCanvas) throw new Error("Missing garden canvas");
    await page
      .getByRole("button", { name: "Return to garden", exact: true })
      .click();
    await expect(selection).toHaveValue("");
    await expect(bloom).toHaveValue("0.5");
    // Returning retained plants may recompile their evicted GPU programs.
    // Pixel sampling starts after that explicit state, with its own unchanged deadline.
    await expect(canvas).toHaveAttribute("data-shader-preparation", "ready", {
      timeout: 120000,
    });
    await expectRenderedFlower(canvas, 0.007);
    await selection.selectOption(slug);
    await expect(bloom).toHaveValue("0.5");
    expect(
      await canvas.evaluate(
        (current, original) => current === original,
        retainedCanvas,
      ),
    ).toBe(true);
    await expect(canvas).toHaveAttribute("data-shader-preparation", "ready", {
      timeout: 120000,
    });
    await expectRenderedFlower(canvas, 0.007);
    await expect(page).toHaveURL(/\/garden\/$/);
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await healthy();
    await retainedCanvas.dispose();
  });
}
