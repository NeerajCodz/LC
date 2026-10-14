import assert from "node:assert/strict";
import test from "node:test";
import { Matrix4, Object3D, PerspectiveCamera, Vector3 } from "three";
import { ixoraStructure } from "../components/flowers/ixora/Ixora";
import { IXORA_MODEL } from "../components/flowers/ixora/ixoraGeometry";
import { pentasStructure } from "../components/flowers/pentas/Pentas";
import { PENTAS_MODEL } from "../components/flowers/pentas/pentasGeometry";
import {
  specimenGeometry,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import type { FlowerStructure, Vec3 } from "../lib/flowers/types";
import * as framing from "../lib/flowers/framing";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";

const studies = [
  { name: "ixora", structure: ixoraStructure, model: IXORA_MODEL },
  { name: "pentas", structure: pentasStructure, model: PENTAS_MODEL },
];

/** Area vector of the actual generated terminal rim, directed toward the upper face. */
function actualFaces(
  model: SpecimenModel,
  structure: FlowerStructure,
  quality: "overview" | "high",
) {
  return model.surfaces
    .filter((s) => s.role === "tube" && s.flexible && s.cluster < 19)
    .map((surface) => {
      const geometry = specimenGeometry(surface, quality),
        position = geometry.getAttribute("position"),
        uv = geometry.getAttribute("uv"),
        half = position.count / 2,
        pose = new Object3D(),
        cluster = model.clusters[surface.cluster];
      pose.position.set(...cluster.position);
      pose.rotation.set(...cluster.rotation);
      pose.scale.setScalar(cluster.scale);
      pose.updateMatrix();
      const head = new Matrix4()
          .makeRotationX(structure.headTilt)
          .premultiply(
            new Matrix4().makeTranslation(0, structure.stemLength - 1.78, 0),
          ),
        matrix = head.multiply(pose.matrix),
        vertices: Vector3[] = [];
      for (let i = 0; i < half; i++)
        if (uv.getY(i) === 1)
          vertices.push(
            new Vector3()
              .fromBufferAttribute(position, i)
              .add(new Vector3().fromBufferAttribute(position, i + half))
              .multiplyScalar(0.5)
              .applyMatrix4(matrix),
          );
      const center = new Vector3(),
        area = new Vector3(),
        cross = new Vector3(),
        axis = new Vector3(0, 1, 0).transformDirection(matrix);
      for (let i = 0; i < vertices.length; i++) {
        center.add(vertices[i]);
        area.add(
          cross.crossVectors(vertices[i], vertices[(i + 1) % vertices.length]),
        );
      }
      center.multiplyScalar(1 / vertices.length);
      if (area.dot(axis) < 0) area.negate();
      assert.ok(area.length() > 1e-4, "real finite corolla rim");
      geometry.dispose();
      return { center, normal: area.normalize(), vertices };
    });
}

function faceIncidence(
  face: ReturnType<typeof actualFaces>[number],
  position: Vec3,
) {
  return face.normal.dot(new Vector3(...position).sub(face.center).normalize());
}

test("upright Ixora and Pentas portraits expose actual mature star faces instead of their edges", () => {
  for (const { name, structure, model } of studies)
    for (const quality of ["overview", "high"] as const) {
      const faces = actualFaces(model, structure, quality);
      assert.equal(faces.length, 19, "all mature corollas retained");
      for (const [width, height] of [
        [1280, 800],
        [390, 844],
      ])
        for (const azimuth of [0, Math.PI / 4]) {
          const pose = framing.flowerPortraitPose(
            structure,
            [0, -1.78, 0],
            width / height,
            38,
            azimuth,
            width >= 700,
          )!;
          for (const face of faces)
            assert.ok(
              faceIncidence(face, pose.position) >= 0.45,
              `${name} ${quality} ${width}x${height} view${azimuth}: projected face ratio ${faceIncidence(face, pose.position)}`,
            );
          const camera = new PerspectiveCamera(38, width / height, 0.1, 45);
          camera.position.set(...pose.position);
          camera.lookAt(...pose.target);
          camera.updateMatrixWorld();
          for (let corner = 0; corner < 8; corner++) {
            const bounds = structure.portraitBounds!,
              point = new Vector3(
                corner & 1 ? bounds.max[0] : bounds.min[0],
                structure.stemLength -
                  1.78 +
                  (corner & 2 ? bounds.max[1] : bounds.min[1]),
                corner & 4 ? bounds.max[2] : bounds.min[2],
              ).project(camera);
            assert.ok(
              Math.abs(point.x) < 0.79 &&
                Math.abs(point.y) < 0.79 &&
                point.z > -1 &&
                point.z < 1,
              "elevated portraits keep complete planted bounds",
            );
          }
        }
    }
});

test("cyme public, garden and preview macro camera poses preserve distance while revealing real limb faces", () => {
  for (const { name, structure, model } of studies) {
    const target = framing.flowerHeadTarget(structure, [0, -1.78, 0]),
      faces = actualFaces(model, structure, "high");
    for (const [distance, rise] of [
      [3 * Math.sqrt(structure.previewScale!), 0.32],
      [4.2, 0.32],
      [7, 0.32],
      [2.8, 0.9 / 2.8],
    ])
      for (const azimuth of [0, Math.PI / 4]) {
        const pose = framing.flowerCameraPose(
          structure,
          target,
          distance,
          azimuth,
          rise,
        );
        assert.ok(
          Math.abs(
            new Vector3(...pose.position).distanceTo(new Vector3(...target)) -
              distance * Math.hypot(1, rise),
          ) < 1e-9,
          "camera elevation retains actual existing distance",
        );
        for (const face of faces)
          assert.ok(
            faceIncidence(face, pose.position) >= 0.45,
            `${name} macro projected face ratio ${faceIncidence(face, pose.position)}`,
          );
      }
  }
});

test("metadata-free cameras and explicit cyme side diagnostics retain their existing offsets", () => {
  const target: Vec3 = [0.13, 0.27, -0.11];
  for (const structure of Object.values(FLOWER_STRUCTURES)) {
    if (structure.cameraElevation !== undefined) continue;
    for (const azimuth of [0, Math.PI / 4, Math.PI / 2])
      for (const distance of [2.8, 3.1, 7]) {
        const expected: Vec3 = [
          target[0] + Math.sin(azimuth) * distance,
          target[1] + distance * 0.32,
          target[2] + Math.cos(azimuth) * distance,
        ];
        assert.deepEqual(
          framing.flowerCameraPose(structure, target, distance, azimuth)
            .position,
          expected,
        );
      }
  }
  for (const { structure, model } of studies) {
    assert.equal(structure.headTilt, 0, "anatomical axes remain upright");
    assert.equal(
      model.clusters.length,
      22,
      "all authored flowers and buds remain",
    );
    assert.equal(
      framing.flowerCameraElevation(structure, Math.PI / 2),
      undefined,
    );
    const legacy = { ...structure, cameraElevation: undefined };
    for (const aspect of [1280 / 800, 390 / 844])
      assert.deepEqual(
        framing.flowerPortraitPose(
          structure,
          [0, -1.78, 0],
          aspect,
          38,
          Math.PI / 2,
          aspect > 1,
        ),
        framing.flowerPortraitPose(
          legacy,
          [0, -1.78, 0],
          aspect,
          38,
          Math.PI / 2,
          aspect > 1,
        ),
      );
    assert.deepEqual(
      framing.flowerCameraPose(structure, target, 3, Math.PI / 2),
      framing.flowerCameraPose(legacy, target, 3, Math.PI / 2),
    );
  }
});
