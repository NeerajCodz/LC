import { test, expect } from "@playwright/test";
import {
  expectInspectionLoaded,
  expectInspectionReady,
} from "./inspection-ready";
import { observeRendering } from "./cymes-and-spikes-cases";
import { expectRenderedFlower, expectScreenshotFlower } from "./pixel-content";
test.use({ deviceScaleFactor: 1 });
if (process.env.DEV_INSPECTION === "1") {
  for (const slug of [
    "gazania",
    "salvia",
    "nicotiana",
    "lantana",
    "echinacea",
  ] as const)
    for (const detail of ["specimen", "overview"] as const)
      test(`${slug}: five floral forms ${detail} seven-view anatomy review`, async ({
        page,
      }, info) => {
        test.setTimeout(180000);
        await page.setViewportSize({ width: 1600, height: 1100 });
        const healthy = await observeRendering(page),
          constrained = info.project.name === "mobile";
        await page.goto("/dev/inspection/");
        await expectInspectionLoaded(page);
        await expect(
          page.getByRole("combobox", {
            name: "Inspection device tier",
            exact: true,
          }),
        ).toHaveValue(constrained ? "constrained" : "standard");
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
        await expectInspectionReady(page);
        await expectRenderedFlower(page.locator("canvas"), 0.004);
        await expect(page.locator("canvas")).toHaveAttribute(
          "data-render-budget",
          constrained ? "mobile" : "desktop",
        );
        const buffer = await page.locator("canvas").evaluate((canvas) => ({
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
}
