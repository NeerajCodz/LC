import {
  expectInspectionLoaded,
  expectInspectionReady,
} from "./inspection-ready";
import { test, expect, devices } from "@playwright/test";
import { CYMES_AND_SPIKES, observeRendering } from "./cymes-and-spikes-cases";
import { expectRenderedFlower, expectScreenshotFlower } from "./pixel-content";
import { boundedDpr } from "../../lib/performance";

// Wide inspection sheets keep compositor captures at CSS resolution.
test.use({ deviceScaleFactor: 1 });

// The isolated runner lists with DEV_INSPECTION=1 and separates inspection files.
// Production discovery creates no development cases and therefore no skipped cases.
if (process.env.DEV_INSPECTION === "1") {
  test("inspection starts at the device tier before manual overrides", async ({
    page,
    browserName,
  }, info) => {
    test.setTimeout(180000);
    await page.setViewportSize({ width: 1600, height: 1100 });
    const healthy = await observeRendering(page),
      constrained = info.project.name === "mobile",
      low = ["low", "low", "low", "medium", "low", "low", "low"],
      high = ["high", "high", "high", "ultra", "high", "high", "high"];
    await page.addInitScript(() => {
      const observed = window as typeof window & {
        __inspectionFirstQualities: string[] | null;
        __inspectionDesktopBeforeChoice: boolean;
        __inspectionManualChoice: boolean;
      };
      observed.__inspectionFirstQualities = null;
      observed.__inspectionDesktopBeforeChoice = false;
      observed.__inspectionManualChoice = false;
      const record = () => {
        if (observed.__inspectionManualChoice) {
          observer.disconnect();
          return;
        }
        const views = document.querySelectorAll("[data-inspection-view]");
        if (views.length !== 7) return;
        const qualities = Array.from(views, (view) =>
          view.getAttribute("data-inspection-quality"),
        );
        if (qualities.some((quality) => quality === null)) return;
        observed.__inspectionFirstQualities ??= qualities as string[];
        observed.__inspectionDesktopBeforeChoice ||= qualities.some(
          (quality) => quality === "high" || quality === "ultra",
        );
      };
      const observer = new MutationObserver(record);
      observer.observe(document, {
        childList: true,
        subtree: true,
        attributes: true,
        attributeFilter: ["data-inspection-quality"],
      });
      record();
    });
    await page.goto("/dev/inspection/");
    await expectInspectionLoaded(page);
    const tier = page.getByRole("combobox", {
        name: "Inspection device tier",
        exact: true,
      }),
      qualities = () =>
        page
          .locator("[data-inspection-view]")
          .evaluateAll((views) =>
            views.map((view) => view.getAttribute("data-inspection-quality")),
          );
    await expect(page.locator("[data-inspection-view]")).toHaveCount(7);
    if (constrained) {
      expect(
        await page.evaluate(
          () =>
            (
              window as typeof window & {
                __inspectionFirstQualities: string[] | null;
              }
            ).__inspectionFirstQualities,
        ),
      ).toEqual(low);
      expect(
        await page.evaluate(
          () =>
            (
              window as typeof window & {
                __inspectionDesktopBeforeChoice: boolean;
              }
            ).__inspectionDesktopBeforeChoice,
        ),
      ).toBe(false);
    }
    await expect(tier).toHaveValue(constrained ? "constrained" : "standard");
    await expect.poll(qualities).toEqual(constrained ? low : high);
    await expectInspectionReady(page);
    await expectRenderedFlower(page.locator("canvas"), 0.004);
    const native = await page.locator("canvas").evaluate((node) => {
      const canvas = node as HTMLCanvasElement,
        rect = canvas.getBoundingClientRect(),
        context = canvas.getContext("webgl2");
      return {
        deviceScaleFactor: devicePixelRatio,
        cssWidth: rect.width,
        cssHeight: rect.height,
        width: canvas.width,
        height: canvas.height,
        drawingBufferWidth: context?.drawingBufferWidth,
        drawingBufferHeight: context?.drawingBufferHeight,
        budget: canvas.dataset.renderBudget,
        contextLost: context?.isContextLost(),
        userAgent: navigator.userAgent,
        touch: "ontouchstart" in window,
        maxTouchPoints: navigator.maxTouchPoints,
        coarsePointer: matchMedia("(pointer: coarse)").matches,
      };
    });
    const dpr = boundedDpr(
        1600,
        1100,
        1,
        constrained,
        constrained ? 4096 : 8192,
      ),
      expectedWidth = Math.floor(1600 * dpr),
      expectedHeight = Math.floor(1100 * dpr);
    expect(native.deviceScaleFactor).toBe(1);
    expect(native.cssWidth).toBe(1600);
    expect(native.cssHeight).toBe(1100);
    expect(native.width).toBe(expectedWidth);
    expect(native.height).toBe(expectedHeight);
    expect(native.drawingBufferWidth).toBe(expectedWidth);
    expect(native.drawingBufferHeight).toBe(expectedHeight);
    expect(native.budget).toBe(constrained ? "mobile" : "desktop");
    expect(native.contextLost).toBe(false);
    let trustedTouch: { isTrusted: boolean; touchesLength: number } | null =
      null;
    if (constrained) {
      expect(browserName).toBe("webkit");
      expect(native.userAgent).toBe(devices["iPhone 13"].userAgent);
      expect(native.touch).toBe(true);
      expect(native.coarsePointer).toBe(true);
      const heading = page.getByRole("heading", {
        name: "Geometry inspection",
        exact: true,
      });
      await heading.evaluate((node) => {
        const observed = window as typeof window & {
          __inspectionTrustedTouch: {
            isTrusted: boolean;
            touchesLength: number;
          } | null;
        };
        observed.__inspectionTrustedTouch = null;
        node.addEventListener(
          "touchstart",
          (event) => {
            const touch = event as TouchEvent;
            observed.__inspectionTrustedTouch = {
              isTrusted: touch.isTrusted,
              touchesLength: touch.touches.length,
            };
          },
          { once: true },
        );
      });
      const bounds = await heading.boundingBox();
      if (!bounds) throw new Error("Inspection heading has no touch bounds");
      await page.touchscreen.tap(
        bounds.x + bounds.width / 2,
        bounds.y + bounds.height / 2,
      );
      trustedTouch = await page.evaluate(
        () =>
          (
            window as typeof window & {
              __inspectionTrustedTouch: {
                isTrusted: boolean;
                touchesLength: number;
              } | null;
            }
          ).__inspectionTrustedTouch,
      );
    }
    await info.attach("inspection-native-profile", {
      body: Buffer.from(
        JSON.stringify({ ...native, browserName, trustedTouch }),
      ),
      contentType: "application/json",
    });
    if (constrained)
      expect(trustedTouch).toEqual({ isTrusted: true, touchesLength: 1 });
    await page.evaluate(() => {
      (
        window as typeof window & { __inspectionManualChoice: boolean }
      ).__inspectionManualChoice = true;
    });
    // Both choices are explicit: an unconstrained desktop can request low,
    // and a constrained device can deliberately request standard geometry.
    await tier.selectOption("standard");
    await expect(tier).toHaveValue("standard");
    await expect.poll(qualities).toEqual(high);
    await tier.selectOption("constrained");
    await expect(tier).toHaveValue("constrained");
    await expect.poll(qualities).toEqual(low);
    await tier.selectOption(constrained ? "constrained" : "standard");
    await expect.poll(qualities).toEqual(constrained ? low : high);
    await expectInspectionReady(page);
    await expectRenderedFlower(page.locator("canvas"), 0.004);
    await healthy();
  });

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

  for (const slug of ["fritillaria", "hoya", "torenia"] as const)
    for (const detail of ["specimen", "overview"] as const)
      test(`${slug}: targeted ${detail} anatomy inspection`, async ({
        page,
      }, info) => {
        test.setTimeout(180000);
        await page.setViewportSize({ width: 1600, height: 1100 });
        const healthy = await observeRendering(page),
          constrained = info.project.name === "mobile";
        await page.goto("/dev/inspection/");
        await expectInspectionLoaded(page);
        await expect(page.locator("[data-inspection-view]")).toHaveCount(7);
        // Geometry choice is independent from the real renderer's device budget.
        await expect(
          page.getByRole("combobox", {
            name: "Inspection device tier",
            exact: true,
          }),
        ).toHaveValue(constrained ? "constrained" : "standard");
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
        await expectInspectionReady(page);
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
        await expectInspectionReady(page);
        await expectRenderedFlower(canvas, 0.004);
        await healthy();
      });
}
