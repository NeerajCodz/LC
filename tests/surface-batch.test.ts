import assert from "node:assert/strict";
import test from "node:test";
import {
  ShaderLib,
  MeshDepthMaterial,
  MeshPhysicalMaterial,
  MeshDistanceMaterial,
  Mesh,
  MeshBasicMaterial,
  Group,
  Object3D,
  Matrix3,
  Matrix4,
  Vector3,
  Box3,
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
import { WISTERIA_MODEL } from "../components/flowers/wisteria/wisteriaGeometry";
import { AGAPANTHUS_MODEL } from "../components/flowers/agapanthus/agapanthusGeometry";
import {
  createSurfaceBatchPoses,
  updateSurfaceBatchPoses,
  surfaceBatchVertex,
  surfaceBatchNormal,
  bindSurfaceBatchVertices,
  refreshSurfaceBatchBounds,
} from "../lib/three/surfaceBatchPose";

test("cross-cluster batches preserve every material channel, index, independent pose and morph normal", () => {
  for (const model of [WISTERIA_MODEL, AGAPANTHUS_MODEL, SWEET_PEA_MODEL]) {
    const groups = model.clusters.map((c) => {
        const group = new Group();
        group.position.set(...c.position);
        group.rotation.set(...c.rotation);
        group.scale.setScalar(c.scale);
        group.updateMatrix();
        return group;
      }),
      articulation = model.clusters.map(() => ({ value: 0 })),
      poses = createSurfaceBatchPoses(model.clusters),
      matrix = new Matrix4(),
      normalMatrix = new Matrix3(),
      expectedMatrix = new Matrix4(),
      hinge = new Matrix4(),
      expectedNormal = new Matrix3(),
      actual = new Vector3(),
      expected = new Vector3(),
      getter = new Vector3(),
      material = new MeshBasicMaterial();
    assert.ok(Array.from(poses.data).every(Number.isFinite));
    const initialVersion = poses.texture.version;
    updateSurfaceBatchPoses(poses, groups, articulation);
    assert.equal(
      poses.texture.version,
      initialVersion,
      "static poses need no repeated texture upload",
    );
    for (const batch of surfaceBatchGroups(model, true)) {
      assert.ok(
        batch.entries.every(
          (e) =>
            e.surface.role === batch.role &&
            e.surface.tissue === batch.tissue &&
            !!e.surface.pressureSample === batch.pressure,
        ),
      );
      const geometry = createSurfaceBatch(batch.entries, model.clusters),
        mesh = new Mesh(geometry, material),
        root = new Object3D(),
        uniforms = {
          uBatchBloom: { value: 1 },
          uBatchPressure: { value: 0 },
          uBatchPoses: { value: poses.texture },
          uBatchPoseRows: { value: model.clusters.length },
          uBatchHinge: {
            value: batch.role === "wing" || batch.role === "keel" ? 1 : 0,
          },
        };
      root.position.set(0.14, -0.23, 0.09);
      root.rotation.set(0.12, -0.31, 0.07);
      root.add(mesh);
      root.updateMatrixWorld(true);
      bindSurfaceBatchVertices(mesh, uniforms);
      let expectedIndices = 0;
      const originals = batch.entries.map((e) =>
        specimenGeometry(e.surface, "overview"),
      );
      originals.forEach((g) => {
        expectedIndices += g.index!.count;
      });
      assert.equal(geometry.index!.count, expectedIndices);
      for (const [bloom, wind, contact] of [
        [0, 0, 0],
        [0.5, 0.8, 0.5],
        [1, 0.4, -0.3],
      ] as const) {
        uniforms.uBatchBloom.value = bloom;
        groups.forEach((g, i) => {
          const c = model.clusters[i];
          g.rotation.set(
            c.rotation[0] + Math.sin(2.1 * 1.3 + i * 0.9) * c.nod * 0.4 * wind,
            c.rotation[1],
            c.rotation[2] +
              Math.sin(2.1 * 1.6 + i * 1.7) * c.nod * wind +
              contact * c.nod,
          );
          // Include anisotropic scale to expose incorrect normal transforms.
          g.scale.set(c.scale * 0.8, c.scale * 1.2, c.scale * 1.1);
          g.updateMatrix();
          articulation[i].value = i % 2 ? -0.04 : bloom === 1 ? 0.39 : 0.21;
        });
        updateSurfaceBatchPoses(poses, groups, articulation);
        refreshSurfaceBatchBounds(mesh, uniforms);
        const fitted = new Box3().setFromObject(root),
          precise = new Box3().setFromObject(root, true);
        assert.ok(
          fitted.clone().expandByScalar(1e-6).containsBox(precise),
          "default camera bounds enclose actual GPU-posed vertices",
        );
        let offset = 0;
        for (let e = 0; e < batch.entries.length; e++) {
          const { surface, index } = batch.entries[e],
            original = originals[e],
            p = original.getAttribute("position"),
            n = original.getAttribute("normal"),
            closed = original.morphAttributes.position![0],
            closedNormal = original.morphAttributes.normal![0],
            pressed = original.morphAttributes.position![1],
            pressedNormal = original.morphAttributes.normal![1],
            open = petalOpenness(bloom, surface.delay ?? 0, index * 0.31),
            pressure = Math.max(0, articulation[surface.cluster].value) / 0.35,
            angle =
              uniforms.uBatchHinge.value * articulation[surface.cluster].value;
          expectedMatrix
            .copy(groups[surface.cluster].matrix)
            .multiply(hinge.makeRotationX(angle));
          expectedNormal.getNormalMatrix(expectedMatrix);
          for (let v = 0; v < p.count; v++) {
            expected.fromBufferAttribute(p, v);
            expected.x +=
              (closed.getX(v) - p.getX(v)) * (1 - open) +
              (pressed ? (pressed.getX(v) - p.getX(v)) * pressure * open : 0);
            expected.y +=
              (closed.getY(v) - p.getY(v)) * (1 - open) +
              (pressed ? (pressed.getY(v) - p.getY(v)) * pressure * open : 0);
            expected.z +=
              (closed.getZ(v) - p.getZ(v)) * (1 - open) +
              (pressed ? (pressed.getZ(v) - p.getZ(v)) * pressure * open : 0);
            expected.applyMatrix4(expectedMatrix);
            surfaceBatchVertex(geometry, offset + v, uniforms, actual, matrix);
            assert.ok(
              actual.distanceTo(expected) < 2e-6,
              `${surface.name} bloom${bloom} position`,
            );
            mesh.getVertexPosition(offset + v, getter);
            assert.ok(getter.distanceTo(actual) < 1e-12);
            expected.fromBufferAttribute(n, v);
            expected.x +=
              (closedNormal.getX(v) - n.getX(v)) * (1 - open) +
              (pressedNormal
                ? (pressedNormal.getX(v) - n.getX(v)) * pressure * open
                : 0);
            expected.y +=
              (closedNormal.getY(v) - n.getY(v)) * (1 - open) +
              (pressedNormal
                ? (pressedNormal.getY(v) - n.getY(v)) * pressure * open
                : 0);
            expected.z +=
              (closedNormal.getZ(v) - n.getZ(v)) * (1 - open) +
              (pressedNormal
                ? (pressedNormal.getZ(v) - n.getZ(v)) * pressure * open
                : 0);
            expected.applyMatrix3(expectedNormal).normalize();
            surfaceBatchNormal(
              geometry,
              offset + v,
              uniforms,
              actual,
              normalMatrix,
            );
            assert.ok(
              actual.distanceTo(expected) < 2e-5,
              `${surface.name} bloom${bloom} inverse-transpose normal`,
            );
            for (const name of ["uv", "color", "tissueSide"])
              for (let c = 0; c < original.getAttribute(name).itemSize; c++)
                assert.equal(
                  geometry.getAttribute(name).array[
                    (offset + v) * original.getAttribute(name).itemSize + c
                  ],
                  original.getAttribute(name).array[
                    v * original.getAttribute(name).itemSize + c
                  ],
                );
          }
          offset += p.count;
        }
      }
      originals.forEach((g) => g.dispose());
      geometry.dispose();
    }
    material.dispose();
    poses.texture.dispose();
  }
});

test("posed tissue, depth and distance shaders share initialized cluster and hinge deformation", () => {
  const poses = createSurfaceBatchPoses(SWEET_PEA_MODEL.clusters),
    uniforms = {
      uBatchBloom: { value: 0.5 },
      uBatchPressure: { value: 0 },
      uBatchPoses: { value: poses.texture },
      uBatchPoseRows: { value: SWEET_PEA_MODEL.clusters.length },
      uBatchHinge: { value: 1 },
    };
  for (const material of [
    new MeshPhysicalMaterial(),
    new MeshDepthMaterial(),
    new MeshDistanceMaterial(),
  ]) {
    bindSurfaceBatch(material, uniforms, true);
    const shader = {
      uniforms: {},
      vertexShader: (material instanceof MeshDepthMaterial
        ? ShaderLib.depth
        : material instanceof MeshDistanceMaterial
          ? ShaderLib.distance
          : ShaderLib.physical
      ).vertexShader,
      fragmentShader: "",
    } as unknown as Parameters<typeof material.onBeforeCompile>[0];
    material.onBeforeCompile(shader, {} as WebGLRenderer);
    assert.equal(material.defines?.LC_SURFACE_BATCH_POSES, 1);
    assert.equal(shader.uniforms.uBatchPoses, uniforms.uBatchPoses);
    assert.match(
      shader.vertexShader,
      /lcClusterMatrix\(\)\*vec4\(lcHinge\(\)\*transformed/,
    );
    assert.match(
      shader.vertexShader,
      /lcClusterNormal\(\)\*lcHinge\(\)\*objectNormal/,
    );
    assert.match(shader.vertexShader, /lcPressedNormal-normal/);
    assert.equal(
      shader.vertexShader.match(/\(lcPressedNormal-normal\)/g)?.length,
      1,
      "pressure normal displacement applies once",
    );
    material.dispose();
  }
  poses.texture.dispose();
});

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
