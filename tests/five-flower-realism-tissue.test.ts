import test from "node:test";
import assert from "node:assert/strict";
import { Color, ShaderLib, Vector3, type WebGLRenderer } from "three";
import { createSpecimenMaterial } from "../lib/three/specimenMaterials";
import {
  specimenOrganGeometry,
  type SpecimenOrgan,
} from "../lib/three/specimenModel";

function compile(material: ReturnType<typeof createSpecimenMaterial>) {
  const shader = {
    uniforms: {},
    vertexShader: ShaderLib.physical.vertexShader,
    fragmentShader: ShaderLib.physical.fragmentShader,
  } as unknown as Parameters<typeof material.onBeforeCompile>[0];
  material.onBeforeCompile(shader, {} as WebGLRenderer);
  return shader;
}

test("the five refined tissues carry bounded micro-relief through the actual normal program", () => {
  for (const type of [
    "gazania",
    "salvia",
    "nicotiana",
    "lantana",
    "echinacea",
  ] as const) {
    const material = createSpecimenMaterial(type, "petal");
    try {
      const shader = compile(material),
        relief = shader.uniforms.uSpecimenRelief?.value as Vector3 | undefined;
      assert.ok(relief instanceof Vector3, `${type}: missing surface response`);
      assert.ok(relief.x > 0 && relief.x < 0.0005);
      assert.ok(relief.y > 0 && relief.y < relief.x);
      assert.ok(Number.isInteger(relief.z) && relief.z >= 3);
      assert.match(shader.fragmentShader, /microHeight\s*=.*specimenRelief/s);
      assert.match(shader.fragmentShader, /fwidth\(specimenReliefPhase\)/);
    } finally {
      material.dispose();
    }
  }
  const legacy = createSpecimenMaterial("torenia", "tube");
  try {
    assert.equal(compile(legacy).uniforms.uSpecimenRelief.value.x, 0);
  } finally {
    legacy.dispose();
  }
});

test("Nicotiana keeps ivory inner tissue separate from its green exterior root", () => {
  const material = createSpecimenMaterial("nicotiana", "tube");
  try {
    const shader = compile(material),
      inside = shader.uniforms.uSpecimenInteriorColor?.value as
        Color | undefined,
      root = shader.uniforms.uPigmentRoot.value as Color;
    assert.ok(inside instanceof Color, "missing separate interior pigment");
    assert.ok(root.g > root.r && root.g > root.b);
    assert.ok(inside.r > root.r * 1.5 && inside.b > root.b * 1.5);
    assert.ok(Math.abs(inside.r - inside.g) < 0.04);
    assert.match(
      shader.fragmentShader,
      /niExterior\s*=\s*step\(0\.,\s*vTissueSide\)/,
    );
    assert.match(
      shader.fragmentShader,
      /mix\(uSpecimenInteriorColor,\s*diffuseColor.rgb,\s*niExterior\)/,
    );
  } finally {
    material.dispose();
  }
});

test("vegetative receptacles keep green support pigment independently of floral tissue", () => {
  const material = createSpecimenMaterial(
    "lantana",
    "receptacle",
    undefined,
    "leaf",
  );
  try {
    const pigment = compile(material).uniforms.uPigmentBody.value as Color;
    assert.ok(pigment.g > pigment.r && pigment.g > pigment.b);
  } finally {
    material.dispose();
  }
});

test("an organ's real vertex colors preserve a basal-to-tip pigment transition at every tier", () => {
  const organ: SpecimenOrgan = {
    name: "pigmented palea",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0, 0.06, 0],
      [0, 0.12, 0],
    ],
    foldedPoints: [
      [0, 0, 0],
      [0, 0.04, 0],
      [0, 0.08, 0],
    ],
    radius: 0.02,
    endRadius: 0.001,
    color: "#664322",
    tipColor: "#d96024",
  };
  for (const quality of [
    "overview",
    "low",
    "medium",
    "high",
    "ultra",
  ] as const) {
    const geometry = specimenOrganGeometry(organ, quality);
    try {
      const color = geometry.getAttribute("color"),
        position = geometry.getAttribute("position");
      let low = 0,
        high = 0;
      for (let i = 1; i < position.count; i++) {
        if (position.getY(i) < position.getY(low)) low = i;
        if (position.getY(i) > position.getY(high)) high = i;
      }
      assert.ok(color.getX(high) > color.getX(low) * 2);
      assert.equal(
        geometry.morphAttributes.position?.[0]?.count,
        position.count,
      );
      assert.equal(geometry.morphAttributes.normal?.[0]?.count, position.count);
    } finally {
      geometry.dispose();
    }
  }
});
