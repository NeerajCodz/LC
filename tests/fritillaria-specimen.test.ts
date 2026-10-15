import test from "node:test";
import assert from "node:assert/strict";
import {
  DoubleSide,
  Euler,
  Matrix4,
  Mesh,
  MeshBasicMaterial,
  Raycaster,
  Triangle,
  Vector3,
} from "three";
import {
  FRITILLARIA_MODEL,
  FRITILLARIA_STALKS,
  fritillariaTepal,
} from "../components/flowers/fritillaria/fritillariaGeometry";
import {
  FRITILLARIA_LEAF,
  FRITILLARIA_FOLIAGE_NODES,
} from "../components/flowers/fritillaria/fritillariaLeaf";
import {
  specimenClusterPoint,
  specimenOrganParts,
  specimenGeometry,
  specimenOrganGeometry,
  specimenOrganCarrier,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
import { petalOpenness } from "../lib/three/easing";

for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
  test(`fritillaria: ${quality} nectaries face inward and attach beneath all six real tepal walls through bloom`, () => {
    const material = new MeshBasicMaterial({ side: DoubleSide }),
      ray = new Raycaster(),
      point = new Vector3(),
      folded = new Vector3();
    try {
      for (let cluster = 1; cluster <= 5; cluster++) {
        const tepals = FRITILLARIA_MODEL.surfaces.flatMap((surface, index) =>
            surface.cluster === cluster &&
            surface.name === "separate bell tepal"
              ? [{ surface, index }]
              : [],
          ),
          nectaries = FRITILLARIA_MODEL.organs.filter(
            (organ) =>
              organ.cluster === cluster && organ.name === "pale basal nectary",
          ),
          shells = tepals.map(
            ({ surface }) =>
              new Mesh(specimenGeometry(surface, quality), material),
          ),
          pads = nectaries.map(
            (organ) =>
              new Mesh(specimenOrganGeometry(organ, quality), material),
          ),
          meshes = [...shells, ...pads],
          carrier = specimenOrganCarrier(FRITILLARIA_MODEL, cluster);
        assert.equal(shells.length, 6);
        assert.equal(pads.length, 6);
        meshes.forEach((mesh) => {
          mesh.updateMorphTargets();
          mesh.updateMatrixWorld(true);
        });
        for (const pad of pads)
          for (const normal of [
            pad.geometry.getAttribute("normal"),
            pad.geometry.morphAttributes.normal![0],
          ])
            for (let vertex = 0; vertex < normal.count; vertex++)
              assert.ok(
                Math.abs(
                  Math.hypot(
                    normal.getX(vertex),
                    normal.getY(vertex),
                    normal.getZ(vertex),
                  ) - 1,
                ) < 0.002,
                "rolled open/folded nectary normals remain finite unit vectors",
              );
        try {
          for (const bloom of [1, 0.5, 0]) {
            shells.forEach((mesh, j) => {
              const { surface, index } = tepals[j];
              mesh.morphTargetInfluences![0] =
                1 - petalOpenness(bloom, surface.delay ?? 0, index * 0.31);
            });
            const organOpen = petalOpenness(
              bloom,
              carrier.delay,
              carrier.phase,
            );
            pads.forEach((mesh) => {
              mesh.morphTargetInfluences![0] = 1 - organOpen;
            });
            for (let j = 0; j < 6; j++) {
              const a = (j * Math.PI) / 3,
                outward = new Vector3(Math.sin(a), 0, Math.cos(a)),
                tangent = new Vector3(Math.cos(a), 0, -Math.sin(a)),
                tepal = tepals[j].surface,
                open = 1 - shells[j].morphTargetInfluences![0];
              point
                .set(...tepal.sample(0.5, 0.1, 1))
                .lerp(folded.set(...tepal.sample(0.5, 0.1, 0)), 1 - open);
              ray.set(
                new Vector3(outward.x, point.y, outward.z),
                outward.clone().negate(),
              );
              ray.near = 0;
              ray.far = 2;
              const outside = ray.intersectObjects(meshes, false);
              assert.ok(outside.length > 0);
              assert.ok(
                shells.some((shell) => shell === outside[0].object),
                `cluster ${cluster}, pad ${j}, bloom ${bloom}: exterior first hit must be tepal, not nectary`,
              );

              ray.set(new Vector3(0, point.y, 0), outward);
              const inside = ray.intersectObjects(meshes, false);
              assert.equal(
                inside[0]?.object,
                pads[j],
                `cluster ${cluster}, pad ${j}, bloom ${bloom}: nectary must remain visible from inside`,
              );
              const padHits = inside.filter((hit) => hit.object === pads[j]),
                wallHits = inside.filter((hit) => hit.object === shells[j]);
              assert.ok(padHits.length >= 2 && wallHits.length >= 2);
              assert.ok(
                padHits.at(-1)!.distance >= wallHits[0].distance,
                `cluster ${cluster}, pad ${j}, bloom ${bloom}: pad must overlap the inner tepal wall`,
              );

              pads[j].getVertexPosition(
                pads[j].geometry.getAttribute("position").count - 2,
                point,
              );
              ray.set(point, new Vector3(0.341, 0.729, 0.594).normalize());
              ray.near = 1e-8;
              const rootHits = ray.intersectObject(shells[j], false),
                unique = rootHits.filter(
                  (hit, k) =>
                    !k ||
                    Math.abs(hit.distance - rootHits[k - 1].distance) > 1e-6,
                );
              assert.equal(
                unique.length % 2,
                1,
                `cluster ${cluster}, pad ${j}, bloom ${bloom}: actual root cap center must remain inside its tepal solid`,
              );

              const geometry = pads[j].geometry,
                position = geometry.getAttribute("position"),
                sides = quality === "overview" ? 4 : quality === "low" ? 7 : 12,
                segments =
                  quality === "overview" ? 4 : quality === "low" ? 10 : 24,
                ring = Math.floor(segments / 2),
                center = new Vector3()
                  .fromArray(nectaries[j].points[1])
                  .lerp(
                    new Vector3().fromArray(nectaries[j].foldedPoints![1]),
                    1 - organOpen,
                  );
              let tangentWidth = 0,
                radialThickness = 0;
              for (let side = 0; side < sides; side++) {
                pads[j].getVertexPosition(ring * sides + side, point);
                point.sub(center);
                tangentWidth = Math.max(
                  tangentWidth,
                  Math.abs(point.dot(tangent)),
                );
                radialThickness = Math.max(
                  radialThickness,
                  Math.abs(point.dot(outward)),
                );
              }
              assert.ok(
                tangentWidth > radialThickness * 2,
                `cluster ${cluster}, pad ${j}, bloom ${bloom}: broad ellipse must be tangential`,
              );
              assert.equal(
                position.count,
                geometry.morphAttributes.normal![0].count,
              );
              // Actual upper/lower and silhouette sections must also stay behind
              // the curved wall; a center-only ray could miss an exposed edge.
              for (const station of new Set([
                1,
                Math.floor(segments / 4),
                ring,
                Math.floor((segments * 3) / 4),
                segments - 1,
              ])) {
                const sectionCenter = new Vector3();
                for (let side = 0; side < sides; side++)
                  sectionCenter.add(
                    pads[j].getVertexPosition(station * sides + side, point),
                  );
                sectionCenter.divideScalar(sides);
                let sectionWidth = 0;
                for (let side = 0; side < sides; side++) {
                  pads[j].getVertexPosition(station * sides + side, point);
                  sectionWidth = Math.max(
                    sectionWidth,
                    Math.abs(point.sub(sectionCenter).dot(tangent)),
                  );
                }
                for (const silhouette of [-0.8, 0, 0.8]) {
                  ray.set(
                    outward
                      .clone()
                      .addScaledVector(tangent, sectionWidth * silhouette)
                      .setY(sectionCenter.y),
                    outward.clone().negate(),
                  );
                  ray.near = 0;
                  ray.far = 2;
                  const hits = ray.intersectObjects(meshes, false);
                  assert.ok(
                    hits.length > 0 &&
                      shells.some((shell) => shell === hits[0].object),
                    `cluster ${cluster}, pad ${j}, bloom ${bloom}, section ${station}, edge ${silhouette}: exterior first hit must remain tepal`,
                  );
                }
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
test("fritillaria: generated epitepalous stamen roots intersect their sealed tepal walls through closed/half/full bloom", () => {
  for (const quality of ["low", "high"] as const)
    for (let cluster = 1; cluster < 6; cluster++) {
      const tepals = FRITILLARIA_MODEL.surfaces.filter(
          (s) => s.cluster === cluster && s.name === "separate bell tepal",
        ),
        stamens = FRITILLARIA_MODEL.organs.filter(
          (o) =>
            o.cluster === cluster &&
            o.name === "crown imperial stamen filament",
        );
      assert.equal(stamens.length, 6);
      for (let j = 0; j < 6; j++) {
        const shell = specimenGeometry(tepals[j], quality),
          tube = specimenOrganGeometry(stamens[j], quality),
          positions = shell.getAttribute("position"),
          folded = shell.morphAttributes.position![0],
          indices = shell.index!.array,
          stem = tube.getAttribute("position"),
          stemFolded = tube.morphAttributes.position![0],
          rootIndex = stem.count - 2,
          triangle = new Triangle(),
          scratch = new Vector3(),
          nearest = new Vector3();
        try {
          for (const open of [1, 0.5, 0]) {
            const root = new Vector3()
                .fromBufferAttribute(stem, rootIndex)
                .lerp(
                  new Vector3().fromBufferAttribute(stemFolded, rootIndex),
                  1 - open,
                ),
              vertex = (index: number, target: Vector3) =>
                target
                  .fromBufferAttribute(positions, index)
                  .lerp(scratch.fromBufferAttribute(folded, index), 1 - open);
            let distance = Infinity;
            for (let k = 0; k < indices.length; k += 3) {
              vertex(indices[k], triangle.a);
              vertex(indices[k + 1], triangle.b);
              vertex(indices[k + 2], triangle.c);
              triangle.closestPointToPoint(root, nearest);
              distance = Math.min(distance, root.distanceTo(nearest));
            }
            assert.ok(
              distance < tepals[j].thickness * 0.5 + stamens[j].radius,
              `${quality} cluster ${cluster} stamen ${j} bloom ${open}: gap ${distance}`,
            );
          }
        } finally {
          shell.dispose();
          tube.dispose();
        }
      }
    }
});
test("fritillaria: the cheap head-carried axis uses an identity carrier and preserves every positive insertion under the head pose", () => {
  const model = FRITILLARIA_MODEL,
    stalks = FRITILLARIA_STALKS,
    axis = model.clusters[0],
    head = new Matrix4()
      .makeRotationFromEuler(new Euler(0.17, -0.12, 0.07))
      .setPosition(0.21, -0.06, -0.08);
  assert.deepEqual(axis.position, [0, 0, 0]);
  assert.deepEqual(axis.rotation, [0, 0, 0]);
  assert.equal(axis.scale, 1);
  assert.equal(axis.nod, 0);
  for (const stalk of stalks) {
    assert.equal(stalk.cluster, 0);
    assert.ok(stalk.points[0][1] >= 0);
    assert.equal(
      model.organs.filter((o) => o === stalk).length,
      1,
      "the complete render model contains each axis organ exactly once",
    );
    const geometry = specimenOrganGeometry(stalk, "overview"),
      positions = geometry.getAttribute("position");
    try {
      for (const end of [false, true]) {
        const vertex = new Vector3().fromBufferAttribute(
            positions,
            positions.count - (end ? 1 : 2),
          ),
          actual = new Vector3(
            ...specimenClusterPoint(axis, [vertex.x, vertex.y, vertex.z]),
          ).applyMatrix4(head),
          expected = new Vector3(
            ...(end ? stalk.points.at(-1)! : stalk.points[0]),
          ).applyMatrix4(head);
        assert.ok(actual.distanceTo(expected) < 1e-6, stalk.name);
      }
    } finally {
      geometry.dispose();
    }
  }
});
verifySpecimen("fritillaria", FRITILLARIA_MODEL);
verifySpecimen("fritillaria leaf", {
  clusters: [],
  surfaces: [FRITILLARIA_LEAF],
  organs: [],
});
test("fritillaria: five pendant bells keep six distinct tepals, stamens, nectaries and three stigma divisions", () => {
  assert.equal(FRITILLARIA_MODEL.clusters.length, 6);
  assert.equal(
    FRITILLARIA_MODEL.surfaces.filter(
      (s) => s.name === "narrow upright crown bract",
    ).length,
    12,
  );
  for (let c = 1; c < 6; c++) {
    const surfaces = FRITILLARIA_MODEL.surfaces.filter((s) => s.cluster === c),
      organs = FRITILLARIA_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      surfaces.filter((s) => s.name === "separate bell tepal").length,
      6,
    );
    assert.ok(surfaces.every((s) => !s.periodic));
    assert.equal(
      organs.filter((o) => o.name === "crown imperial stamen filament").length,
      6,
    );
    assert.equal(
      organs.filter((o) => o.name === "crown imperial stamen anther chamber")
        .length,
      12,
    );
    assert.equal(
      organs.filter((o) => o.name === "pale basal nectary").length,
      6,
    );
    assert.equal(
      organs.filter((o) => o.name === "tripartite stigma division").length,
      3,
    );
    const root = specimenClusterPoint(
        FRITILLARIA_MODEL.clusters[c],
        fritillariaTepal(0)(0.5, 0, 1),
      ),
      tip = specimenClusterPoint(
        FRITILLARIA_MODEL.clusters[c],
        fritillariaTepal(0)(0.5, 1, 1),
      );
    assert.ok(tip[1] < root[1] - 0.5, "the true tepals hang beneath the crown");
  }
});
test("fritillaria: the crown stays above the bell insertions and lower foliage keeps three six-leaf whorls", () => {
  const bracts = FRITILLARIA_MODEL.surfaces.filter(
    (s) => s.name === "narrow upright crown bract",
  );
  for (const s of bracts) assert.ok(s.sample(0.5, 0, 1)[1] > 0.6);
  const pedicels = FRITILLARIA_STALKS.filter(
    (o) => o.name === "nodding crown imperial pedicel",
  );
  pedicels.forEach((o, i) =>
    assert.deepEqual(
      o.points.at(-1),
      FRITILLARIA_MODEL.clusters[i + 1].position,
    ),
  );
  assert.equal(FRITILLARIA_FOLIAGE_NODES.length, 18);
  assert.deepEqual(
    [...new Set(FRITILLARIA_FOLIAGE_NODES.map((n) => n.t))],
    [0.14, 0.25, 0.36],
  );
});
test("fritillaria: basal nectaries and every reproductive organ retain actual matched bloom buffers on mobile", () => {
  for (const quality of ["overview", "low"] as const)
    for (let c = 1; c < 6; c++) {
      const parts = specimenOrganParts(FRITILLARIA_MODEL, c, quality, true);
      try {
        assert.equal(parts.length, 29);
        for (const p of parts)
          assert.equal(
            p.geometry.morphAttributes.normal![0].count,
            p.geometry.getAttribute("normal").count,
          );
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
});
test("fritillaria: its complete overview head preserves anatomy under the indexed-input target", () => {
  let inputs = 0;
  for (const s of FRITILLARIA_MODEL.surfaces) {
    const g = specimenGeometry(s, "overview");
    inputs += g.index!.count;
    g.dispose();
  }
  for (const o of FRITILLARIA_MODEL.organs) {
    const g = specimenOrganGeometry(o, "overview");
    inputs += g.index!.count;
    g.dispose();
  }
  assert.ok(inputs < 100000, String(inputs));
});

test("fritillaria is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "fritillaria");
  assert.ok(type, "fritillaria catalog integration is missing");
  assert.equal(getFlower(type).latin, "Fritillaria imperialis");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
