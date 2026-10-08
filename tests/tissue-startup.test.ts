import assert from "node:assert/strict";
import test from "node:test";
import { createPetalMaterial } from "../lib/three/materials";
import { tissueUniforms } from "../lib/gpu/tissue-atlas";
import { createTissueFallback } from "../lib/gpu/tissue-fallback";

test("the first floral material has complete shared tissue before any asynchronous bake", () => {
  const texture = tissueUniforms.uTissueAtlas.value;
  const a = createPetalMaterial("#ff6688", 0.7, 0.2);
  assert.equal(tissueUniforms.uTissueReady.value, true);
  assert.ok(texture.image.width >= 512);
  assert.deepEqual(
    texture.image.data,
    createTissueFallback(texture.image.width),
  );
  const field = texture.image.data;
  const b = createPetalMaterial("#ffeecc", 0.5, 0.1);
  assert.equal(tissueUniforms.uTissueAtlas.value, texture);
  assert.equal(texture.image.data, field);
  a.dispose();
  b.dispose();
});
