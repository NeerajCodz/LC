import test from "node:test";
import assert from "node:assert/strict";
import {
  SCABIOSA_MODEL,
  scabiosaCorolla,
} from "../components/flowers/scabiosa/scabiosaGeometry";
import {
  SCABIOSA_UPPER_LEAF,
  SCABIOSA_BASAL_LEAF,
  SCABIOSA_LEAF_TILT,
  SCABIOSA_BASAL_LEAF_POSES,
  createScabiosaUpperLeaf,
  createScabiosaBasalLeaf,
} from "../components/flowers/scabiosa/scabiosaLeaf";
import { specimenCages } from "../lib/three/specimenModel";
import {
  specimenInstanceGeometry,
  updateFloretInstances,
} from "../lib/three/floretInstances";
import {
  InstancedMesh,
  Mesh,
  MeshStandardMaterial,
  Object3D,
  Euler,
  Vector3,
} from "three";
import { verifySpecimen } from "./specimen-checks";
import { petalOpenness } from "../lib/three/easing";

verifySpecimen("scabiosa", SCABIOSA_MODEL);
verifySpecimen("scabiosa divided leaf", {
  clusters: SCABIOSA_MODEL.clusters,
  surfaces: [SCABIOSA_UPPER_LEAF, SCABIOSA_BASAL_LEAF],
  organs: [],
});
verifySpecimen("scabiosa inner floret", {
  clusters: SCABIOSA_MODEL.clusters,
  surfaces: SCABIOSA_MODEL.instances![1].surfaces,
  organs: [],
});

test("scabiosa: upper foliage and basal blades display the upper pigment above their underside", () => {
  const specimens = [
    {
      geometry: createScabiosaUpperLeaf("low"),
      rotations: [
        new Euler(SCABIOSA_LEAF_TILT, 0, 0.1, "YXZ"),
        new Euler(SCABIOSA_LEAF_TILT, Math.PI, 0.1, "YXZ"),
      ],
    },
    {
      geometry: createScabiosaBasalLeaf("low"),
      rotations: SCABIOSA_BASAL_LEAF_POSES.map(
        (pose) => new Euler(...pose.rotation),
      ),
    },
  ];
  for (const { geometry, rotations } of specimens) {
    const side = geometry.getAttribute("tissueSide"),
      normal = geometry.getAttribute("normal"),
      position = geometry.getAttribute("position"),
      half = position.count / 2,
      upper = side.getX(110) > 0 ? 110 : 110 + half,
      lower = upper < half ? upper + half : upper - half;
    for (const rotation of rotations) {
      const n = new Vector3()
          .fromBufferAttribute(normal, upper)
          .applyEuler(rotation),
        p = new Vector3()
          .fromBufferAttribute(position, upper)
          .applyEuler(rotation),
        below = new Vector3()
          .fromBufferAttribute(position, lower)
          .applyEuler(rotation);
      assert.ok(n.y > 0.7, "the upper pigment faces the sky, not the ground");
      assert.ok(p.y > below.y);
    }
    geometry.dispose();
  }
});

test("scabiosa: sixteen enlarged marginal flowers surround twenty-five real four-stamen inner florets", () => {
  assert.equal(SCABIOSA_MODEL.clusters.length, 1);
  assert.equal(
    SCABIOSA_MODEL.surfaces.filter((s) => s.name === "enlarged marginal floret")
      .length,
    16,
  );
  const marginal = SCABIOSA_MODEL.instances![0],
    inner = SCABIOSA_MODEL.instances![1];
  assert.equal(marginal.poses.length, 16);
  assert.equal(inner.poses.length, 25);
  assert.ok(inner.poses.every((p) => p.scale < 0.63));
  for (const group of [marginal, inner]) {
    assert.equal(
      group.organs.filter((o) => o.name === "stamen filament").length,
      4,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "stamen anther chamber").length,
      8,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "calyx bristle").length,
      5,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "inferior floret ovary").length,
      1,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "single protruding style").length,
      1,
    );
    assert.equal(
      group.organs.filter((o) => o.name === "lobed style tip").length,
      2,
    );
  }
  assert.equal(
    SCABIOSA_MODEL.surfaces.filter((s) => s.name === "green involucral bract")
      .length,
    10,
  );
});

test("scabiosa: fused corolla stays continuous around five unequal lobes rather than becoming a ray petal", () => {
  for (const bloom of [0, 0.5, 1]) {
    const a = scabiosaCorolla(0, 1, bloom),
      b = scabiosaCorolla(1, 1, bloom);
    a.forEach((value, i) => assert.ok(Math.abs(value - b[i]) < 1e-10));
  }
  const radial = (u: number) => {
    const p = scabiosaCorolla(u, 1, 1);
    return Math.hypot(p[0], p[2]);
  };
  const peaks: number[] = [];
  for (let i = 0; i < 1000; i++)
    if (
      radial(i / 1000) > radial((i - 1) / 1000) &&
      radial(i / 1000) > radial((i + 1) / 1000)
    )
      peaks.push(i);
  assert.equal(peaks.length, 5);
  assert.ok(radial(0) > radial(0.4) * 1.7);
  assert.ok(Math.abs(radial(0.2) - radial(0.8)) < 1e-10);
  const desktop = specimenCages(SCABIOSA_MODEL, false).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  const mobile = specimenCages(SCABIOSA_MODEL, true).patches.reduce(
    (sum, p) => sum + p.open.length / 3,
    0,
  );
  assert.equal(desktop, 1384);
  assert.equal(mobile, 462);
});

test("scabiosa: marginal reproductive organs follow the moving corolla insertion through reversed bloom", () => {
  const group = SCABIOSA_MODEL.instances![0];
  group.poses.forEach((pose, i) => {
    assert.equal(
      petalOpenness(0.5, pose.delay, pose.phase),
      petalOpenness(0.5, SCABIOSA_MODEL.surfaces[i].delay!, i * 0.31),
      "organ and enclosing corolla opening must match",
    );
    for (const open of [0, 0.5, 1]) {
      const surface = SCABIOSA_MODEL.surfaces[i],
        p = surface.sample(0, 0, open),
        origin = pose.foldedPosition!.map(
          (value, axis) => value + (pose.position[axis] - value) * open,
        );
      assert.ok(Math.abs(p[1] - origin[1]) < 1e-10);
      assert.ok(
        Math.abs(Math.hypot(p[0] - origin[0], p[2] - origin[2]) - 0.017) <
          1e-10,
      );
    }
  });
  for (const group of SCABIOSA_MODEL.instances!) {
    const parts = specimenInstanceGeometry(group, "overview");
    assert.equal(parts.organs.length, 21);
    for (const geometry of [...parts.surfaces, ...parts.organs]) {
      assert.equal(
        geometry.morphAttributes.normal![0].count,
        geometry.getAttribute("normal").count,
      );
      assert.ok(
        Array.from(geometry.morphAttributes.position![0].array).every(
          Number.isFinite,
        ),
      );
    }
    const material = new MeshStandardMaterial(),
      geometry = parts.organs[0],
      mesh = new InstancedMesh(geometry, material, group.poses.length),
      target = new Mesh(geometry, material),
      scratch = new Object3D();
    updateFloretInstances(mesh, target, group.poses, 0, 0, 0, true, scratch);
    const texture = mesh.morphTexture!;
    for (const bloom of [1, 0.5, 0]) {
      updateFloretInstances(
        mesh,
        target,
        group.poses,
        bloom,
        7,
        1,
        true,
        scratch,
      );
      assert.equal(mesh.morphTexture, texture);
    }
    assert.equal(texture.image.height, group.poses.length);
    texture.dispose();
    mesh.dispose();
    material.dispose();
    [...parts.surfaces, ...parts.organs].forEach((g) => g.dispose());
  }
});
