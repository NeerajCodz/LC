import { expect, type Page, type TestInfo } from "@playwright/test";

/** Detect a stray yellow guide on the dorsal bud body in the native compositor PNG. */
export async function expectNoToreniaBudPigmentSeam(
  page: Page,
  png: Buffer,
  info: TestInfo,
  detail: string,
) {
  const measurement = await page.evaluate(async (encoded) => {
    const image = new Image();
    const loaded = new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new Error("Torenia bud PNG decode failed"));
    });
    image.src = `data:image/png;base64,${encoded}`;
    await loaded;
    const width = image.naturalWidth,
      height = image.naturalHeight,
      canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { willReadFrequently: true })!;
    // Preserve native pixels: rescaling can erase this one-pixel-wide defect.
    context.drawImage(image, 0, 0);
    const background = context.getImageData(0, 0, 1, 1).data,
      left = Math.floor(width * 0.22),
      top = Math.floor(height * 0.47),
      right = Math.floor(width * 0.55),
      bottom = Math.floor(height * 0.52),
      roiWidth = right - left,
      roiHeight = bottom - top,
      pixels = context.getImageData(left, top, roiWidth, roiHeight).data;
    let yellowPixels = 0,
      tissuePixels = 0,
      minimumX = width,
      minimumY = height,
      maximumX = -1,
      maximumY = -1;
    for (let i = 0; i < pixels.length; i += 4) {
      const r = pixels[i],
        g = pixels[i + 1],
        b = pixels[i + 2];
      if (!pixels[i + 3]) continue;
      if (
        Math.abs(r - background[0]) +
          Math.abs(g - background[1]) +
          Math.abs(b - background[2]) >
        65
      )
        tissuePixels++;
      // Neutral/lilac tissue and green calyx do not satisfy this yellow hue.
      // The real ventral yellow guide lies below this dorsal/midbody region.
      if (r > 100 && g > 80 && b < g * 0.55 && r > g) {
        yellowPixels++;
        const pixel = i / 4,
          x = left + (pixel % roiWidth),
          y = top + Math.floor(pixel / roiWidth);
        minimumX = Math.min(minimumX, x);
        minimumY = Math.min(minimumY, y);
        maximumX = Math.max(maximumX, x);
        maximumY = Math.max(maximumY, y);
      }
    }
    const sampledPixels = roiWidth * roiHeight;
    return {
      width,
      height,
      roi: { left, top, right, bottom },
      sampledPixels,
      tissuePixels,
      tissueFraction: tissuePixels / sampledPixels,
      yellowPixels,
      yellowBounds: yellowPixels
        ? { left: minimumX, top: minimumY, right: maximumX, bottom: maximumY }
        : null,
    };
  }, png.toString("base64"));
  await info.attach("torenia-bud-seam-pixels", {
    body: Buffer.from(
      JSON.stringify(
        { project: info.project.name, detail, ...measurement },
        null,
        2,
      ),
    ),
    contentType: "application/json",
  });
  expect(
    measurement.width,
    "the fixture must retain its native wide tile",
  ).toBeGreaterThanOrEqual(600);
  expect(
    measurement.height,
    "the fixture must retain its native study height",
  ).toBeGreaterThanOrEqual(500);
  expect(
    measurement.tissueFraction,
    "most of the sampled region must contain rendered bud tissue",
  ).toBeGreaterThan(0.5);
  expect(
    measurement.yellowPixels,
    "yellow pigment must not form a zipper on the dorsal bud body",
  ).toBeLessThanOrEqual(2);
}
