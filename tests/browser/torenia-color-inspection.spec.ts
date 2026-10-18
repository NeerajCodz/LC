import { expect, test, type Page } from "@playwright/test";
import { observeRendering } from "./cymes-and-spikes-cases";
import {
  expectInspectionLoaded,
  expectInspectionReady,
} from "./inspection-ready";
import { expectRenderedFlower, expectScreenshotFlower } from "./pixel-content";

test.use({ deviceScaleFactor: 1 });

async function compareUpperFan(
  page: Page,
  botanical: Buffer,
  candidate: Buffer,
) {
  return page.evaluate(
    async ({ baseline, next }) => {
      const decode = async (encoded: string) => {
        const image = new Image();
        const loaded = new Promise<void>((resolve, reject) => {
          image.onload = () => resolve();
          image.onerror = () =>
            reject(new Error("Inspection PNG decode failed"));
        });
        image.src = `data:image/png;base64,${encoded}`;
        await loaded;
        const canvas = document.createElement("canvas");
        canvas.width = 160;
        canvas.height = 112;
        const context = canvas.getContext("2d", { willReadFrequently: true })!;
        // Crop the central flower's upper fan inside the View, excluding all UI.
        context.drawImage(
          image,
          image.width * 0.25,
          image.height * 0.1,
          image.width * 0.5,
          image.height * 0.4,
          0,
          0,
          canvas.width,
          canvas.height,
        );
        return context.getImageData(0, 0, canvas.width, canvas.height).data;
      };
      const before = await decode(baseline),
        after = await decode(next),
        botanicalRgb = [0, 0, 0],
        candidateRgb = [0, 0, 0];
      let pixels = 0,
        absoluteChange = 0,
        changed = 0;
      for (let i = 0; i < before.length; i += 4) {
        // Baseline violet tissue supplies a fixed mask for both color states.
        if (
          before[i + 3] === 0 ||
          before[i + 2] < before[i] + 8 ||
          before[i + 2] < before[i + 1] + 8 ||
          before[i] + before[i + 1] + before[i + 2] < 120
        )
          continue;
        pixels++;
        let difference = 0;
        for (let channel = 0; channel < 3; channel++) {
          botanicalRgb[channel] += before[i + channel];
          candidateRgb[channel] += after[i + channel];
          difference += Math.abs(after[i + channel] - before[i + channel]);
        }
        absoluteChange += difference;
        if (difference > 24) changed++;
      }
      for (let channel = 0; channel < 3; channel++) {
        botanicalRgb[channel] /= Math.max(1, pixels);
        candidateRgb[channel] /= Math.max(1, pixels);
      }
      return {
        pixels,
        botanicalRgb,
        candidateRgb,
        meanAbsoluteRgbChange: absoluteChange / Math.max(1, pixels * 3),
        changedFraction: changed / Math.max(1, pixels),
        redBlueShift:
          candidateRgb[0] -
          candidateRgb[2] -
          (botanicalRgb[0] - botanicalRgb[2]),
      };
    },
    {
      baseline: botanical.toString("base64"),
      next: candidate.toString("base64"),
    },
  );
}

if (process.env.DEV_INSPECTION === "1") {
  test("Torenia's single-floret upper fan renders a custom tint and restores its botanical palette on the retained canvas", async ({
    page,
  }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1600, height: 1100 });
    const healthy = await observeRendering(page);
    await page.goto("/dev/inspection/");
    await expectInspectionLoaded(page);
    await page
      .getByRole("combobox", { name: "Inspection species", exact: true })
      .selectOption("torenia");
    await page
      .getByRole("combobox", { name: "Inspection device tier", exact: true })
      .selectOption(
        info.project.name === "mobile" ? "constrained" : "standard",
      );
    await page
      .getByRole("button", { name: "Single-floret study", exact: true })
      .click();
    await expect(page.locator("[data-inspection-view]")).toHaveCount(2);
    await expectInspectionReady(page);
    const canvas = page.locator("canvas"),
      palette = page.getByRole("combobox", {
        name: "Inspection palette",
        exact: true,
      }),
      view = page.locator(
        '[data-inspection-view="Single floret · full"] > div',
      );
    await expect(palette).toHaveValue("botanical");
    await expectRenderedFlower(canvas, 0.004);
    const retainedCanvas = await canvas.elementHandle();
    if (!retainedCanvas) throw new Error("Missing inspection canvas");
    const botanical = await view.screenshot();
    await expectScreenshotFlower(canvas, botanical, 0.004);
    const baseline = await compareUpperFan(page, botanical, botanical);
    expect(
      baseline.pixels,
      "the cropped fan must contain violet botanical tissue",
    ).toBeGreaterThan(150);
    await info.attach("torenia-botanical-upper-fan", {
      body: botanical,
      contentType: "image/png",
    });
    let coral: Awaited<ReturnType<typeof compareUpperFan>> | undefined,
      coralPng: Buffer | undefined,
      recovered: Awaited<ReturnType<typeof compareUpperFan>> | undefined,
      recoveredPng: Buffer | undefined;
    try {
      await palette.selectOption("coral");
      await expect
        .poll(
          async () => {
            coralPng = await view.screenshot();
            coral = await compareUpperFan(page, botanical, coralPng);
            return coral.redBlueShift;
          },
          {
            timeout: 30000,
            message:
              "rendered upper-fan RGB must change from violet toward coral",
          },
        )
        .toBeGreaterThan(25);
      expect(coral!.meanAbsoluteRgbChange).toBeGreaterThan(15);
      expect(coral!.changedFraction).toBeGreaterThan(0.65);
      expect(
        await canvas.evaluate(
          (current, original) => current === original,
          retainedCanvas,
        ),
      ).toBe(true);
      await healthy();
      await palette.selectOption("botanical");
      await expect
        .poll(
          async () => {
            recoveredPng = await view.screenshot();
            recovered = await compareUpperFan(page, botanical, recoveredPng);
            return Math.max(
              recovered.meanAbsoluteRgbChange,
              Math.abs(recovered.redBlueShift),
            );
          },
          {
            timeout: 30000,
            message:
              "the same flower pixels must recover the botanical palette",
          },
        )
        .toBeLessThan(8);
      await expect(palette).toHaveValue("botanical");
      expect(
        await canvas.evaluate(
          (current, original) => current === original,
          retainedCanvas,
        ),
      ).toBe(true);
      expect(
        await canvas.evaluate((node) =>
          (node as HTMLCanvasElement).getContext("webgl2")?.isContextLost(),
        ),
      ).toBe(false);
      await expect(page.locator('[data-renderer="unavailable"]')).toHaveCount(
        0,
      );
      await expectRenderedFlower(canvas, 0.004);
      await healthy();
    } finally {
      if (coralPng)
        await info.attach("torenia-coral-upper-fan", {
          body: coralPng,
          contentType: "image/png",
        });
      if (recoveredPng)
        await info.attach("torenia-restored-upper-fan", {
          body: recoveredPng,
          contentType: "image/png",
        });
      await info.attach("torenia-upper-fan-color-measurements", {
        body: Buffer.from(JSON.stringify({ baseline, coral, recovered })),
        contentType: "application/json",
      });
      await retainedCanvas.dispose();
    }
  });
}
