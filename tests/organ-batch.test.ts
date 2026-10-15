import assert from "node:assert/strict";
import test from "node:test";
import {
  Box3,
  Group,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Vector3,
  ShaderLib,
  type WebGLRenderer,
} from "three";
import { CYMES_MODELS } from "../tests/cymes-and-spikes-models";
import {
  specimenOrganParts,
  specimenOrganCarrier,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import {
  createOrganBatch,
  organBatchGroups,
  createOrganBatchMaterials,
} from "../lib/three/organBatch";
import { petalOpenness } from "../lib/three/easing";
import {
  createSurfaceBatchPoses,
  updateSurfaceBatchPoses,
  surfaceBatchVertex,
  surfaceBatchNormal,
  bindSurfaceBatchVertices,
  refreshSurfaceBatchBounds,
} from "../lib/three/surfaceBatchPose";

const fallbackModel: SpecimenModel = {
  clusters: [
    {
      position: [0.2, 0.3, -0.1],
      rotation: [0.1, 0.2, 0.3],
      scale: 0.8,
      nod: 0.02,
    },
    {
      position: [-0.3, 0.1, 0.2],
      rotation: [-0.2, 0.3, 0.1],
      scale: 1.2,
      nod: 0.03,
    },
  ],
  surfaces: [
    {
      name: "carrier zero",
      cluster: 0,
      role: "tube",
      thickness: 0.01,
      delay: 0.14,
      sample: (u, v) => [u, v, 0],
    },
    {
      name: "carrier one",
      cluster: 1,
      role: "petal",
      thickness: 0.01,
      delay: 0.39,
      sample: (u, v) => [u, v, 0],
    },
  ],
  organs: [
    {
      name: "fixed axis",
      cluster: 0,
      bloomMorph: false,
      points: [
        [0.1, 0.2, 0.3],
        [0.1, 0.4, 0.3],
      ],
      foldedPoints: [
        [1, 2, 3],
        [1, 4, 3],
      ],
      radius: 0.01,
      color: "#123456",
    },
    {
      name: "unmorphed anther",
      cluster: 0,
      points: [
        [0.1, 0.2, 0.3],
        [0.1, 0.4, 0.3],
      ],
      radius: 0.01,
      color: "#654321",
    },
    {
      name: "folded anther",
      cluster: 1,
      points: [
        [0.1, 0.2, 0.3],
        [0.1, 0.4, 0.3],
      ],
      foldedPoints: [
        [0.03, 0.08, 0.09],
        [0.04, 0.12, 0.08],
      ],
      radius: 0.01,
      color: "#abcdef",
    },
    {
      name: "unchanged anther",
      cluster: 1,
      points: [
        [0.3, 0.2, 0.1],
        [0.3, 0.4, 0.1],
      ],
      radius: 0.01,
      color: "#fedcba",
    },
  ],
};

test("ordinary overview organ batching saves at least 150 draws without omitting indices or pigments", () => {
  let oldDraws = 0,
    newDraws = 0;
  for (const { model, slug } of CYMES_MODELS) {
    const groups = organBatchGroups(model);
    assert.ok(groups.length <= 2, slug);
    newDraws += groups.length;
    for (const group of groups) {
      const geometry = createOrganBatch(model, group);
      let vertexOffset = 0,
        expectedIndices = 0;
      for (const cluster of group.clusters) {
        const parts = specimenOrganParts(
          model,
          cluster,
          "overview",
          group.included,
        );
        assert.ok(parts.length);
        oldDraws++;
        for (const { geometry: original } of parts) {
          expectedIndices += original.index!.count;
          for (const name of Object.keys(original.attributes))
            for (let i = 0; i < original.getAttribute(name).array.length; i++)
              assert.equal(
                geometry.getAttribute(name).array[
                  vertexOffset * original.getAttribute(name).itemSize + i
                ],
                original.getAttribute(name).array[i],
                `${slug} ${name}`,
              );
          vertexOffset += original.getAttribute("position").count;
          original.dispose();
        }
      }
      assert.equal(
        geometry.index!.count,
        expectedIndices,
        `${slug} full submitted-input count`,
      );
      assert.equal(geometry.getAttribute("position").count, vertexOffset);
      assert.deepEqual(geometry.morphAttributes, {});
      geometry.dispose();
    }
  }
  assert.ok(oldDraws - newDraws >= 150, `saved ${oldDraws - newDraws} draws`);
});

test("overview organs preserve fixed, included morph and legacy half-scale poses with folded normals", () => {
  for (const model of [
    fallbackModel,
    ...CYMES_MODELS.map(({ model }) => model),
  ]) {
    const groups = model.clusters.map((cluster) => {
        const group = new Group();
        group.position.set(...cluster.position);
        group.rotation.set(...cluster.rotation);
        group.scale.set(
          cluster.scale * 0.8,
          cluster.scale * 1.2,
          cluster.scale * 1.1,
        );
        group.updateMatrix();
        return group;
      }),
      poses = createSurfaceBatchPoses(model.clusters),
      articulation = model.clusters.map(() => ({ value: 0.31 })),
      material = new MeshBasicMaterial(),
      scratch = new Matrix4(),
      normalScratch = new Matrix3(),
      expectedNormal = new Matrix3(),
      actual = new Vector3(),
      expected = new Vector3();
    updateSurfaceBatchPoses(poses, groups, articulation);
    for (const batch of organBatchGroups(model)) {
      const geometry = createOrganBatch(model, batch),
        mesh = new Mesh(geometry, material),
        root = new Object3D(),
        uniforms = {
          uBatchBloom: { value: 1 },
          uBatchPressure: { value: 0 },
          uBatchPoses: { value: poses.texture },
          uBatchPoseRows: { value: model.clusters.length },
          uBatchHinge: { value: 0 },
        };
      root.position.set(0.1, -0.2, 0.3);
      root.rotation.set(0.1, 0.2, -0.1);
      root.add(mesh);
      root.updateMatrixWorld(true);
      bindSurfaceBatchVertices(mesh, uniforms);
      for (const bloom of [0, 0.5, 1]) {
        uniforms.uBatchBloom.value = bloom;
        groups.forEach((group, i) => {
          group.rotation.z =
            model.clusters[i].rotation[2] + 0.02 * Math.sin(i + bloom);
          group.updateMatrix();
        });
        updateSurfaceBatchPoses(poses, groups, articulation);
        refreshSurfaceBatchBounds(mesh, uniforms);
        const fitted = new Box3().setFromObject(root),
          precise = new Box3().setFromObject(root, true);
        assert.ok(
          fitted.clone().expandByScalar(2e-6).containsBox(precise),
          "posed bounds contain all rendered organs",
        );
        let offset = 0;
        for (const cluster of batch.clusters) {
          const carrier = specimenOrganCarrier(model, cluster),
            open = petalOpenness(bloom, carrier.delay, carrier.phase),
            parts = specimenOrganParts(
              model,
              cluster,
              "overview",
              batch.included,
            ),
            hasMorph = parts.some(
              ({ geometry }) => geometry.morphAttributes.position?.length,
            );
          expectedNormal.getNormalMatrix(groups[cluster].matrix);
          for (const { geometry: original } of parts) {
            const p = original.getAttribute("position"),
              n = original.getAttribute("normal"),
              closed = original.morphAttributes.position?.[0],
              closedNormal = original.morphAttributes.normal?.[0];
            for (let i = 0; i < p.count; i++) {
              expected.fromBufferAttribute(p, i);
              if (batch.included) {
                if (hasMorph)
                  expected.lerp(
                    new Vector3().fromBufferAttribute(closed!, i),
                    1 - open,
                  );
                else expected.multiplyScalar(0.5 + 0.5 * open);
              }
              expected.applyMatrix4(groups[cluster].matrix);
              surfaceBatchVertex(
                geometry,
                offset + i,
                uniforms,
                actual,
                scratch,
              );
              assert.ok(
                actual.distanceTo(expected) < 3e-6,
                `${cluster} bloom${bloom} included${batch.included} vertex`,
              );
              assert.ok(
                mesh
                  .getVertexPosition(offset + i, new Vector3())
                  .distanceTo(actual) < 1e-12,
              );
              expected.fromBufferAttribute(n, i);
              if (batch.included && hasMorph)
                expected.lerp(
                  new Vector3().fromBufferAttribute(closedNormal!, i),
                  1 - open,
                );
              expected.applyMatrix3(expectedNormal).normalize();
              surfaceBatchNormal(
                geometry,
                offset + i,
                uniforms,
                actual,
                normalScratch,
              );
              assert.ok(
                actual.distanceTo(expected) < 3e-5,
                `${cluster} bloom${bloom} included${batch.included} normal`,
              );
            }
            offset += p.count;
            original.dispose();
          }
        }
      }
      geometry.dispose();
    }
    material.dispose();
    poses.texture.dispose();
  }
});

test("ordinary organ tissue and both shadow passes use the same posed bloom deformation", () => {
  const poses = createSurfaceBatchPoses(fallbackModel.clusters),
    uniforms = {
      uBatchBloom: { value: 0.5 },
      uBatchPressure: { value: 0 },
      uBatchPoses: { value: poses.texture },
      uBatchPoseRows: { value: 2 },
      uBatchHinge: { value: 0 },
    },
    materials = createOrganBatchMaterials(uniforms);
  assert.equal(materials.tissue.vertexColors, true);
  assert.equal(materials.tissue.roughness, 0.68);
  for (const [material, library] of [
    [materials.tissue, ShaderLib.standard],
    [materials.depth, ShaderLib.depth],
    [materials.distance, ShaderLib.distance],
  ] as const) {
    const shader = {
      uniforms: {},
      vertexShader: library.vertexShader,
      fragmentShader: library.fragmentShader,
    } as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as WebGLRenderer);
    assert.equal(shader.uniforms.uBatchPoses, uniforms.uBatchPoses);
    assert.equal(shader.uniforms.uBatchBloom, uniforms.uBatchBloom);
    assert.match(
      shader.vertexShader,
      /lcClusterMatrix\(\)\*vec4\(lcHinge\(\)\*transformed/,
    );
    assert.match(
      shader.vertexShader,
      /lcClusterNormal\(\)\*lcHinge\(\)\*objectNormal/,
    );
    assert.equal(material.defines?.LC_SURFACE_BATCH_PRESSURE, undefined);
    assert.ok(material.customProgramCacheKey().includes("surface-batch-v2"));
    material.dispose();
  }
  poses.texture.dispose();
});
