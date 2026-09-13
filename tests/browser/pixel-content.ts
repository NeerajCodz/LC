import { expect, type Locator } from "@playwright/test";

/** Read a tiny copy immediately after drawing; UI text cannot satisfy this check. */
export async function expectRenderedFlower(canvas: Locator) {
  await expect
    .poll(
      async () =>
        canvas.evaluate(async (node) => {
          const source = node as HTMLCanvasElement;
          const probe = document.createElement("canvas");
          probe.width = probe.height = 64;
          const context = probe.getContext("2d", { willReadFrequently: true })!;
          return new Promise<number>((resolve) => {
            let frames = 0,
              maximum = 0;
            const sample = () => {
              context.clearRect(0, 0, 64, 64);
              context.drawImage(source, 0, 0, 64, 64);
              const pixels = context.getImageData(0, 0, 64, 64).data;
              let contrasting = 0;
              for (let i = 4; i < pixels.length; i += 4) {
                if (
                  pixels[i + 3] > 0 &&
                  Math.abs(pixels[i] - pixels[0]) +
                    Math.abs(pixels[i + 1] - pixels[1]) +
                    Math.abs(pixels[i + 2] - pixels[2]) >
                    65
                )
                  contrasting++;
              }
              maximum = Math.max(maximum, contrasting / (64 * 64));
              if (++frames >= 8) resolve(maximum);
              else requestAnimationFrame(sample);
            };
            requestAnimationFrame(sample);
          });
        }),
      {
        timeout: 20000,
        message:
          "The canvas must contain rendered flower pixels, not just a live frame counter",
      },
    )
    .toBeGreaterThan(0.04);
}
