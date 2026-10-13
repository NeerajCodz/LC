import test from "node:test";
import assert from "node:assert/strict";
import { FLOWERS } from "../lib/flowers/catalog";
import { FLOWER_TYPES } from "../lib/flowers/types";
test("bluebell is registered with its English bluebell taxon", () => {
  assert.ok((FLOWER_TYPES as readonly string[]).includes("bluebell"));
  assert.equal(
    FLOWERS.find((f) => (f.type as string) === "bluebell")?.latin,
    "Hyacinthoides non-scripta",
  );
});
import {
  DoubleSide,
  Euler,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  Vector3,
} from "three";
import {
  BLUEBELL_MODEL,
  BLUEBELL_STALKS,
  bluebellAxis,
  bluebellPerianth,
} from "../components/flowers/bluebell/bluebellGeometry";
import {
  BLUEBELL_LEAF,
  BLUEBELL_LEAF_POSES,
} from "../components/flowers/bluebell/bluebellLeaf";
import { verifySpecimen } from "./specimen-checks";
import { specimenGeometry } from "../lib/three/specimenModel";
import { createOrganicTube } from "../lib/three/organicTube";
import {
  writeHeadAttachmentVertex,
  writeStemVertex,
  type PlantAttachmentState,
} from "../lib/three/plantAttachments";

test("bluebell: adaxial green faces upward on the composed drooping basal blades", () => {
  const geometry = specimenGeometry(BLUEBELL_LEAF, "low");
  for (const normal of [
    geometry.getAttribute("normal"),
    geometry.morphAttributes.normal![0],
  ])
    for (const [i, pose] of BLUEBELL_LEAF_POSES.entries())
      for (const row of [4, 8, 12]) {
        const index = row * 13 + 6,
          upper = new Vector3(
            normal.getX(index),
            normal.getY(index),
            normal.getZ(index),
          )
            .applyEuler(new Euler(...pose.rotation))
            .applyEuler(new Euler(-0.1, 0, 0.1, "YXZ"));
        assert.ok(
          upper.y > 0.075,
          `leaf ${i} at ${row / 16}: upper pigment follows the upper face, y=${upper.y}`,
        );
      }
  geometry.dispose();
});

test("bluebell: dedicated anatomy preserves its defining floral arrangement", () => {
  assert.equal(BLUEBELL_MODEL.clusters.length, 10);
  assert.equal(
    BLUEBELL_MODEL.surfaces.filter((s) => s.name === "nodding six-lobed bell")
      .length,
    10,
  );
  for (let i = 0; i < 10; i++) {
    const c = BLUEBELL_MODEL.clusters[i];
    assert.ok(
      c.position[0] > bluebellAxis(i / 9)[0],
      "flowers must all sit on one side of the raceme",
    );
    const axis = new Vector3(0, 1, 0).applyEuler(new Euler(...c.rotation));
    assert.ok(axis.y < -0.5, "English bluebell mouths must nod downwards");
    const organs = BLUEBELL_MODEL.organs.filter((o) => o.cluster === i);
    const filaments = organs.filter((o) => o.name === "stamen filament");
    assert.equal(filaments.length, 6);
    assert.equal(
      organs.filter((o) => o.name === "stamen anther chamber").length,
      12,
    );
    assert.ok(
      Math.max(...filaments.map((o) => o.points[2][1])) -
        Math.min(...filaments.map((o) => o.points[2][1])) >
        0.075,
    );
    assert.ok(
      organs
        .filter((o) => o.name === "stamen anther chamber")
        .every((o) => o.color === "#f1efe0"),
    );
    assert.equal(
      organs.filter((o) => o.name === "included central style").length,
      1,
    );
  }
  const pedicels = BLUEBELL_STALKS.filter(
    (o) => o.name === "nodding bell pedicel",
  );
  pedicels.forEach((p, i) => {
    assert.deepEqual(p.points[0], bluebellAxis(i / 9));
    assert.deepEqual(p.points.at(-1), BLUEBELL_MODEL.clusters[i].position);
  });
});

test("bluebell: continuous perianth keeps six recurved tips and tightly enclosed terminal buds", () => {
  const radial = (u: number, young = false) => {
    const p = bluebellPerianth(u, 1, 1, young);
    return Math.hypot(p[0], p[2]);
  };
  for (let i = 0; i < 6; i++) {
    assert.ok(radial(i / 6) > radial((i + 0.5) / 6) + 0.09);
    assert.ok(
      bluebellPerianth(i / 6, 1, 1)[1] <
        bluebellPerianth((i + 0.5) / 6, 1, 1)[1] - 0.1,
    );
  }
  assert.ok(radial(0, true) < radial(0) * 0.25);
  assert.deepEqual(
    bluebellPerianth(0, 0.52, 0.5),
    bluebellPerianth(1, 0.52, 0.5).map((n, i) => (i === 2 ? 0 : n)),
  );
  assert.equal(BLUEBELL_LEAF_POSES.length, 5);
});

verifySpecimen("bluebell", BLUEBELL_MODEL);
test("bluebell: terminal buds close with six overlapping thick tepal tips each", () => {
  for (const cluster of [8, 9]) {
    const tips = BLUEBELL_MODEL.surfaces.filter(
      (s) =>
        s.cluster === cluster && s.name === "imbricated closed-bud tepal tip",
    );
    assert.equal(
      tips.length,
      6,
      "a continuous bell wall needs overlapping terminal tepal tissue to close its bud",
    );
    tips.forEach((s, i) => {
      const a = (i * Math.PI) / 3,
        p = s.sample(0.5, 1, 1);
      assert.ok(
        p[0] * Math.cos(a) + p[2] * Math.sin(a) < 0,
        "each pointed tepal crosses the bud axis without collapsing its width",
      );
      assert.ok(s.thickness >= 0.012);
    });
  }
});
verifySpecimen("bluebell foliage", {
  clusters: BLUEBELL_MODEL.clusters.slice(0, 1),
  surfaces: [BLUEBELL_LEAF],
  organs: [],
});

test("bluebell: generated raceme root intersects the actual main shoot at full and early growth with wind", () => {
  const axis = BLUEBELL_STALKS.find(
      (s) => s.name === "one-sided arched raceme axis",
    )!,
    point = new Vector3(),
    normal = new Vector3(),
    end = new Vector3(),
    direction = new Vector3(),
    ray = new Raycaster(),
    material = new MeshBasicMaterial({ side: DoubleSide });
  for (const detail of [
    { segments: 22, sides: 6, stemSegments: 40, stemSides: 10 },
    { segments: 44, sides: 10, stemSegments: 80, stemSides: 18 },
  ])
    for (const growth of [0.03, 0.2, 0.5, 1])
      for (const windy of [false, true]) {
        const motion = windy
            ? { x: 0.13, z: -0.09, drop: 0.018 }
            : { x: 0, z: 0, drop: 0 },
          head = new Object3D();
        head.position.set(
          motion.x,
          -(1 - growth) * 1.8 - motion.drop,
          motion.z,
        );
        head.rotation.set(
          Math.atan2(motion.z * 1.5, 1.8),
          0,
          -Math.atan2(motion.x * 1.5, 1.8),
        );
        head.updateMatrix();
        const state: PlantAttachmentState = {
            stemLength: 1.8,
            supportHeight: 0,
            growth,
            motion,
            head: head.matrix,
          },
          stem = createOrganicTube({
            points: [
              [0, -1.8, 0],
              [0.025, -0.99, 0],
              [0, 0, 0],
            ],
            radius: 0.023 * 1.2,
            endRadius: 0.023,
            segments: detail.stemSegments,
            sides: detail.stemSides,
            grain: 0.05,
          }),
          raceme = createOrganicTube({
            ...axis,
            segments: detail.segments,
            sides: detail.sides,
            grain: 0.06,
          });
        for (const [geometry, isRaceme] of [
          [stem, false],
          [raceme, true],
        ] as const) {
          const positions = geometry.getAttribute("position"),
            normals = geometry.getAttribute("normal");
          for (let i = 0; i < positions.count; i++) {
            point.fromBufferAttribute(positions, i);
            normal.fromBufferAttribute(normals, i);
            if (isRaceme)
              writeHeadAttachmentVertex(
                point,
                normal,
                axis.points[0],
                axis.points.at(-1)!,
                state,
              );
            else writeStemVertex(point, normal, state);
            assert.ok(
              Number.isFinite(
                point.x + point.y + point.z + normal.x + normal.y + normal.z,
              ),
            );
            assert.ok(Math.abs(normal.length() - 1) < 1e-10);
            positions.setXYZ(i, point.x, point.y, point.z);
            normals.setXYZ(i, normal.x, normal.y, normal.z);
          }
          geometry.computeBoundingBox();
          geometry.computeBoundingSphere();
        }
        const sp = stem.getAttribute("position"),
          rp = raceme.getAttribute("position"),
          root = new Vector3().fromBufferAttribute(rp, rp.count - 2),
          shootEnd = new Vector3().fromBufferAttribute(sp, sp.count - 1);
        assert.ok(
          root.distanceTo(shootEnd) < 1e-6,
          `growth ${growth}/wind ${windy}: actual cap-center gap ${root.distanceTo(shootEnd)}`,
        );
        const mesh = new Mesh(stem, material);
        mesh.updateMatrixWorld(true);
        const edges = new Set<string>(),
          ix = raceme.index!.array;
        let intersection = false;
        for (let i = 0; i < ix.length && !intersection; i += 3)
          for (let side = 0; side < 3; side++) {
            const a = ix[i + side],
              b = ix[i + ((side + 1) % 3)];
            if (
              a >= detail.sides * 2 &&
              b >= detail.sides * 2 &&
              a !== rp.count - 2 &&
              b !== rp.count - 2
            )
              continue;
            const key = a < b ? `${a}:${b}` : `${b}:${a}`;
            if (edges.has(key)) continue;
            edges.add(key);
            point.fromBufferAttribute(rp, a);
            end.fromBufferAttribute(rp, b);
            direction.subVectors(end, point);
            const length = direction.length();
            if (length < 1e-12) continue;
            ray.set(point, direction.multiplyScalar(1 / length));
            ray.near = 0;
            ray.far = length + 1e-8;
            intersection = ray
              .intersectObject(mesh, false)
              .some(
                (hit) => hit.distance > 1e-7 && hit.distance < length - 1e-7,
              );
          }
        assert.ok(
          intersection,
          `growth ${growth}/wind ${windy}: real root-ring edges must intersect the sealed shoot mesh`,
        );
        stem.dispose();
        raceme.dispose();
      }
  material.dispose();
});
