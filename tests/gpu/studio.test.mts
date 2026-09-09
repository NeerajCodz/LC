import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { DataUtils } from "three";
import { init } from "vgpu/node";
import { renderStudio } from "../../lib/gpu/render-studio";
import { studioRadiance } from "../../lib/gpu/studio-field";

test("vgpu HDR lighting preserves radiance and matches the WebGL fallback", async () => {
  const gpu = await init();
  try {
    const source = await readFile(
      "lib/gpu/shaders/studio-lighting.wgsl",
      "utf8",
    );
    const width = 256,
      height = 128;
    const pixels = await renderStudio(gpu, source, width, height);
    assert.equal(pixels.length, width * height * 4);
    let peak = 0;
    for (let y = 0; y < height; y++)
      for (let x = 0; x < width; x++) {
        const expected = studioRadiance((x + 0.5) / width, (y + 0.5) / height);
        for (let channel = 0; channel < 3; channel++) {
          const value = DataUtils.fromHalfFloat(
            pixels[(y * width + x) * 4 + channel],
          );
          assert.ok(Number.isFinite(value) && value > 0);
          assert.ok(
            Math.abs(value - expected[channel]) < 0.005,
            `Radiance mismatch at ${x},${y},${channel}`,
          );
          peak = Math.max(peak, value);
        }
        assert.equal(
          DataUtils.fromHalfFloat(pixels[(y * width + x) * 4 + 3]),
          1,
        );
      }
    assert.ok(peak > 3, "HDR highlights must survive without clipping to 1");
  } finally {
    gpu.dispose();
  }
});
