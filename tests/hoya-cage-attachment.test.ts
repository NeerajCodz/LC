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

test("hoya: valvate roots stay in their cup and closed tips cover the apex under bounded contact", () => {
  const material = new MeshBasicMaterial({ side: DoubleSide }),
    triangle = new Triangle(),
    point = new Vector3(),
    back = new Vector3(),
    closest = new Vector3(),
    rest = new Vector3(),
    restBack = new Vector3(),
    direction = new Vector3(0.341, 0.729, 0.594).normalize(),
    parent = new Object3D(),
    pose = new Object3D();
  parent.position.set(0.7, -0.4, 0.2);
  parent.rotation.set(0.37, -0.51, 0.23);
  parent.scale.setScalar(1.15);
  parent.updateMatrix();
  const matrices = HOYA_MODEL.clusters.map((cluster) => {
    pose.position.set(...cluster.position);
    pose.rotation.set(...cluster.rotation);
    pose.scale.setScalar(cluster.scale);
    pose.updateMatrix();
    return parent.matrix.clone().multiply(pose.matrix);
  });
  try {
    for (const constrained of [false, true]) {
      const { indices, patches } = specimenCages(HOYA_MODEL, constrained),
        sim = new PetalDynamics(patches, constrained),
        inverses = indices.map((index) =>
          matrices[HOYA_MODEL.surfaces[index].cluster].clone().invert(),
        ),
        deformation = new CageDeformation(sim),
        cleanup: (() => void)[] = [];
      assert.equal(sim.inverseMass.length, constrained ? 440 : 1100);
      const studies = (["high", "low", "overview"] as const).flatMap(
        (quality) =>
          [0, 19].map((cluster) => {
            const cupSurface = HOYA_MODEL.surfaces.find(
              (surface) =>
                surface.cluster === cluster &&
                surface.name === "papillose five-lobed corolla",
            )!;
            assert.equal(cupSurface.flexible, undefined);
            const cup = new Mesh(
              specimenGeometry(cupSurface, quality),
              material,
            );
            cup.matrix.copy(matrices[cluster]);
            cup.matrixAutoUpdate = false;
            cup.updateMatrixWorld(true);
            const lobes = HOYA_MODEL.surfaces.flatMap((surface, index) => {
              if (
                surface.cluster !== cluster ||
                surface.name !== "valvate corolla lobe"
              )
                return [];
              const patch = indices.indexOf(index),
                mesh = new Mesh(specimenGeometry(surface, quality), material);
              assert.ok(patch >= 0, "every real lobe owns its production cage");
              bindCageGeometry(
                mesh.geometry,
                patches[patch],
                sim.offsets[patch],
              );
              // The ambient overview renderer does not run the tissue cage solver.
              if (quality !== "overview")
                cleanup.push(bindCageRaycast(mesh, deformation));
              mesh.matrix.copy(matrices[cluster]);
              mesh.matrixAutoUpdate = false;
              mesh.updateMatrixWorld(true);
              return [{ surface, index, mesh }];
            });
            assert.equal(lobes.length, 5);
            const cupVertices = Array.from(
              { length: cup.geometry.getAttribute("position").count },
              (_, i) =>
                cup
                  .getVertexPosition(i, new Vector3())
                  .applyMatrix4(cup.matrixWorld),
            );
            return { quality, cluster, cup, cupVertices, lobes };
          }),
      );
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
          for (const { lobes } of studies)
            for (const { surface, index, mesh } of lobes)
              mesh.morphTargetInfluences![0] =
                1 - petalOpenness(bloom, surface.delay ?? 0, index * 0.31);
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
            for (const {
              quality,
              cluster,
              cup,
              cupVertices,
              lobes,
            } of studies) {
              const context = `${constrained ? "mobile" : "desktop"} ${quality} cluster ${cluster} bloom ${bloom} frame ${frame}`,
                cupIndex = cup.geometry.index!,
                worldScale = 1.15 * HOYA_MODEL.clusters[cluster].scale;
              let movedFree = 0;
              for (const { mesh } of lobes) {
                const uv = mesh.geometry.getAttribute("uv"),
                  half = uv.count / 2;
                for (let i = 0; i < half; i++) {
                  mesh.getVertexPosition(i, point);
                  Mesh.prototype.getVertexPosition.call(mesh, i, rest);
                  if (uv.getY(i) !== 0) {
                    movedFree = Math.max(movedFree, point.distanceTo(rest));
                    continue;
                  }
                  mesh.getVertexPosition(i + half, back);
                  Mesh.prototype.getVertexPosition.call(
                    mesh,
                    i + half,
                    restBack,
                  );
                  point.add(back).multiplyScalar(0.5);
                  rest.add(restBack).multiplyScalar(0.5);
                  assert.ok(
                    point.distanceTo(rest) < 1e-7,
                    `${context}: basal lobe root midpoint must remain pinned`,
                  );
                  point.applyMatrix4(mesh.matrixWorld);
                  const hits = new Raycaster(
                      point,
                      direction,
                      1e-8,
                      10,
                    ).intersectObject(cup),
                    unique = hits.filter(
                      (hit, j) =>
                        !j ||
                        Math.abs(hit.distance - hits[j - 1].distance) > 1e-6,
                    );
                  if (unique.length % 2 === 1) continue;
                  let distance = Infinity;
                  for (let j = 0; j < cupIndex.count; j += 3) {
                    triangle.set(
                      cupVertices[cupIndex.getX(j)],
                      cupVertices[cupIndex.getX(j + 1)],
                      cupVertices[cupIndex.getX(j + 2)],
                    );
                    triangle.closestPointToPoint(point, closest);
                    distance = Math.min(distance, point.distanceTo(closest));
                  }
                  assert.ok(
                    distance <= (0.007 + 1e-7) * worldScale,
                    `${context}: root is outside the actual cup by ${distance / worldScale}`,
                  );
                }
              }
              if (frame && quality !== "overview")
                assert.ok(
                  movedFree > 1e-5,
                  `${context}: free tissue must move; measured ${movedFree}`,
                );
              if (bloom === 0 || cluster >= 19) {
                // Follow the real displaced apex; lateral bud bending is not an aperture.
                const apex = new Vector3();
                let tipCount = 0;
                for (const { mesh } of lobes) {
                  const uv = mesh.geometry.getAttribute("uv"),
                    half = uv.count / 2;
                  for (let i = 0; i < half; i++) {
                    if (uv.getY(i) !== 1) continue;
                    mesh.getVertexPosition(i, point);
                    mesh.getVertexPosition(i + half, back);
                    apex.add(point.add(back).multiplyScalar(0.5));
                    tipCount++;
                  }
                }
                apex.divideScalar(tipCount);
                for (const radius of [0, 0.012, 0.025, 0.04])
                  for (let azimuth = 0; azimuth < 20; azimuth++) {
                    const angle = (azimuth * Math.PI * 2) / 20,
                      origin = new Vector3(
                        radius * Math.cos(angle),
                        0.07,
                        radius * Math.sin(angle),
                      )
                        .add(apex)
                        .applyMatrix4(matrices[cluster]),
                      down = new Vector3(0, -1, 0).transformDirection(
                        matrices[cluster],
                      ),
                      ray = new Raycaster(origin, down, 0, 0.11 * worldScale);
                    assert.ok(
                      ray.intersectObjects(lobes.map(({ mesh }) => mesh))
                        .length > 0,
                      `${context}: open displaced apex at radius ${radius}, azimuth ${azimuth}`,
                    );
                  }
              }
            }
          }
        }
      } finally {
        cleanup.forEach((unbind) => unbind());
        for (const { cup, lobes } of studies) {
          cup.geometry.dispose();
          lobes.forEach(({ mesh }) => mesh.geometry.dispose());
        }
        deformation.dispose();
      }
    }
  } finally {
    material.dispose();
  }
});
