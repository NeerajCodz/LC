import assert from "node:assert/strict";
import test from "node:test";
import { createTissueFallback } from "../lib/gpu/tissue-fallback";
import { prepareTissueAtlas, tissueUniforms } from "../lib/gpu/tissue-atlas";

test("fallback pixels are deterministic, opaque, and retain all three tissue scales", () => {
  const pixels = createTissueFallback(32);
  assert.deepEqual(pixels, createTissueFallback(32));
  assert.equal(pixels.length, 32 * 32 * 4);
  for (let i = 3; i < pixels.length; i += 4) assert.equal(pixels[i], 255);
  for (let channel = 0; channel < 3; channel++) {
    const values = new Set(pixels.filter((_, i) => i % 4 === channel));
    assert.ok(
      values.size > 100,
      `channel ${channel} lost its tissue variation`,
    );
  }
});

test("fallback allocation rejects invalid or unbounded sizes", () => {
  for (const size of [0, -1, 1.5, Infinity, 2048])
    assert.throws(() => createTissueFallback(size), RangeError);
});

test("WebGL prepares one shared sampled atlas without a WebGPU adapter", async () => {
  const original = tissueUniforms.uTissueAtlas.value;
  const first = prepareTissueAtlas();
  assert.equal(prepareTissueAtlas(), first);
  assert.equal(await first, "webgl");
  assert.equal(tissueUniforms.uTissueAtlas.value, original);
  assert.equal(tissueUniforms.uTissueReady.value, true);
  assert.equal(original.image.width, 512);
  assert.equal(original.image.height, 512);
  assert.deepEqual(original.image.data, createTissueFallback(512));
});
