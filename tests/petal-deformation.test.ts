import test from "node:test";
import assert from "node:assert/strict";
import { Matrix4, MeshPhysicalMaterial } from "three";
import { createParametricShell } from "../lib/three/parametricShell";
import { createCagePatch, PetalDynamics } from "../lib/three/petalDynamics";
import {
  bindCageGeometry,
  CageDeformation,
} from "../lib/three/petalDeformation";

test("render tessellations share cage coordinates, side thickness and shadow displacement", () => {
  const sample = (
    u: number,
    v: number,
    open: number,
  ): [number, number, number] => [u, v, open * v * v * 0.1];
  const patch = createCagePatch({
    columns: 3,
    rows: 4,
    thickness: 0.012,
    sample,
  });
  const sim = new PetalDynamics([patch]);
  const deformation = new CageDeformation(sim);
  for (const detail of [8, 24]) {
    const geometry = createParametricShell({
      columns: detail,
      rows: detail,
      thickness: 0.012,
      sample,
    });
    bindCageGeometry(geometry, patch, 0);
    const indices = geometry.getAttribute("cageIndices"),
      weights = geometry.getAttribute("cageWeights");
    for (let i = 0; i < indices.count; i++) {
      assert.ok(
        indices.getX(i) >= 0 && indices.getW(i) < sim.inverseMass.length,
      );
      assert.ok(
        Math.abs(
          weights.getX(i) +
            weights.getY(i) +
            weights.getZ(i) +
            weights.getW(i) -
            1,
        ) < 1e-6,
      );
    }
    geometry.dispose();
  }
  sim.positions[15] += 0.02;
  deformation.update([new Matrix4()]);
  assert.ok(Math.abs(deformation.data[20] - 0.02) < 1e-6);
  const material = new MeshPhysicalMaterial();
  deformation.attach(material);
  const shadows = deformation.shadows();
  assert.ok(material.customProgramCacheKey().includes("cage"));
  assert.ok(shadows.depth.customProgramCacheKey().includes("cage"));
  assert.ok(shadows.distance.customProgramCacheKey().includes("cage"));
  assert.equal(deformation.texture.generateMipmaps, false);
  material.dispose();
  shadows.depth.dispose();
  shadows.distance.dispose();
  deformation.dispose();
});
