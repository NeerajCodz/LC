import test from "node:test";
import assert from "node:assert/strict";
import { createSpecimenMaterial } from "../lib/three/specimenMaterials";
import { Color, ShaderLib, type WebGLRenderer } from "three";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { createBotanicalBladeMaterial } from "../lib/three/botanicalBladeMaterial";
import type { SpecimenSurface } from "../lib/three/specimenModel";
import { TISSUE_RESPONSE } from "../lib/three/specimenTissue";

function compile(material: ReturnType<typeof createSpecimenMaterial>) {
  const shader = {
    uniforms: {},
    vertexShader: ShaderLib.physical.vertexShader,
    fragmentShader: ShaderLib.physical.fragmentShader,
  } as unknown as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as WebGLRenderer);
  return shader;
}

test("new specimen tissue programs depend on shader source rather than organ labels", () => {
  const sources = new Map<
    string,
    { vertexShader: string; fragmentShader: string }
  >();
  const roles: SpecimenSurface["role"][] = [
    "petal",
    "tube",
    "calyx",
    "bract",
    "banner",
    "wing",
    "keel",
  ];
  const tissues: SpecimenSurface["tissue"][] = [
    undefined,
    "inner",
    "guide",
    "disc",
    "leaf",
  ];
  for (const type of FLOWER_TYPES.filter((t) => TISSUE_RESPONSE[t])) {
    for (const role of roles)
      for (const tissue of tissues) {
        const material = createSpecimenMaterial(type, role, "#9aaa76", tissue);
        const shader = compile(material),
          key = material.customProgramCacheKey();
        const reference = sources.get(key);
        if (reference) {
          assert.equal(shader.vertexShader, reference.vertexShader, key);
          assert.equal(shader.fragmentShader, reference.fragmentShader, key);
        } else sources.set(key, shader);
        material.dispose();
      }
  }
  // Uniform-driven floral tissue, shared base tissue and bicolored calyx.
  assert.equal(sources.size, 3);
  const kinds = new Set<number>();
  for (const type of FLOWER_TYPES.filter((t) => TISSUE_RESPONSE[t])) {
    const material = createSpecimenMaterial(type, "petal");
    const shader = compile(material);
    kinds.add(shader.uniforms.uSpecimenKind.value);
    assert.equal(
      shader.uniforms.uSpecimenScatter.value,
      TISSUE_RESPONSE[type].scatter,
    );
    material.dispose();
  }
  assert.equal(kinds.size, Object.keys(TISSUE_RESPONSE).length);
  const marked = createSpecimenMaterial(
    "snowdrop",
    "petal",
    undefined,
    "inner",
  );
  const plain = createSpecimenMaterial("snowdrop", "petal");
  const a = compile(marked),
    b = compile(plain);
  assert.equal(a.uniforms.uSpecimenKind.value, b.uniforms.uSpecimenKind.value);
  assert.notEqual(
    a.uniforms.uSpecimenRegion.value,
    b.uniforms.uSpecimenRegion.value,
  );
  marked.dispose();
  plain.dispose();
});

test("identical calyx shaders share a program while bicolored zinnia remains distinct", () => {
  const reference = createSpecimenMaterial("hellebore", "calyx");
  const source = compile(reference);
  for (const type of FLOWER_TYPES) {
    const material = createSpecimenMaterial(type, "calyx");
    const shader = compile(material);
    assert.equal(shader.vertexShader, source.vertexShader);
    if (type === "zinnia") {
      assert.notEqual(shader.fragmentShader, source.fragmentShader);
      assert.notEqual(
        material.customProgramCacheKey(),
        reference.customProgramCacheKey(),
      );
    } else {
      assert.equal(shader.fragmentShader, source.fragmentShader, type);
      assert.equal(
        material.customProgramCacheKey(),
        reference.customProgramCacheKey(),
        type,
      );
    }
    material.dispose();
  }
  reference.dispose();
});

test("leaf programs share venation code while retaining independent pigment uniforms", () => {
  for (const venation of ["parallel", "palmate", "pinnate"] as const) {
    const first = createBotanicalBladeMaterial("hellebore", {
      color: "#587864",
      underside: "#78987a",
      vein: "#9aaa76",
      roughness: 0.72,
      venation,
    });
    const second = createBotanicalBladeMaterial("snowdrop", {
      color: "#406858",
      underside: "#659178",
      vein: "#8eb294",
      roughness: 0.6,
      venation,
    });
    const a = compile(first),
      b = compile(second);
    assert.equal(first.customProgramCacheKey(), second.customProgramCacheKey());
    assert.equal(a.vertexShader, b.vertexShader);
    assert.equal(a.fragmentShader, b.fragmentShader);
    assert.notEqual(
      a.uniforms.uBladeUnderside.value,
      b.uniforms.uBladeUnderside.value,
    );
    assert.ok(
      !(a.uniforms.uBladeVein.value as Color).equals(
        b.uniforms.uBladeVein.value as Color,
      ),
    );
    const original = (b.uniforms.uBladeUnderside.value as Color).clone();
    (a.uniforms.uBladeUnderside.value as Color).set("#ffffff");
    assert.ok((b.uniforms.uBladeUnderside.value as Color).equals(original));
    first.dispose();
    second.dispose();
  }
});

test("unused tissue labels share source without changing existing optics", () => {
  const plain = createSpecimenMaterial("rose", "petal"),
    inner = createSpecimenMaterial("rose", "petal", undefined, "inner");
  assert.equal(plain.customProgramCacheKey(), inner.customProgramCacheKey());
  assert.equal(compile(plain).fragmentShader, compile(inner).fragmentShader);
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

test("a diagnostic foliar midstripe uses independent uniforms within shared blade programs", () => {
  const pigment = {
    color: "#426644",
    underside: "#70916b",
    vein: "#759968",
    roughness: 0.6,
    venation: "parallel" as const,
    midstripe: "#dae0cf",
  };
  const striped = createBotanicalBladeMaterial("snowdrop", pigment);
  const plain = createBotanicalBladeMaterial("snowdrop", {
    ...pigment,
    midstripe: undefined,
  });
  const a = compile(striped),
    b = compile(plain);
  assert.equal(a.uniforms.uBladeMidstripeStrength?.value, 1);
  assert.equal(b.uniforms.uBladeMidstripeStrength?.value, 0);
  assert.equal(a.fragmentShader, b.fragmentShader);
  assert.equal(striped.customProgramCacheKey(), plain.customProgramCacheKey());
  assert.ok(
    (a.uniforms.uBladeMidstripe.value as Color).equals(
      new Color(pigment.midstripe),
    ),
  );
  striped.dispose();
  plain.dispose();
});
test("leathery leaf undersides retain a distinct roughness through a shared shader", () => {
  const pigment = {
    color: "#355543",
    underside: "#94704e",
    vein: "#9aa779",
    roughness: 0.34,
    undersideRoughness: 0.86,
    venation: "pinnate" as const,
  };
  const leaf = createBotanicalBladeMaterial("camellia", pigment),
    plain = createBotanicalBladeMaterial("camellia", {
      ...pigment,
      undersideRoughness: undefined,
    });
  const a = compile(leaf),
    b = compile(plain);
  assert.equal(a.uniforms.uBladeBackRoughness?.value, 0.86);
  assert.equal(b.uniforms.uBladeBackRoughness?.value, 0.34);
  assert.equal(a.fragmentShader, b.fragmentShader);
  leaf.dispose();
  plain.dispose();
});
test("peltate venation radiates from the interior leaf hub", () => {
  const pigment = {
    color: "#63845d",
    underside: "#98af87",
    vein: "#cad1a4",
    roughness: 0.7,
    venation: "peltate" as const,
  };
  const material = createBotanicalBladeMaterial("lotus", pigment);
  const shader = compile(material);
  assert.ok(
    shader.fragmentShader.includes("vPetalUv.y-.5+.0001"),
    "peltate veins must use the interior hub",
  );
  material.dispose();
});

test("legacy organ labels do not duplicate identical tissue shader sources", () => {
  const sources = new Map<string, string>();
  const programs = new Map<string, string>();
  for (const type of FLOWER_TYPES) {
    for (const role of [
      "petal",
      "tube",
      "bract",
      "banner",
      "wing",
      "keel",
    ] as const) {
      const material = createSpecimenMaterial(type, role);
      const shader = compile(material);
      const source = shader.vertexShader + shader.fragmentShader;
      const key = material.customProgramCacheKey();
      const previous = sources.get(source);
      if (previous) assert.equal(key, previous, `${type}/${role}`);
      else sources.set(source, key);
      const program = programs.get(key);
      if (program)
        assert.equal(source, program, `${type}/${role} cache collision`);
      else programs.set(key, source);
      material.dispose();
    }
  }
});
