import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { Matrix3, Matrix4, Object3D, Vector3 } from "three";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import type { FlowerStructure, Quality } from "../lib/flowers/types";
import { supportedBendSlope, supportedBendWeight } from "../lib/flowers/wind";
import { createOrganicTube } from "../lib/three/organicTube";
import {
  specimenOrganGeometry,
  specimenOrganParts,
} from "../lib/three/specimenModel";
import {
  writeHeadAttachmentVertex,
  writeStemVertex,
  type PlantAttachmentState,
} from "../lib/three/plantAttachments";
import { CYMES_MODELS } from "./cymes-and-spikes-models";

const MODEL_QUALITIES: Quality[] = [
  "overview",
  "low",
  "medium",
  "high",
  "ultra",
];

function stalkCarrier(
  specimen: (typeof CYMES_MODELS)[number],
  cluster: number,
) {
  const pose = specimen.model.clusters[cluster],
    carrier = new Object3D();
  carrier.position.set(...pose.position);
  carrier.rotation.set(...pose.rotation);
  carrier.scale.setScalar(pose.scale);
  carrier.updateMatrix();
  return carrier.matrix.clone();
}

function registeredStructure(slug: string) {
  const entry = Object.entries(FLOWER_STRUCTURES).find(
    ([type]) => type === slug,
  );
  assert.ok(entry, `${slug}: the integrated structure is registered`);
  return entry[1];
}

function stateFor(
  structure: FlowerStructure,
  growth: number,
  windy: boolean,
): PlantAttachmentState {
  const head = new Object3D(),
    length = structure.stemLength,
    supportHeight = structure.supportHeight ?? 0,
    motion = windy
      ? { x: 0.13, z: -0.09, drop: 0.018 }
      : { x: 0, z: 0, drop: 0 },
    free = length * Math.max(0.05, 1 - supportHeight);
  head.position.set(motion.x, -(1 - growth) * length - motion.drop, motion.z);
  head.rotation.set(
    structure.headTilt + (windy ? 0.016 : 0) + Math.atan2(motion.z * 1.5, free),
    0,
    -Math.atan2(motion.x * 1.5, free),
  );
  head.updateMatrix();
  return {
    stemLength: length,
    supportHeight,
    growth,
    motion,
    head: head.matrix.clone(),
  };
}

for (const specimen of CYMES_MODELS) {
  test(`${specimen.slug}: actual pedicels meet each floral cluster through growth, nodding and head contact`, () => {
    const structure = registeredStructure(specimen.slug),
      source = readFileSync(
        new URL(
          `../components/flowers/${specimen.slug}/${specimen.component}.tsx`,
          import.meta.url,
        ),
        "utf8",
      ),
      parent = new Object3D(),
      cluster = new Object3D();
    if (specimen.attachment === "model") {
      assert.match(
        source,
        new RegExp(`model=\\{${specimen.slug.toUpperCase()}_MODEL\\}`),
      );
      assert.doesNotMatch(
        source,
        /headExtras\s*:/,
        "model-carried axes must not be duplicated in the stem bridge",
      );
      const axis = specimen.model.clusters[0];
      assert.deepEqual(axis.position, [0, 0, 0]);
      assert.deepEqual(axis.rotation, [0, 0, 0]);
      assert.equal(axis.scale, 1);
      assert.equal(
        axis.nod,
        0,
        "the carrier remains fixed while each flower nods at its insertion",
      );
      for (const stalk of specimen.stalks) {
        assert.equal(stalk.cluster, 0);
        assert.ok(stalk.points.every((point) => point[1] >= 0));
        assert.equal(
          specimen.model.organs.filter((organ) => organ === stalk).length,
          1,
        );
      }
    } else {
      assert.match(
        source,
        new RegExp(
          `headExtras\\s*:\\s*${specimen.slug.toUpperCase()}_STALKS\\b`,
        ),
        "the production wrapper uses the real lower-insertion stem bridge",
      );
      for (const stalk of specimen.stalks)
        assert.equal(
          specimen.model.organs.filter((organ) => organ === stalk).length,
          0,
          "bridge stalks are not duplicated in the render model",
        );
    }
    parent.position.set(0.5, -0.2, 0.35);
    parent.rotation.set(0.17, 0.61, -0.13);
    parent.scale.set(0.74, 0.91, 1.13);
    parent.updateMatrix();
    const flowers = specimen.model.clusters.slice(specimen.firstFlowerCluster),
      pedicels = specimen.stalks.slice(1);
    assert.equal(
      pedicels.length,
      flowers.length,
      "every authored flower has a carrier",
    );
    for (const growth of [0.03, 0.2, 0.5, 1])
      for (const windy of [false, true]) {
        const state = stateFor(structure, growth, windy);
        if (specimen.attachment === "model") {
          const root = specimen.stalks[0].points[0],
            axisRoot = new Vector3(...root).applyMatrix4(state.head),
            stemTip = new Vector3(0, 0, 0);
          assert.deepEqual(root, [0, 0, 0]);
          writeStemVertex(stemTip, new Vector3(0, 0, 1), state);
          assert.ok(
            axisRoot.distanceTo(stemTip) < 1e-10,
            "the model-carried axis meets the actual deformed stem tip",
          );
        }
        pedicels.forEach((stalk, index) => {
          const pose = flowers[index],
            root = stalk.points[0],
            tip = stalk.points.at(-1)!;
          assert.deepEqual(
            tip,
            pose.position,
            `${stalk.name}: stalk endpoint is the actual floral insertion`,
          );
          // Cluster rotation animates the flower around its insertion, not around its head center.
          cluster.position.set(...pose.position);
          cluster.rotation.set(
            pose.rotation[0] + (windy ? pose.nod * 0.4 : 0),
            pose.rotation[1],
            pose.rotation[2] + (windy ? pose.nod : 0),
          );
          cluster.scale.setScalar(pose.scale);
          cluster.updateMatrix();
          const expected = new Vector3()
              .applyMatrix4(cluster.matrix)
              .applyMatrix4(state.head)
              .applyMatrix4(parent.matrix),
            actual = new Vector3(...tip),
            normal = new Vector3(0, 0, 1);
          if (specimen.attachment === "model")
            actual
              .applyMatrix4(stalkCarrier(specimen, stalk.cluster))
              .applyMatrix4(state.head);
          else writeHeadAttachmentVertex(actual, normal, root, tip, state);
          actual.applyMatrix4(parent.matrix);
          assert.ok(
            actual.distanceTo(expected) < 1e-10,
            `${specimen.slug}/${index}/growth ${growth}/wind ${windy}: detached floral carrier`,
          );
        });
        for (const stalk of specimen.stalks) {
          const root = stalk.points[0],
            tip = stalk.points.at(-1)!,
            actual = new Vector3(...root),
            expected = new Vector3(...root);
          if (specimen.attachment === "model")
            actual
              .applyMatrix4(stalkCarrier(specimen, stalk.cluster))
              .applyMatrix4(state.head);
          else
            writeHeadAttachmentVertex(
              actual,
              new Vector3(0, 0, 1),
              root,
              tip,
              state,
            );
          if (specimen.attachment === "bridge" && root[1] < 0)
            writeStemVertex(expected, new Vector3(0, 0, 1), state);
          else expected.applyMatrix4(state.head);
          assert.ok(
            actual.distanceTo(expected) < 1e-10,
            `${stalk.name}: lower insertion follows its real carrier`,
          );
        }
      }
    if (specimen.attachment === "model")
      for (const quality of MODEL_QUALITIES) {
        const parts = specimenOrganParts(specimen.model, 0, quality, false),
          included = specimenOrganParts(specimen.model, 0, quality, true);
        try {
          assert.equal(
            included.length,
            0,
            "axes never enter the shrinking or folding bloom partition",
          );
          assert.equal(
            parts.length,
            specimen.stalks.length,
            "every actual stalk is drawn once, with no duplicate geometry",
          );
          for (const stalk of specimen.stalks) {
            const matching = parts.filter((part) => part.organ === stalk);
            assert.equal(
              matching.length,
              1,
              `${quality}: the renderer retains ${stalk.name} exactly once`,
            );
            const geometry = matching[0].geometry,
              positions = geometry.getAttribute("position"),
              normals = geometry.getAttribute("normal");
            assert.ok(geometry.index);
            assert.equal(geometry.morphAttributes.position?.length ?? 0, 0);
            for (const growth of [0.03, 0.2, 0.5, 1])
              for (const windy of [false, true]) {
                const state = stateFor(structure, growth, windy),
                  world = parent.matrix
                    .clone()
                    .multiply(state.head)
                    .multiply(stalkCarrier(specimen, stalk.cluster)),
                  normalMatrix = new Matrix3().getNormalMatrix(world);
                for (const end of [false, true]) {
                  const cap = positions.count - (end ? 1 : 2),
                    point = new Vector3()
                      .fromBufferAttribute(positions, cap)
                      .applyMatrix4(world),
                    expected = new Vector3(
                      ...(end ? stalk.points.at(-1)! : stalk.points[0]),
                    )
                      .applyMatrix4(state.head)
                      .applyMatrix4(parent.matrix),
                    normal = new Vector3()
                      .fromBufferAttribute(normals, cap)
                      .applyNormalMatrix(normalMatrix);
                  assert.ok(
                    geometry.index.array.includes(cap),
                    "the endpoint is part of the real indexed cap",
                  );
                  assert.ok(
                    point.distanceTo(expected) < 1e-6,
                    `${quality}/${stalk.name}: detached indexed cap`,
                  );
                  assert.ok(normal.toArray().every(Number.isFinite));
                  assert.ok(Math.abs(normal.length() - 1) < 1e-10);
                }
              }
          }
        } finally {
          for (const { geometry } of [...parts, ...included])
            geometry.dispose();
        }
      }
  });

  test(`${specimen.slug}: actual sealed stalk tissue remains nondegenerate with unit normals after attachment transforms`, () => {
    const structure = registeredStructure(specimen.slug),
      point = new Vector3(),
      normal = new Vector3(),
      a = new Vector3(),
      b = new Vector3(),
      c = new Vector3(),
      parent = new Object3D();
    parent.position.set(0.5, -0.2, 0.35);
    parent.rotation.set(0.17, 0.61, -0.13);
    parent.scale.set(0.74, 0.91, 1.13);
    parent.updateMatrix();
    for (const stalk of specimen.stalks)
      for (const quality of specimen.attachment === "model"
        ? MODEL_QUALITIES
        : (["low", "high"] as Quality[])) {
        // Use each path's real renderer geometry, including model-carried overview axes.
        const geometry =
            specimen.attachment === "model"
              ? specimenOrganGeometry(stalk, quality)
              : createOrganicTube({
                  ...stalk,
                  segments: quality === "low" ? 22 : 44,
                  sides: quality === "low" ? 6 : 10,
                  grain: 0.06,
                }),
          positions = geometry.getAttribute("position"),
          normals = geometry.getAttribute("normal"),
          root = stalk.points[0],
          tip = stalk.points.at(-1)!,
          transformed = new Float64Array(positions.count * 3),
          indices = geometry.index!.array;
        try {
          for (const growth of [0.03, 0.2, 0.5, 1])
            for (const windy of [false, true]) {
              const state = stateFor(structure, growth, windy);
              const world = new Matrix4()
                  .multiplyMatrices(parent.matrix, state.head)
                  .multiply(stalkCarrier(specimen, stalk.cluster)),
                modelNormal = new Matrix3().getNormalMatrix(world),
                parentNormal = new Matrix3().getNormalMatrix(parent.matrix);
              for (let vertex = 0; vertex < positions.count; vertex++) {
                point.fromBufferAttribute(positions, vertex);
                normal.fromBufferAttribute(normals, vertex);
                if (specimen.attachment === "model") {
                  point.applyMatrix4(world);
                  normal.applyNormalMatrix(modelNormal);
                } else {
                  writeHeadAttachmentVertex(point, normal, root, tip, state);
                  point.applyMatrix4(parent.matrix);
                  normal.applyNormalMatrix(parentNormal);
                }
                assert.ok(
                  [...point.toArray(), ...normal.toArray()].every(
                    Number.isFinite,
                  ),
                );
                assert.ok(Math.abs(normal.length() - 1) < 1e-10);
                transformed.set(point.toArray(), vertex * 3);
              }
              for (let triangle = 0; triangle < indices.length; triangle += 3) {
                a.fromArray(transformed, indices[triangle] * 3);
                b.fromArray(transformed, indices[triangle + 1] * 3);
                c.fromArray(transformed, indices[triangle + 2] * 3);
                assert.ok(
                  b.sub(a).cross(c.sub(a)).length() > 1e-12,
                  `${specimen.slug}/${stalk.name}: collapsed triangle at growth ${growth}`,
                );
              }
            }
        } finally {
          geometry.dispose();
        }
      }
  });
}

test("hoya: the registered support keeps the planting point and supported shoot still under lateral contact", () => {
  const structure = registeredStructure("hoya"),
    support = structure.supportHeight;
  assert.ok(support !== undefined && support > 0 && support < 1);
  const state = stateFor(structure, 1, true);
  for (const height of [0, support / 2, support]) {
    const original = new Vector3(
        0,
        -structure.stemLength + height * structure.stemLength,
        0,
      ),
      actual = original.clone();
    writeStemVertex(actual, new Vector3(1, 0, 0), state);
    assert.equal(supportedBendWeight(height, support), 0);
    assert.equal(supportedBendSlope(height, support), 0);
    assert.ok(actual.distanceTo(original) < 1e-12);
  }
  const free = new Vector3(0, 0, 0);
  writeStemVertex(free, new Vector3(1, 0, 0), state);
  assert.ok(
    free.length() > 0.1,
    "the free shoot still responds above the fixed support",
  );
});
