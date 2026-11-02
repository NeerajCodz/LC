import test from "node:test";
import assert from "node:assert/strict";
import { ShaderLib, Vector3, Color, type WebGLRenderer } from "three";
import { createSpecimenMaterial } from "../lib/three/specimenMaterials";
import { specimenGeometry } from "../lib/three/specimenModel";
import { DATURA_MODEL } from "../components/flowers/datura/daturaGeometry";
import { GREVILLEA_MODEL } from "../components/flowers/grevillea/grevilleaGeometry";
import { CALCEOLARIA_MODEL } from "../components/flowers/calceolaria/calceolariaGeometry";

test("calceolaria: the advancing pouch labels its physical outside and lumen correctly", () => {
  const surface = CALCEOLARIA_MODEL.surfaces.find((s) => s.role === "tube")!,
    geometry = specimenGeometry(surface, "low"),
    side = geometry.getAttribute("tissueSide");
  try {
    for (const positions of [
      geometry.getAttribute("position"),
      geometry.morphAttributes.position![0],
    ]) {
      const half = positions.count / 2;
      for (let row = 0; row <= 16; row++) {
        const index = row * 12;
        assert.ok(positions.getX(index) > positions.getX(index + half));
        assert.equal(side.getX(index), 1);
        assert.equal(side.getX(index + half), -1);
      }
    }
  } finally {
    geometry.dispose();
  }
});
test("allium papery spathe is drier and less coated than its flower tissue", () => {
  const petal = createSpecimenMaterial("allium", "petal"),
    spathe = createSpecimenMaterial("allium", "bract", undefined, "disc");
  try {
    assert.ok(spathe.roughness > petal.roughness);
    assert.equal(spathe.clearcoat, 0);
  } finally {
    petal.dispose();
    spathe.dispose();
  }
});
for (const type of [
  "trillium",
  "datura",
  "allium",
  "grevillea",
  "calceolaria",
] as const)
  test(`${type}: species tissue reaches the shared atlas normal and pigment program`, () => {
    const m = createSpecimenMaterial(type, "petal");
    try {
      const s = {
        uniforms: {},
        vertexShader: ShaderLib.physical.vertexShader,
        fragmentShader: ShaderLib.physical.fragmentShader,
      } as unknown as Parameters<typeof m.onBeforeCompile>[0];
      m.onBeforeCompile(s, {} as WebGLRenderer);
      assert.ok(Number.isInteger(s.uniforms.uSpecimenKind?.value));
      const relief = s.uniforms.uSpecimenRelief?.value as Vector3;
      assert.ok(
        relief instanceof Vector3 &&
          relief.x > 0 &&
          relief.y > 0 &&
          relief.x < 0.0005,
      );
      assert.match(s.fragmentShader, /fwidth\(/);
      assert.ok(s.uniforms.uPigmentBody.value instanceof Color);
    } finally {
      m.dispose();
    }
  });
test("datura: the physical outer tube skin is labeled exterior, in both bloom endpoints", () => {
  const surface = DATURA_MODEL.surfaces.find((s) => s.role === "tube")!,
    g = specimenGeometry(surface, "high"),
    p = g.getAttribute("position"),
    f = g.morphAttributes.position![0],
    side = g.getAttribute("tissueSide"),
    half = p.count / 2;
  try {
    for (const a of [p, f])
      for (let i = 0; i < half; i++) {
        const r1 = Math.hypot(a.getX(i), a.getZ(i)),
          r2 = Math.hypot(a.getX(i + half), a.getZ(i + half));
        assert.equal(side.getX(r1 > r2 ? i : i + half), 1);
        assert.equal(side.getX(r1 > r2 ? i + half : i), -1);
      }
  } finally {
    g.dispose();
  }
});
test("grevillea: cream tips belong to the four perianth walls rather than duplicate overlays", () => {
  for (let c = 1; c < GREVILLEA_MODEL.clusters.length; c++)
    assert.equal(
      GREVILLEA_MODEL.surfaces.filter((s) => s.cluster === c).length,
      4,
    );
});
