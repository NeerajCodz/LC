import test from "node:test";
import assert from "node:assert/strict";
import { createSpecimenMaterial } from "../lib/three/specimenMaterials";
import type { Color, WebGLRenderer } from "three";

test("optional tissue channels isolate shader programs without changing existing defaults", () => {
  const plain = createSpecimenMaterial("rose", "petal"),
    inner = createSpecimenMaterial("rose", "petal", undefined, "inner");
  assert.equal(plain.customProgramCacheKey(), "specimen-rose-petal-v1");
  assert.notEqual(plain.customProgramCacheKey(), inner.customProgramCacheKey());
  assert.equal(plain.roughness, inner.roughness);
  plain.dispose();
  inner.dispose();
});
test("leaf pigment does not inherit the dark petal root gradient across palmate lobes", () => {
  const leaf = createSpecimenMaterial("hellebore", "bract", "#587864", "leaf");
  // Only the shader fields read by this callback are needed for the pigment probe.
  const shader = {
    uniforms: {},
    vertexShader: "#include <common>\n#include <begin_vertex>",
    fragmentShader:
      "#include <common>\n#include <color_fragment>\n#include <roughnessmap_fragment>",
  } as unknown as Parameters<typeof leaf.onBeforeCompile>[0];
  leaf.onBeforeCompile(shader, {} as WebGLRenderer);
  const root = shader.uniforms.uPigmentRoot.value as Color,
    body = shader.uniforms.uPigmentBody.value as Color;
  assert.ok(root.equals(body));
  leaf.dispose();
});
