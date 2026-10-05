import { chromium, webkit, devices } from "@playwright/test";
import { captureRenderingCost } from "../tests/browser/render-costs";

// Run against an already started port-1607 server; each sample owns a fresh page.
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
        const page = await browser.newPage(
          target === "mobile"
            ? devices["iPhone 13"]
            : { viewport: { width: 1600, height: 1000 } },
        );
        const errors: string[] = [];
        page.setDefaultTimeout(120000);
        page.on("pageerror", (e) => errors.push(e.message));
        await page.addInitScript(() =>
          Object.defineProperty(navigator, "gpu", {
            value: undefined,
            configurable: true,
          }),
        );
        await page.goto(`http://localhost:1607/flower/${slug}/`);
        process.stderr.write(`${target} ${slug}: loaded\n`);
        await page.bringToFront();
        const canvas = page.locator(".flower-canvas canvas");
        await canvas.waitFor({ state: "visible" });
        process.stderr.write(
          `${target} ${slug}: visible ${await canvas.getAttribute("data-render-frames")}\n`,
        );
        for (const view of ["specimen", "macro"]) {
          if (view === "macro")
            await page
              .getByRole("button", { name: "Explore close-up", exact: true })
              .click();
          const cost = await captureRenderingCost(canvas);
          const sample = { target, slug, view, ...cost, errors: [...errors] };
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
          "Playwright emulation; drawn frames include solver, texture transfer and rendering; optional WebGPU disabled",
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
