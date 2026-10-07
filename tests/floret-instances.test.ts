import test from "node:test";
import assert from "node:assert/strict";
import {
  specimenInstanceGeometry,
  radialFloretPoses,
  updateFloretInstances,
} from "../lib/three/floretInstances";
import {
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Matrix4,
} from "three";
import type { SpecimenInstanceGroup } from "../lib/three/specimenModel";
import { PROTEA_MODEL } from "../components/flowers/king-protea/proteaGeometry";
test("protea florets gather inside the closed bract envelope", () => {
  const group = PROTEA_MODEL.instances![0],
    g = specimenInstanceGeometry(group, "low"),
    material = new MeshStandardMaterial(),
    mesh = new InstancedMesh(g.surfaces[0], material, group.poses.length),
    target = new Mesh(g.surfaces[0], material),
    dummy = new Object3D(),
    matrix = new Matrix4();
  updateFloretInstances(mesh, target, group.poses, 0, 0, 0, true, dummy);
  for (let i = 0; i < group.poses.length; i++) {
    mesh.getMatrixAt(i, matrix);
    assert.ok(Math.hypot(matrix.elements[12], matrix.elements[14]) < 0.15);
  }
  updateFloretInstances(mesh, target, group.poses, 1, 0, 0, true, dummy);
  mesh.getMatrixAt(127, matrix);
  assert.ok(Math.hypot(matrix.elements[12], matrix.elements[14]) > 0.45);
  mesh.morphTexture?.dispose();
  mesh.dispose();
  [...g.surfaces, ...g.organs].forEach((p) => p.dispose());
  material.dispose();
});

const prototype: SpecimenInstanceGroup = {
  name: "test florets",
  cluster: 0,
  poses: radialFloretPoses(48, 0.8, 0.1, 42),
  surfaces: [
    {
      name: "cup",
      cluster: 0,
      role: "petal",
      thickness: 0.008,
      periodic: true,
      sample: (u, v, open) => [
        Math.cos(u * Math.PI * 2) * (0.02 + v * (0.015 + open * 0.08)),
        v * 0.14,
        Math.sin(u * Math.PI * 2) * (0.02 + v * (0.015 + open * 0.08)),
      ],
    },
  ],
  organs: [
    {
      name: "style",
      cluster: 0,
      points: [
        [0, 0, 0],
        [0, 0.05, 0],
        [0, 0.1, 0.01],
      ],
      radius: 0.003,
      color: "#efd6af",
    },
  ],
};
test("dense floret poses preserve the count, bounds and deterministic variation", () => {
  assert.deepEqual(prototype.poses, radialFloretPoses(48, 0.8, 0.1, 42));
  assert.equal(prototype.poses.length, 48);
  assert.ok(new Set(prototype.poses.map((p) => p.phase)).size > 40);
  for (const pose of prototype.poses) {
    assert.ok(Math.hypot(pose.position[0], pose.position[2]) <= 0.8);
    assert.ok(pose.scale > 0.8 && pose.scale < 1.2);
    assert.ok(
      [...pose.position, ...pose.rotation, pose.delay, pose.phase].every(
        Number.isFinite,
      ),
    );
  }
});
test("instances initialize transforms and folded normals before drawing, and reverse bloom without replacing resources", () => {
  const g = specimenInstanceGeometry(prototype, "low").surfaces[0],
    material = new MeshStandardMaterial();
  const mesh = new InstancedMesh(g, material, prototype.poses.length),
    target = new Mesh(g, material),
    dummy = new Object3D();
  updateFloretInstances(mesh, target, prototype.poses, 0, 0, 0, true, dummy);
  const texture = mesh.morphTexture!;
  assert.ok(texture);
  assert.equal(texture.image.height, 48);
  const transform = new Matrix4();
  mesh.getMatrixAt(10, transform);
  assert.ok(transform.determinant() > 0.5);
  for (const bloom of [1, 0.5, 0]) {
    updateFloretInstances(
      mesh,
      target,
      prototype.poses,
      bloom,
      5,
      1,
      false,
      dummy,
    );
    assert.equal(mesh.morphTexture, texture);
    mesh.getMorphAt(10, target);
    assert.ok(
      target.morphTargetInfluences![0] >= 0 &&
        target.morphTargetInfluences![0] <= 1,
    );
  }
  updateFloretInstances(mesh, target, prototype.poses, 0, 5, 1, true, dummy);
  mesh.getMorphAt(10, target);
  assert.equal(target.morphTargetInfluences![0], 1);
  texture.dispose();
  g.dispose();
  material.dispose();
  mesh.dispose();
});
test("repeated floret prototypes retain thick sealed walls and matched morph normals at every quality", () => {
  for (const quality of ["low", "medium", "high", "ultra"] as const) {
    const parts = specimenInstanceGeometry(prototype, quality);
    assert.equal(parts.surfaces.length, 1);
    assert.equal(parts.organs.length, 1);
    for (const g of [...parts.surfaces, ...parts.organs]) {
      assert.equal(
        g.morphAttributes.normal![0].count,
        g.getAttribute("normal").count,
      );
      for (const n of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
        for (let i = 0; i < n.count; i++)
          assert.ok(
            Math.abs(Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) - 1) < 0.002,
          );
      assert.ok(
        Array.from(g.morphAttributes.position![0].array).every(Number.isFinite),
      );
      g.dispose();
    }
    const g = parts.surfaces[0],
      p = g.getAttribute("position"),
      half = p.count / 2;
    for (let i = 0; i < half; i++)
      assert.ok(
        Math.hypot(
          p.getX(i) - p.getX(i + half),
          p.getY(i) - p.getY(i + half),
          p.getZ(i) - p.getZ(i + half),
        ) > 0.006,
      );
    const edges = new Map<string, number>(),
      ix = g.index!.array;
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((n) => n === 2));
  }
});
