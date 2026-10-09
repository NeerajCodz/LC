import assert from "node:assert/strict";
import test from "node:test";
import {
  ShaderLib,
  MeshDepthMaterial,
  MeshPhysicalMaterial,
  type WebGLRenderer,
} from "three";
import { RANUNCULUS_MODEL } from "../components/flowers/ranunculus/ranunculusGeometry";
import { SWEET_PEA_MODEL } from "../components/flowers/sweet-pea/sweetPeaGeometry";
import { specimenGeometry } from "../lib/three/specimenModel";
import {
  createSurfaceBatch,
  surfaceBatchGroups,
  bindSurfaceBatch,
} from "../lib/three/surfaceBatch";
import { petalOpenness } from "../lib/three/easing";

test("surface batches retain every sealed petal and its original independent bloom timing", () => {
  for (const model of [RANUNCULUS_MODEL, SWEET_PEA_MODEL]) {
    const groups = surfaceBatchGroups(model);
    assert.deepEqual(
      groups
        .flatMap((g) => g.entries.map((e) => e.index))
        .sort((a, b) => a - b),
      model.surfaces.map((_, i) => i),
    );
    assert.ok(groups.length < model.surfaces.length / 2);
    for (const group of groups) {
      const batch = createSurfaceBatch(group.entries);
      let offset = 0,
        indices = 0;
      for (const { surface, index } of group.entries) {
        const original = specimenGeometry(surface, "overview");
        const p = original.getAttribute("position"),
          closed = original.morphAttributes.position![0];
        const output = batch.getAttribute("position"),
          folded = batch.getAttribute("lcClosedPosition"),
          starts = batch.getAttribute("lcBloomStart");
        for (const bloom of [0, 0.5, 1])
          for (let i = 0; i < p.count; i++) {
            const open = petalOpenness(bloom, surface.delay ?? 0, index * 0.31);
            const start = starts.getX(offset + i);
            const t = Math.max(0, Math.min(1, (bloom - start) / (1 - start))),
              weight = t * t * (3 - 2 * t);
            for (let c = 0; c < 3; c++)
              assert.ok(
                Math.abs(
                  output.array[(offset + i) * 3 + c] * weight +
                    folded.array[(offset + i) * 3 + c] * (1 - weight) -
                    (p.array[i * 3 + c] * open +
                      closed.array[i * 3 + c] * (1 - open)),
                ) < 1e-6,
              );
          }
        if (surface.pressureSample)
          assert.ok(batch.hasAttribute("lcPressedPosition"));
        offset += p.count;
        indices += original.index!.count;
        original.dispose();
      }
      assert.equal(batch.getAttribute("position").count, offset);
      assert.equal(batch.index!.count, indices);
      assert.equal(Object.keys(batch.morphAttributes).length, 0);
      assert.ok(
        batch.boundingSphere && Number.isFinite(batch.boundingSphere.radius),
      );
      batch.dispose();
    }
  }
});

test("surface batch deformation is shared by tissue and depth shaders", () => {
  const uniforms = {
    uBatchBloom: { value: 0.5 },
    uBatchPressure: { value: 0.3 },
  };
  for (const material of [
    new MeshPhysicalMaterial(),
    new MeshDepthMaterial(),
  ]) {
    bindSurfaceBatch(material, uniforms, true);
    const shader = {
      uniforms: {},
      vertexShader: (material instanceof MeshDepthMaterial
        ? ShaderLib.depth
        : ShaderLib.physical
      ).vertexShader,
      fragmentShader: "",
    } as unknown as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as WebGLRenderer);
    assert.equal(shader.uniforms.uBatchBloom, uniforms.uBatchBloom);
    assert.match(shader.vertexShader, /transformed\s*\+=\s*\(lcClosedPosition/);
    assert.match(shader.vertexShader, /lcPressedPosition/);
    if (material instanceof MeshPhysicalMaterial)
      assert.match(
        shader.vertexShader,
        /objectNormal\s*\+=\s*\(lcClosedNormal/,
      );
    assert.equal(
      material.defines?.STANDARD,
      material instanceof MeshPhysicalMaterial ? "" : undefined,
    );
    material.dispose();
  }
});
