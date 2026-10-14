import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  Triangle,
  Vector3,
} from "three";
import { HOYA_MODEL } from "../components/flowers/hoya/hoyaGeometry";
import { specimenCages, specimenGeometry } from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";
import {
  CageDeformation,
  bindCageGeometry,
  bindCageRaycast,
} from "../lib/three/petalDeformation";
import { petalOpenness } from "../lib/three/easing";

test("hoya: real terminal roots stay inside or intersect the displaced corolla under bounded contact", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    triangle = new Triangle(),
    point = new Vector3(),
    back = new Vector3(),
    closest = new Vector3(),
    restPoint = new Vector3(),
    restBack = new Vector3(),
    direction = new Vector3(0.341, 0.729, 0.594).normalize();
  try {
    for (const constrained of [false, true]) {
      const { indices, patches } = specimenCages(HOYA_MODEL, constrained),
        sim = new PetalDynamics(patches, constrained),
        pose = new Object3D(),
        matrices = HOYA_MODEL.clusters.map((cluster) => {
          pose.position.set(...cluster.position);
          pose.rotation.set(...cluster.rotation);
          pose.scale.setScalar(cluster.scale);
          pose.updateMatrix();
          return pose.matrix.clone();
        }),
        inverses = indices.map((index) =>
          matrices[HOYA_MODEL.surfaces[index].cluster].clone().invert(),
        ),
        deformation = new CageDeformation(sim),
        quality = constrained ? "low" : "high",
        carrier = new Mesh(
          specimenGeometry(HOYA_MODEL.surfaces[0], quality),
          material,
        ),
        cleanup: (() => void)[] = [];
      assert.equal(sim.inverseMass.length, constrained ? 440 : 1100);
      bindCageGeometry(carrier.geometry, patches[0], sim.offsets[0]);
      cleanup.push(bindCageRaycast(carrier, deformation));
      const sectors = HOYA_MODEL.surfaces.flatMap((surface, index) => {
        if (
          surface.cluster !== 0 ||
          surface.name !== "contorted hoya terminal lobe tissue"
        )
          return [];
        const mesh = new Mesh(specimenGeometry(surface, quality), material);
        assert.equal(surface.cageAttachment?.surface, HOYA_MODEL.surfaces[0]);
        bindCageGeometry(mesh.geometry, patches[0], sim.offsets[0], {
          mapUv: surface.cageAttachment!.uv,
          thickness: surface.thickness,
        });
        assert.ok(
          Math.abs(
            mesh.geometry.getAttribute("cageSide").getX(0) -
              surface.thickness / 2,
          ) < 1e-9,
        );
        cleanup.push(bindCageRaycast(mesh, deformation));
        return [{ surface, index, mesh }];
      });
      deformation.setEnabled(true);
      try {
        for (const bloom of [1, 0.5, 0]) {
          indices.forEach((index, patch) => {
            const surface = HOYA_MODEL.surfaces[index];
            sim.setRest(
              patch,
              petalOpenness(bloom, surface.delay ?? 0, index * 0.31),
              matrices[surface.cluster].elements,
            );
          });
          sim.reset();
          carrier.morphTargetInfluences![0] =
            1 - petalOpenness(bloom, HOYA_MODEL.surfaces[0].delay ?? 0, 0);
          sectors.forEach(({ surface, index, mesh }) => {
            mesh.morphTargetInfluences![0] =
              1 - petalOpenness(bloom, surface.delay ?? 0, index * 0.31);
          });
          const firstFree = sim.inverseMass.findIndex((mass) => mass > 0),
            force = {
              wind: 2.4,
              pulse: 1,
              proximity: 1,
              time: 0,
              x: sim.rest[firstFree * 3],
              y: sim.rest[firstFree * 3 + 1],
              z: sim.rest[firstFree * 3 + 2],
            };
          for (let frame = 0; frame <= 40; frame++) {
            if (frame) {
              force.time = (frame - 1) / 60;
              sim.step(1 / 60, force);
            }
            if (frame % 20) continue;
            deformation.update(inverses);
            if (frame)
              assert.ok(
                deformation.data.some((value) => Math.abs(value) > 1e-5),
                "use actual nonzero displacement",
              );
            const positions = Array.from(
                { length: carrier.geometry.getAttribute("position").count },
                (_, i) => carrier.getVertexPosition(i, new Vector3()),
              ),
              index = carrier.geometry.index!;
            let movedRoot = 0;
            for (const { mesh } of sectors) {
              const uv = mesh.geometry.getAttribute("uv"),
                half = uv.count / 2;
              for (let i = 0; i < half && uv.getY(i) === 0; i++) {
                mesh.getVertexPosition(i, point);
                mesh.getVertexPosition(i + half, back);
                point.add(back).multiplyScalar(0.5);
                Mesh.prototype.getVertexPosition.call(mesh, i, restPoint);
                Mesh.prototype.getVertexPosition.call(mesh, i + half, restBack);
                restPoint.add(restBack).multiplyScalar(0.5);
                movedRoot = Math.max(movedRoot, point.distanceTo(restPoint));
                let distance = Infinity;
                for (let j = 0; j < index.count; j += 3) {
                  triangle.set(
                    positions[index.getX(j)],
                    positions[index.getX(j + 1)],
                    positions[index.getX(j + 2)],
                  );
                  triangle.closestPointToPoint(point, closest);
                  distance = Math.min(distance, closest.distanceTo(point));
                }
                const hits = new Raycaster(
                    point,
                    direction,
                    1e-8,
                    10,
                  ).intersectObject(carrier),
                  unique = hits.filter(
                    (hit, j) =>
                      !j ||
                      Math.abs(hit.distance - hits[j - 1].distance) > 1e-6,
                  ),
                  inside = unique.length % 2 === 1;
                assert.ok(
                  inside || distance <= 0.007 + 1e-7,
                  `${quality} bloom ${bloom} frame ${frame}: root is outside the displaced corolla by ${distance}, beyond its .007 half-thickness`,
                );
              }
            }
            if (frame)
              assert.ok(
                movedRoot > 1e-5,
                "terminal roots actually inherit nonzero cage displacement",
              );
          }
        }
      } finally {
        cleanup.forEach((unbind) => unbind());
        carrier.geometry.dispose();
        sectors.forEach(({ mesh }) => mesh.geometry.dispose());
        deformation.dispose();
      }
    }
  } finally {
    material.dispose();
  }
});
