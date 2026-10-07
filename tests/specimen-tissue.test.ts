import test from "node:test";
import assert from "node:assert/strict";
import { createSpecimenMaterial } from "../lib/three/specimenMaterials";

test("optional tissue channels isolate shader programs without changing existing defaults", () => {
  const plain = createSpecimenMaterial("rose", "petal"),
    inner = createSpecimenMaterial("rose", "petal", undefined, "inner");
  assert.equal(plain.customProgramCacheKey(), "specimen-rose-petal-v1");
  assert.notEqual(plain.customProgramCacheKey(), inner.customProgramCacheKey());
  assert.equal(plain.roughness, inner.roughness);
  plain.dispose();
  inner.dispose();
});
