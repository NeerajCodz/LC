import { expect, test } from "@playwright/test";

// A raw WebGL 2 control distinguishes native presentation failures from our
// geometry, shader and render-loop changes. Windows WebKit 2359 loses this
// display buffer after resize (playwright#42885); fixed WebKit must keep it red.
test("native WebGL presentation survives drawing-buffer resize", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 664 });
  await page.setContent(
    '<meta name="viewport" content="width=device-width,initial-scale=1"><body style="margin:0"><canvas></canvas></body>',
  );
  await page.evaluate(() => {
    const canvas = document.querySelector("canvas")!;
    const gl = canvas.getContext("webgl2")!;
    const resize = () => {
      canvas.width = innerWidth;
      canvas.height = innerHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
      canvas.dataset.frames = "0";
    };
    addEventListener("resize", resize);
    resize();
    const frame = () => {
      gl.clearColor(1, 0, 0, 1);
      gl.clear(gl.COLOR_BUFFER_BIT);
      canvas.dataset.frames = String(Number(canvas.dataset.frames) + 1);
      requestAnimationFrame(frame);
    };
    frame();
  });
  for (const height of [664, 844]) {
    await page.setViewportSize({ width: 390, height });
    await expect
      .poll(() =>
        page.locator("canvas").evaluate((canvas) => ({
          height: (canvas as HTMLCanvasElement).height,
          drawn: Number(canvas.dataset.frames) >= 3,
        })),
      )
      .toEqual({ height, drawn: true });
    const png = await page.screenshot();
    const center = await page.evaluate(async (encoded) => {
      const image = new Image();
      image.src = `data:image/png;base64,${encoded}`;
      await image.decode();
      const probe = document.createElement("canvas");
      probe.width = image.width;
      probe.height = image.height;
      const context = probe.getContext("2d")!;
      context.drawImage(image, 0, 0);
      return Array.from(
        context.getImageData(probe.width >> 1, probe.height >> 1, 1, 1).data,
      );
    }, png.toString("base64"));
    expect(center).toEqual([255, 0, 0, 255]);
  }
});
