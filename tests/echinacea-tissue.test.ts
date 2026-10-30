import test from "node:test";
import assert from "node:assert/strict";
import { Color, ShaderLib, type WebGLRenderer } from "three";
import { ECHINACEA_MODEL } from "../components/flowers/echinacea/echinaceaGeometry";
import { createSpecimenMaterial } from "../lib/three/specimenMaterials";

test("the actual Echinacea receptacle has brown tissue independently of its green phyllaries", () => {
  const cone = ECHINACEA_MODEL.surfaces.find(
    (surface) => surface.name === "conical receptacle",
  )!;
  const phyllary = ECHINACEA_MODEL.surfaces.find(
    (surface) => surface.name === "lanceolate involucral phyllary",
  )!;
  const materials = [cone, phyllary].map((surface) =>
    createSpecimenMaterial(
      "echinacea",
      surface.role,
      undefined,
      surface.tissue,
    ),
  );
  try {
    const colors = materials.map((material) => {
      const shader = {
        uniforms: {},
        vertexShader: ShaderLib.physical.vertexShader,
        fragmentShader: ShaderLib.physical.fragmentShader,
      } as unknown as Parameters<typeof material.onBeforeCompile>[0];
      material.onBeforeCompile(shader, {} as WebGLRenderer);
      return shader.uniforms.uPigmentBody.value as Color;
    });
    const [brown, green] = colors;
    assert.ok(
      brown.r > brown.g && brown.g > brown.b,
      "the cone must not inherit green calyx pigment",
    );
    assert.ok(
      green.g > green.r && green.g > green.b,
      "true phyllaries retain green tissue",
    );
  } finally {
    materials.forEach((material) => material.dispose());
  }
});
