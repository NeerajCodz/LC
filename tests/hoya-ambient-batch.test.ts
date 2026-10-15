import assert from "node:assert/strict";
import test from "node:test";
import {
  Box3,
  DoubleSide,
  Group,
  Matrix3,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  MeshDepthMaterial,
  MeshDistanceMaterial,
  Object3D,
  Raycaster,
  ShaderLib,
  Vector3,
  type WebGLRenderer,
} from "three";
import { HOYA_MODEL } from "../components/flowers/hoya/hoyaGeometry";
import { IMPATIENS_MODEL } from "../components/flowers/impatiens/impatiensGeometry";
import { SNAPDRAGON_MODEL } from "../components/flowers/snapdragon/snapdragonGeometry";
import type { Quality } from "../lib/flowers/types";
import { petalOpenness } from "../lib/three/easing";
import {
  specimenCages,
  specimenGeometry,
  specimenSurfaceBatching,
} from "../lib/three/specimenModel";
import {
  bindSurfaceBatch,
  createSurfaceBatch,
  surfaceBatchGroups,
  type SurfaceBatchUniforms,
} from "../lib/three/surfaceBatch";
import {
  bindSurfaceBatchVertices,
  createSurfaceBatchPoses,
  refreshSurfaceBatchBounds,
  surfaceBatchNormal,
  surfaceBatchVertex,
  updateSurfaceBatchPoses,
} from "../lib/three/surfaceBatchPose";
import { createSpecimenMaterial } from "../lib/three/specimenMaterials";

const qualities: Quality[] = ["overview", "low", "medium", "high", "ultra"];
const blooms = [0, 0.1, 0.25, 0.5, 0.75, 0.9, 1];

function poseFixture() {
  const groups = HOYA_MODEL.clusters.map((cluster, i) => {
      const group = new Group();
      group.position.set(...cluster.position);
      group.rotation.set(
        cluster.rotation[0] + 0.023 * Math.sin(i),
        cluster.rotation[1],
        cluster.rotation[2] - 0.017 * Math.cos(i),
      );
      group.scale.set(
        cluster.scale * 0.8,
        cluster.scale * 1.2,
        cluster.scale * 1.1,
      );
      group.updateMatrix();
      return group;
    }),
    poses = createSurfaceBatchPoses(HOYA_MODEL.clusters),
    parent = new Object3D();
  parent.position.set(0.23, -0.17, 0.41);
  parent.rotation.set(0.13, -0.27, 0.19);
  parent.scale.set(1.1, 0.9, 1.2);
  parent.updateMatrixWorld(true);
  updateSurfaceBatchPoses(
    poses,
    groups,
    groups.map(() => ({ value: 0 })),
  );
  const uniforms: SurfaceBatchUniforms = {
    uBatchBloom: { value: 1 },
    uBatchPressure: { value: 0 },
    uBatchPoses: { value: poses.texture },
    uBatchPoseRows: { value: groups.length },
    uBatchHinge: { value: 0 },
  };
  return { groups, poses, parent, uniforms };
}

test("only opted-in ambient surfaces batch at focused quality; detailed and default models retain the individual path", () => {
  assert.equal(HOYA_MODEL.ambientSurfaceBatching, true);
  for (const quality of qualities) {
    assert.equal(specimenSurfaceBatching(HOYA_MODEL, quality, "ambient"), true);
    assert.equal(
      specimenSurfaceBatching(HOYA_MODEL, quality, "detailed"),
      false,
    );
    assert.equal(
      specimenSurfaceBatching(IMPATIENS_MODEL, quality, "ambient"),
      quality === "overview",
    );
    assert.equal(
      specimenSurfaceBatching(IMPATIENS_MODEL, quality, "detailed"),
      false,
    );
    assert.equal(
      specimenSurfaceBatching(
        { ...HOYA_MODEL, ambientSurfaceBatching: false },
        quality,
      ),
      quality === "overview",
    );
  }
  assert.equal(HOYA_MODEL.surfaces.length, 352);
  assert.equal(HOYA_MODEL.organs.length, 352);
  assert.equal(HOYA_MODEL.clusters.length, 22);
  for (const [constrained, expected] of [
    [false, 1100],
    [true, 440],
  ] as const) {
    const { patches } = specimenCages(HOYA_MODEL, constrained);
    assert.equal(
      patches.reduce((sum, patch) => sum + patch.open.length / 3, 0),
      expected,
    );
  }
});

for (const quality of qualities)
  test(`Hoya ${quality} ambient batches preserve every original shell index, attribute and posed vertex at seven bloom fractions`, () => {
    const fixture = poseFixture(),
      { groups, poses, parent, uniforms } = fixture,
      batches = surfaceBatchGroups(HOYA_MODEL, true),
      actual = new Vector3(),
      expected = new Vector3(),
      normal = new Matrix3(),
      worldNormal = new Matrix3(),
      expectedNormal = new Matrix3(),
      matrix = new Matrix4(),
      world = new Matrix4();
    assert.deepEqual(
      batches
        .flatMap((group) => group.entries.map((entry) => entry.index))
        .sort((a, b) => a - b),
      HOYA_MODEL.surfaces.map((_, i) => i),
    );
    assert.ok(batches.length < HOYA_MODEL.surfaces.length);
    let originalInputs = 0,
      batchedInputs = 0;
    for (const group of batches) {
      const batch = createSurfaceBatch(
        group.entries,
        HOYA_MODEL.clusters,
        quality,
      );
      let vertexOffset = 0,
        indexOffset = 0;
      assert.equal(
        Object.keys(batch.morphAttributes).length,
        0,
        "ambient folds are attributes, not per-geometry morph textures",
      );
      for (const { surface, index } of group.entries) {
        const original = specimenGeometry(surface, quality),
          position = original.getAttribute("position"),
          normalAttribute = original.getAttribute("normal"),
          closed = original.morphAttributes.position![0],
          closedNormal = original.morphAttributes.normal![0];
        assert.ok(
          vertexOffset + position.count <= batch.getAttribute("position").count,
          `${quality}: exact requested tessellation`,
        );
        for (const [name, source] of [
          ...Object.entries(original.attributes),
          ["lcClosedPosition", closed],
          ["lcClosedNormal", closedNormal],
        ] as const) {
          const target = batch.getAttribute(name);
          assert.equal(target.itemSize, source.itemSize);
          assert.equal(target.normalized, source.normalized);
          for (let i = 0; i < source.array.length; i++)
            if (
              target.array[vertexOffset * source.itemSize + i] !==
              source.array[i]
            )
              assert.equal(
                target.array[vertexOffset * source.itemSize + i],
                source.array[i],
                `${quality} ${surface.name} ${name} scalar ${i}`,
              );
        }
        for (let i = 0; i < original.index!.count; i++)
          assert.equal(
            batch.index!.getX(indexOffset + i),
            original.index!.getX(i) + vertexOffset,
            `${quality} topology ${surface.name}`,
          );
        world.multiplyMatrices(
          parent.matrixWorld,
          groups[surface.cluster].matrix,
        );
        expectedNormal.getNormalMatrix(world);
        worldNormal.getNormalMatrix(parent.matrixWorld);
        for (const bloom of blooms) {
          uniforms.uBatchBloom.value = bloom;
          const open = petalOpenness(bloom, surface.delay ?? 0, index * 0.31);
          let maxPositionError = 0,
            maxNormalError = 0;
          for (let v = 0; v < position.count; v++) {
            expected
              .fromBufferAttribute(position, v)
              .lerp(actual.fromBufferAttribute(closed, v), 1 - open)
              .applyMatrix4(world);
            surfaceBatchVertex(
              batch,
              vertexOffset + v,
              uniforms,
              actual,
              matrix,
            ).applyMatrix4(parent.matrixWorld);
            maxPositionError = Math.max(
              maxPositionError,
              actual.distanceTo(expected),
            );
            expected
              .fromBufferAttribute(normalAttribute, v)
              .lerp(actual.fromBufferAttribute(closedNormal, v), 1 - open)
              .applyMatrix3(expectedNormal)
              .normalize();
            surfaceBatchNormal(
              batch,
              vertexOffset + v,
              uniforms,
              actual,
              normal,
            )
              .applyMatrix3(worldNormal)
              .normalize();
            maxNormalError = Math.max(
              maxNormalError,
              actual.distanceTo(expected),
            );
          }
          assert.ok(
            maxPositionError < 2e-6,
            `${quality} ${surface.name} bloom${bloom} position error ${maxPositionError}`,
          );
          assert.ok(
            maxNormalError < 2e-5,
            `${quality} ${surface.name} bloom${bloom} normal error ${maxNormalError}`,
          );
        }
        vertexOffset += position.count;
        indexOffset += original.index!.count;
        originalInputs += original.index!.count;
        original.dispose();
      }
      assert.equal(batch.getAttribute("position").count, vertexOffset);
      assert.equal(batch.index!.count, indexOffset);
      batchedInputs += batch.index!.count;
      batch.dispose();
    }
    assert.equal(
      batchedInputs,
      originalInputs,
      "batching reduces submissions, never input triangles",
    );
    poses.texture.dispose();
  });

test("omitting quality retains exact legacy overview batch bytes", () => {
  for (const group of surfaceBatchGroups(HOYA_MODEL, true)) {
    const oldDefault = createSurfaceBatch(group.entries, HOYA_MODEL.clusters),
      explicit = createSurfaceBatch(
        group.entries,
        HOYA_MODEL.clusters,
        "overview",
      );
    assert.deepEqual(oldDefault.index!.array, explicit.index!.array);
    for (const name of Object.keys(oldDefault.attributes))
      assert.deepEqual(
        oldDefault.getAttribute(name).array,
        explicit.getAttribute(name).array,
      );
    oldDefault.dispose();
    explicit.dispose();
  }
});

test("the optional quality preserves real pressure targets and their normals", () => {
  const index = SNAPDRAGON_MODEL.surfaces.findIndex(
      (surface) => surface.pressureSample,
    ),
    surface = SNAPDRAGON_MODEL.surfaces[index];
  assert.ok(surface.pressureSample);
  for (const quality of qualities) {
    const original = specimenGeometry(surface, quality),
      batch = createSurfaceBatch(
        [{ surface, index }],
        SNAPDRAGON_MODEL.clusters,
        quality,
      );
    assert.deepEqual(
      batch.getAttribute("lcPressedPosition").array,
      original.morphAttributes.position![1].array,
    );
    assert.deepEqual(
      batch.getAttribute("lcPressedNormal").array,
      original.morphAttributes.normal![1].array,
    );
    assert.deepEqual(batch.index!.array, original.index!.array);
    original.dispose();
    batch.dispose();
  }
});

test("focused ambient batch CPU picking and bounds follow exact folded tissue under transformed parents", () => {
  const { groups, poses, parent, uniforms } = poseFixture(),
    material = new MeshBasicMaterial({ side: DoubleSide }),
    a = new Vector3(),
    b = new Vector3(),
    c = new Vector3(),
    center = new Vector3(),
    direction = new Vector3(),
    ray = new Raycaster(),
    entries = surfaceBatchGroups(HOYA_MODEL, true).flatMap((group) => [
      group.entries[0],
      group.entries.at(-1)!,
    ]);
  for (const quality of qualities)
    for (const entry of entries) {
      const geometry = createSurfaceBatch(
          [entry],
          HOYA_MODEL.clusters,
          quality,
        ),
        originalGeometry = specimenGeometry(entry.surface, quality),
        batch = new Mesh(geometry, material),
        original = new Mesh(originalGeometry, material),
        carrier = new Group();
      carrier.matrix.copy(groups[entry.surface.cluster].matrix);
      carrier.matrixAutoUpdate = false;
      carrier.add(original);
      parent.add(carrier, batch);
      parent.updateMatrixWorld(true);
      bindSurfaceBatchVertices(batch, uniforms);
      original.updateMorphTargets();
      for (const bloom of blooms) {
        uniforms.uBatchBloom.value = bloom;
        original.morphTargetInfluences![0] =
          1 -
          petalOpenness(bloom, entry.surface.delay ?? 0, entry.index * 0.31);
        refreshSurfaceBatchBounds(batch, uniforms);
        const precise = new Box3().setFromObject(batch, true),
          bounds = new Box3().setFromObject(batch);
        assert.ok(bounds.expandByScalar(2e-6).containsBox(precise));
        const face = Math.floor(originalGeometry.index!.count / 6) * 3;
        original
          .getVertexPosition(originalGeometry.index!.getX(face), a)
          .applyMatrix4(original.matrixWorld);
        original
          .getVertexPosition(originalGeometry.index!.getX(face + 1), b)
          .applyMatrix4(original.matrixWorld);
        original
          .getVertexPosition(originalGeometry.index!.getX(face + 2), c)
          .applyMatrix4(original.matrixWorld);
        direction.subVectors(b, a).cross(c.clone().sub(a)).normalize();
        center
          .copy(a)
          .add(b)
          .add(c)
          .multiplyScalar(1 / 3);
        ray.set(
          center.clone().addScaledVector(direction, 0.01),
          direction.negate(),
        );
        const expected = ray.intersectObject(original, false),
          actual = ray.intersectObject(batch, false);
        assert.ok(
          expected.length && actual.length,
          `${quality} ${entry.surface.name} bloom${bloom} actual shell hit`,
        );
        assert.ok(
          Math.abs(expected[0].distance - actual[0].distance) < 2e-6,
          `${quality} ${entry.surface.name} bloom${bloom}: ${expected[0].distance} vs ${actual[0].distance}`,
        );
      }
      parent.remove(carrier, batch);
      geometry.dispose();
      originalGeometry.dispose();
    }
  material.dispose();
  poses.texture.dispose();
});

test("ambient Hoya tissue and both shadow passes retain the same custom morph and pose shader", () => {
  const { poses, uniforms } = poseFixture();
  for (const group of surfaceBatchGroups(HOYA_MODEL, true)) {
    const plain = createSpecimenMaterial(
        "hoya",
        group.role,
        undefined,
        group.tissue,
      ),
      tissue = createSpecimenMaterial(
        "hoya",
        group.role,
        undefined,
        group.tissue,
      ),
      depth = new MeshDepthMaterial(),
      distance = new MeshDistanceMaterial();
    for (const property of [
      "color",
      "roughness",
      "metalness",
      "side",
      "sheen",
      "clearcoat",
      "transparent",
      "opacity",
    ] as const)
      assert.deepEqual(tissue[property], plain[property]);
    for (const material of [tissue, depth, distance]) {
      bindSurfaceBatch(material, uniforms, group.pressure);
      const template =
        material === depth
          ? ShaderLib.depth
          : material === distance
            ? ShaderLib.distance
            : ShaderLib.physical;
      const shader = {
        uniforms: {},
        vertexShader: template.vertexShader,
        fragmentShader: template.fragmentShader,
      } as Parameters<typeof material.onBeforeCompile>[0];
      material.onBeforeCompile(shader, {} as WebGLRenderer);
      assert.equal(shader.uniforms.uBatchPoses, uniforms.uBatchPoses);
      assert.match(shader.vertexShader, /lcClosedPosition-position/);
      assert.match(shader.vertexShader, /lcClosedNormal-normal/);
      assert.match(
        shader.vertexShader,
        /lcClusterNormal\(\)\*lcHinge\(\)\*objectNormal/,
      );
      material.dispose();
    }
    plain.dispose();
  }
  poses.texture.dispose();
});
