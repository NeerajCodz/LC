import { test, expect } from "@playwright/test";
import { CYMES_AND_SPIKES, observeRendering } from "./cymes-and-spikes-cases";
import { expectRenderedFlower, expectScreenshotFlower } from "./pixel-content";

// The isolated runner lists with DEV_INSPECTION=1 and separates inspection files.
// Production discovery creates no development cases and therefore no skipped cases.
if (process.env.DEV_INSPECTION === "1") {
  // Fuchsia covers the legacy overview tessellation changed for garden headroom.
  for (const slug of ["rose", "fuchsia", ...CYMES_AND_SPIKES])
    for (const detail of ["specimen", "overview"] as const)
      test(`${slug}: cymes and spikes ${detail} seven-view anatomy review`, async ({
        page,
      }, info) => {
        test.setTimeout(180000);
        await page.setViewportSize({ width: 1600, height: 1100 });
        const healthy = await observeRendering(page),
          constrained = info.project.name === "mobile";
        await page.goto("/dev/inspection/");
        await expect(
          page.getByRole("combobox", {
            name: "Inspection device tier",
            exact: true,
          }),
        ).toHaveValue("standard");
        await page
          .getByRole("combobox", {
            name: "Inspection device tier",
            exact: true,
          })
          .selectOption(constrained ? "constrained" : "standard");
        await page
          .getByRole("combobox", { name: "Inspection detail", exact: true })
          .selectOption(detail);
        await page
          .getByRole("combobox", { name: "Inspection species", exact: true })
          .selectOption(slug);
        const views = [
          "Front · full",
          "Side · full",
          "45° · full",
          "Macro · full",
          "Front · bud",
          "Front · half",
          "Side · bud",
        ];
        await expect(page.locator("[data-inspection-view]")).toHaveCount(
          views.length,
        );
        for (const name of views) {
          const quality =
            detail === "overview"
              ? "overview"
              : constrained
                ? name === "Macro · full"
                  ? "medium"
                  : "low"
                : name === "Macro · full"
                  ? "ultra"
                  : "high";
          await expect(
            page.locator(`[data-inspection-view="${name}"]`),
          ).toHaveAttribute("data-inspection-quality", quality);
        }
        await expectRenderedFlower(page.locator("canvas"), 0.004);
        await expect(page.locator("canvas")).toHaveAttribute(
          "data-render-budget",
          constrained ? "mobile" : "desktop",
        );
        const buffer = await page
          .locator("canvas")
          .evaluate((canvas) => ({
            width: (canvas as HTMLCanvasElement).width,
            height: (canvas as HTMLCanvasElement).height,
          }));
        expect(buffer.width * buffer.height).toBeLessThanOrEqual(
          constrained ? 1_500_000 : 6_000_000,
        );
        for (const [index, name] of views.entries()) {
          const view = page.locator(`[data-inspection-view="${name}"] > div`),
            png = await view.screenshot();
          // Crop only the view surface; its caption cannot supply flower pixels.
          await expectScreenshotFlower(page.locator("canvas"), png, 0.004);
          await info.attach(`${detail}-${index + 1}-${name}`, {
            body: png,
            contentType: "image/png",
          });
        }
        const capturedQuality =
            detail === "overview"
              ? "overview"
              : constrained
                ? "low-medium"
                : "high-ultra",
          path = info.outputPath(
            `${slug}-${info.project.name}-${capturedQuality}-seven-view.png`,
          );
        await page.screenshot({ path });
        await info.attach(`${detail}-seven-view`, {
          path,
          contentType: "image/png",
        });
        await healthy();
      });

  for (const slug of ["fritillaria", "hoya"] as const)
    for (const detail of ["specimen", "overview"] as const)
      test(`${slug}: targeted ${detail} anatomy inspection`, async ({
        page,
      }, info) => {
        test.setTimeout(180000);
        await page.setViewportSize({ width: 1600, height: 1100 });
        const healthy = await observeRendering(page),
          constrained = info.project.name === "mobile";
        await page.goto("/dev/inspection/");
        await expect(page.locator("[data-inspection-view]")).toHaveCount(7);
        // Geometry choice is independent from the real renderer's device budget.
        await expect(
          page.getByRole("combobox", {
            name: "Inspection device tier",
            exact: true,
          }),
        ).toHaveValue("standard");
        const canvas = page.locator("canvas");
        await expect(canvas).toHaveAttribute(
          "data-render-budget",
          constrained ? "mobile" : "desktop",
        );
        await page
          .getByRole("combobox", {
            name: "Inspection device tier",
            exact: true,
          })
          .selectOption(constrained ? "constrained" : "standard");
        await page
          .getByRole("combobox", { name: "Inspection detail", exact: true })
          .selectOption(detail);
        await page
          .getByRole("combobox", { name: "Inspection species", exact: true })
          .selectOption(slug);
        const toggle = page.getByRole("button", {
          name:
            slug === "fritillaria"
              ? "Bell interior study"
              : "Single-floret study",
          exact: true,
        });
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await toggle.click();
        await expect(toggle).toHaveAttribute("aria-pressed", "true");
        await expect(page.locator("[data-inspection-view]")).toHaveCount(2);
        const views =
          slug === "fritillaria"
            ? ["Bell interior · axial", "Bell interior · oblique"]
            : ["Single floret · full", "Single floret · bud"];
        await expectRenderedFlower(canvas, 0.004);
        for (const [index, name] of views.entries()) {
          const view = page.locator(`[data-inspection-view="${name}"]`);
          await expect(view).toHaveAttribute(
            "data-inspection-quality",
            detail === "overview"
              ? "overview"
              : constrained
                ? "medium"
                : "ultra",
          );
          const path = info.outputPath(
              `${slug}-${info.project.name}-${detail}-study-${index + 1}.png`,
            ),
            png = await view.locator(":scope > div").screenshot({ path });
          await expectScreenshotFlower(canvas, png, 0.004);
          await info.attach(name, { path, contentType: "image/png" });
        }
        const buffer = await canvas.evaluate((node) => ({
          width: (node as HTMLCanvasElement).width,
          height: (node as HTMLCanvasElement).height,
        }));
        expect(buffer.width * buffer.height).toBeLessThanOrEqual(
          constrained ? 1_500_000 : 6_000_000,
        );
        expect(buffer.width).toBeLessThanOrEqual(1600);
        expect(buffer.height).toBeLessThanOrEqual(1100);
        await toggle.click();
        await expect(page.locator("[data-inspection-view]")).toHaveCount(7);
        await expect(toggle).toHaveAttribute("aria-pressed", "false");
        await expectRenderedFlower(canvas, 0.004);
        await healthy();
      });
}
