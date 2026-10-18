import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  PerspectiveCamera,
  Raycaster,
  Vector3,
  type BufferGeometry,
} from "three";
import { fitInspectionBounds } from "../lib/three/inspectionFraming";
import { createOrganicTube } from "../lib/three/organicTube";
import { FRITILLARIA_MODEL } from "../components/flowers/fritillaria/fritillariaGeometry";
import {
  createFritillariaLeaf,
  FRITILLARIA_FOLIAGE_NODES,
  FRITILLARIA_LEAF_TILT,
} from "../components/flowers/fritillaria/fritillariaLeaf";
import {
  specimenGeometry,
  specimenOrganGeometry,
} from "../lib/three/specimenModel";
import {
  inspectionStudies,
  inspectionStudyFrame,
} from "../lib/three/inspectionStudies";

test("underside cameras expose all six nectaries and paired anthers through the real surrounding anatomy", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide });
  try {
    for (const quality of [
      "overview",
      "low",
      "medium",
      "high",
      "ultra",
    ] as const) {
      const meshes: Mesh[] = [],
        targets: Mesh[] = [];
      const add = (geometry: BufferGeometry, cluster: number, name: string) => {
        const pose = FRITILLARIA_MODEL.clusters[cluster],
          mesh = new Mesh(geometry, material);
        mesh.position.set(...pose.position);
        mesh.rotation.set(...pose.rotation);
        mesh.scale.setScalar(pose.scale);
        mesh.updateMatrixWorld();
        meshes.push(mesh);
        if (cluster === 1 && /nectary|anther chamber/.test(name))
          targets.push(mesh);
      };
      try {
        for (const surface of FRITILLARIA_MODEL.surfaces)
          add(
            specimenGeometry(surface, quality),
            surface.cluster,
            surface.name,
          );
        for (const organ of FRITILLARIA_MODEL.organs)
          add(specimenOrganGeometry(organ, quality), organ.cluster, organ.name);
        // BotanicalStem's settled negative-Y axis is separate from the model's
        // head-carried positive-Y stalks and remains a potential occluder too.
        add(
          createOrganicTube({
            points: [
              [0, -2.2, 0],
              [0.025, -2.2 * 0.55, 0],
              [0, 0, 0],
            ],
            radius: 0.042 * 1.2,
            endRadius: 0.042,
            color: "#73904f",
            segments: quality === "overview" || quality === "low" ? 40 : 80,
            sides: quality === "overview" || quality === "low" ? 10 : 18,
            grain: 0.05,
          }),
          0,
          "main stem",
        );
        // Include actual foliage with BotanicalStem's settled attachment transform.
        for (const node of FRITILLARIA_FOLIAGE_NODES) {
          const mesh = new Mesh(createFritillariaLeaf(quality), material);
          mesh.position.set(
            0.025 * Math.sin(node.t * Math.PI),
            -2.2 + 2.2 * node.t,
            0,
          );
          mesh.rotation.set(FRITILLARIA_LEAF_TILT, node.angle, 0.1, "YXZ");
          mesh.scale.setScalar(node.scale);
          mesh.updateMatrixWorld();
          meshes.push(mesh);
        }
        assert.equal(targets.length, 6 + 6 * 2);
        for (const study of inspectionStudies("fritillaria")) {
          const frame = inspectionStudyFrame(study, quality, new Matrix4());
          for (const aspect of [1.04, 1.24, 1.5]) {
            const pose = fitInspectionBounds(
                frame.box,
                aspect,
                36,
                frame.target,
                frame,
              ),
              origin = new Vector3(...pose.position),
              ray = new Raycaster(),
              point = new Vector3(),
              scratch = new Vector3();
            for (const mesh of targets) {
              const position = mesh.geometry.getAttribute("position"),
                index = mesh.geometry.index!;
              let visible = false;
              for (
                let i = 0;
                i < index.count;
                i += Math.max(3, Math.floor(index.count / 60 / 3) * 3)
              ) {
                point.set(0, 0, 0);
                for (let j = 0; j < 3; j++)
                  point.add(
                    scratch.fromBufferAttribute(position, index.getX(i + j)),
                  );
                point.multiplyScalar(1 / 3).applyMatrix4(mesh.matrixWorld);
                ray.set(origin, scratch.copy(point).sub(origin).normalize());
                ray.far = origin.distanceTo(point) + 0.0001;
                if (ray.intersectObjects(meshes, false)[0]?.object === mesh) {
                  visible = true;
                  break;
                }
              }
              assert.ok(
                visible,
                `${quality} ${study.name} aspect ${aspect}: organ ${targets.indexOf(mesh)} is fully occluded`,
              );
            }
          }
        }
      } finally {
        meshes.forEach((mesh) => mesh.geometry.dispose());
      }
    }
  } finally {
    material.dispose();
  }
});

test("targeted inspection frames real single-flower anatomy at every geometry tier and bloom pose", async () => {
  const studies = await import("../lib/three/inspectionStudies").catch(
    () => null,
  );
  assert.ok(studies, "targeted inspection studies are missing");
  assert.equal(studies.inspectionStudies("rose").length, 0);
  for (const type of ["fritillaria", "hoya", "torenia"] as const) {
    const descriptors = studies.inspectionStudies(type);
    assert.equal(descriptors.length, 2);
    const head = new Matrix4()
      .makeRotationX(type === "hoya" ? 0.93 : 0)
      .setPosition(0, 0.25, 0);
    for (const quality of [
      "overview",
      "low",
      "medium",
      "high",
      "ultra",
    ] as const)
      for (const study of descriptors) {
        const frame = studies.inspectionStudyFrame(study, quality, head);
        assert.ok(!frame.box.isEmpty());
        const size = frame.box.getSize(new Vector3());
        if (type === "torenia")
          assert.ok(
            size.x < 0.68 && size.y < 0.56 && size.z < 0.85,
            "frame must contain one trumpet rather than the whole flowering shoot",
          );
        else
          assert.ok(
            size.length() < 1,
            "frame must contain one flower rather than the complete umbel/crown",
          );
        const pose = fitInspectionBounds(
          frame.box,
          1.04,
          36,
          frame.target,
          frame,
        );
        const camera = new PerspectiveCamera(36, 1.04, 0.01, 100);
        camera.position.set(...pose.position);
        camera.up.set(...pose.up);
        camera.lookAt(...pose.target);
        camera.updateMatrixWorld();
        for (let i = 0; i < 8; i++) {
          const p = new Vector3(
            i & 1 ? frame.box.max.x : frame.box.min.x,
            i & 2 ? frame.box.max.y : frame.box.min.y,
            i & 4 ? frame.box.max.z : frame.box.min.z,
          ).project(camera);
          assert.ok(
            Math.abs(p.x) <= 0.91 &&
              Math.abs(p.y) <= 0.91 &&
              p.z >= -1 &&
              p.z <= 1,
          );
        }
      }
  }
});
