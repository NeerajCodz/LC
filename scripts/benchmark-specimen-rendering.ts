import { chromium, webkit, devices, expect } from "@playwright/test";
import { captureRenderingCost } from "../tests/browser/render-costs";
import { expectRenderedFlower } from "../tests/browser/pixel-content";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import { FLOWER_TYPES, type FlowerType } from "../lib/flowers/types";

// One fresh page per species/device, with warmed specimen and macro samples.
const species = (process.argv[2] ?? "rose,carnation,foxglove").split(",");
const targets = (process.argv[3] ?? "desktop,mobile").split(",");
async function main() {
  const results = [];
  for (const target of targets) {
    const browser =
      target === "mobile"
        ? await webkit.launch()
        : await chromium.launch({
            channel: process.env.PLAYWRIGHT_CHANNEL ?? "chrome",
          });
    try {
      for (const slug of species) {
        if (!FLOWER_TYPES.includes(slug as FlowerType))
          throw new Error(`Unknown specimen: ${slug}`);
        const expectedDetailed =
          FLOWER_STRUCTURES[slug as FlowerType].simulatedSurfaces === true;
        const page = await browser.newPage(
          target === "mobile"
            ? devices["iPhone 13"]
            : { viewport: { width: 1600, height: 1000 } },
        );
        const errors: string[] = [];
        // tsx preserves local callback names using this helper; evaluated browser
        // callbacks do not inherit the Node module's compiler-generated scope.
        await page.addInitScript(
          "globalThis.__name = (target, value) => Object.defineProperty(target, 'name', { value, configurable: true });",
        );
        await page.emulateMedia({ reducedMotion: "no-preference" });
        page.setDefaultTimeout(120000);
        page.on("pageerror", (e) => errors.push(e.message));
        page.on("console", (message) => {
          if (
            message.type() === "error" &&
            /shader|WebGLProgram/.test(message.text())
          )
            errors.push(message.text());
        });
        await page.addInitScript(() =>
          Object.defineProperty(navigator, "gpu", {
            value: undefined,
            configurable: true,
          }),
        );
        const loaded = performance.now();
        await page.goto(`http://localhost:1607/flower/${slug}/`);
        process.stderr.write(`${target} ${slug}: loaded\n`);
        await page.bringToFront();
        const canvas = page.locator(".flower-canvas canvas");
        await canvas.waitFor({ state: "visible" });
        process.stderr.write(
          `${target} ${slug}: visible ${await canvas.getAttribute("data-render-frames")}\n`,
        );
        await expect
          .poll(
            async () => Number(await canvas.getAttribute("data-render-frames")),
            { timeout: 120000 },
          )
          .toBeGreaterThanOrEqual(30);
        const startupTo30FramesMs = performance.now() - loaded;
        for (const view of ["specimen", "macro"]) {
          if (view === "macro")
            await page
              .getByRole("button", { name: "Explore close-up", exact: true })
              .click();
          await expectRenderedFlower(canvas, 0.007);
          const cost = await captureRenderingCost(canvas);
          expect(cost.contextLost).toBe(false);
          expect(errors).toEqual([]);
          expect(Number.isFinite(cost.fps) && cost.fps > 0).toBe(true);
          expect(cost.budget).toBe(target === "mobile" ? "mobile" : "desktop");
          expect(cost.tissue).toBe("webgl");
          expect(cost.lighting).toBe("webgl");
          if (expectedDetailed) {
            expect(cost.physics).toBe("detailed");
            expect(cost.nodes).toBeGreaterThan(0);
            expect(cost.nodes).toBeLessThanOrEqual(
              target === "mobile" ? 512 : 2048,
            );
            expect(cost.solverSteps).toBeGreaterThan(0);
            expect(cost.solverStepDelta).toBeGreaterThan(0);
          }
          const sample = {
            target,
            slug,
            view,
            ...cost,
            warmPageElapsedMs: performance.now() - loaded,
            startupTo30FramesMs,
            errors: [...errors],
          };
          results.push(sample);
          process.stderr.write(
            `${target} ${slug} ${view}: ${cost.fps.toFixed(1)} FPS, solver ${cost.solverMeanMs} ms\n`,
          );
        }
        await page.close();
      }
    } finally {
      await browser.close();
    }
  }
  console.log(
    JSON.stringify(
      {
        timestamp: new Date().toISOString(),
        scope:
          "Playwright emulation; approximate R3F advance cadence through 30-frame bins and 50ms polling/RPC; each view warms at least 60 new advances then samples 120; live solver/CPU texture preparation counters become EWMA after 60 calls and carry across views; optional WebGPU disabled",
        results,
      },
      null,
      2,
    ),
  );
}
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
