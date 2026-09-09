import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { init } from "vgpu/node";
import { renderTissue } from "../../lib/gpu/render-tissue";

function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + 93) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) & 0x00ffffff) / 16777215;
}
function noise(x: number, y: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y);
  const fx = x - ix,
    fy = y - iy;
  const wx = fx * fx * (3 - 2 * fx),
    wy = fy * fy * (3 - 2 * fy);
  const mix = (a: number, b: number, w: number) => a * (1 - w) + b * w;
  return mix(
    mix(hash(ix, iy), hash(ix + 1, iy), wx),
    mix(hash(ix, iy + 1), hash(ix + 1, iy + 1), wx),
    wy,
  );
}

test("real vgpu tissue pixels match the WebGL field at all three detail scales", async () => {
  const source = await readFile("lib/gpu/shaders/petal-tissue.wgsl", "utf8");
  const gpu = await init();
  try {
    const size = 1024;
    const pixels = await renderTissue(gpu, source, size);
    const repeated = await renderTissue(gpu, source, size);
    assert.deepEqual(repeated, pixels, "the bake is deterministic");
    for (let y = 0; y < size; y += 37) {
      for (let x = 0; x < size; x += 37) {
        const u = (x + 0.5) / size,
          v = (y + 0.5) / size;
        const expected = [
          noise(u * 8, v * 8),
          noise(u * 11, v * 18),
          noise(u * 340, v * 340),
        ];
        expected.forEach((value, channel) => {
          assert.ok(
            Math.abs(pixels[(y * size + x) * 4 + channel] - value * 255) < 1.1,
            `UV ${u},${v}, channel ${channel} differs from the field reference`,
          );
        });
        assert.equal(pixels[(y * size + x) * 4 + 3], 255);
      }
    }
  } finally {
    gpu.dispose();
  }
});
