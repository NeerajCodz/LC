import test from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { Matrix3, Matrix4, Object3D, Vector3 } from "three";
import {
  writeHeadAttachmentVertex,
  writeStemNodeMatrix,
  writeStemVertex,
  type PlantAttachmentState,
} from "../lib/three/plantAttachments";
import { createOrganicTube } from "../lib/three/organicTube";
import { supportedBendSlope, supportedBendWeight } from "../lib/flowers/wind";
import { PANSY_STALKS } from "../components/flowers/pansy/pansyGeometry";
import { AFRICAN_VIOLET_STALKS } from "../components/flowers/african-violet/africanVioletGeometry";
import { BLUEBELL_STALKS } from "../components/flowers/bluebell/bluebellGeometry";
import { HYACINTH_STALKS } from "../components/flowers/hyacinth/hyacinthGeometry";
import { AMARYLLIS_STALKS } from "../components/flowers/amaryllis/amaryllisGeometry";
import { CANNA_STALKS } from "../components/flowers/canna/cannaGeometry";
import { AGAPANTHUS_STALKS } from "../components/flowers/agapanthus/agapanthusGeometry";
import { WISTERIA_MODEL } from "../components/flowers/wisteria/wisteriaGeometry";
import { BOTTLEBRUSH_MODEL } from "../components/flowers/bottlebrush/bottlebrushGeometry";
import { SCABIOSA_MODEL } from "../components/flowers/scabiosa/scabiosaGeometry";
import { specimenClusterPoint } from "../lib/three/specimenModel";
import type { Vec3 } from "../lib/flowers/types";

const STALKS = [
  {
    name: "pansy",
    length: 1.3,
    extras: PANSY_STALKS,
    path: "../components/flowers/pansy/Pansy.tsx",
  },
  {
    name: "african-violet",
    length: 0.54,
    extras: AFRICAN_VIOLET_STALKS,
    path: "../components/flowers/african-violet/AfricanViolet.tsx",
  },
  {
    name: "bluebell",
    length: 1.8,
    extras: BLUEBELL_STALKS,
    path: "../components/flowers/bluebell/Bluebell.tsx",
  },
  {
    name: "hyacinth",
    length: 1.2,
    extras: HYACINTH_STALKS,
    path: "../components/flowers/hyacinth/Hyacinth.tsx",
  },
  {
    name: "amaryllis",
    length: 2.2,
    extras: AMARYLLIS_STALKS,
    path: "../components/flowers/amaryllis/Amaryllis.tsx",
  },
  {
    name: "canna",
    length: 2.25,
    extras: CANNA_STALKS,
    path: "../components/flowers/canna/Canna.tsx",
  },
  {
    name: "agapanthus",
    length: 2.15,
    extras: AGAPANTHUS_STALKS,
    path: "../components/flowers/agapanthus/Agapanthus.tsx",
  },
] as const;

function stateFor(
  length: number,
  growth: number,
  windy: boolean,
  supportHeight = 0,
): PlantAttachmentState {
  const head = new Object3D(),
    motion = windy
      ? { x: 0.13, z: -0.09, drop: 0.018 }
      : { x: 0, z: 0, drop: 0 },
    free = length * Math.max(0.05, 1 - supportHeight);
  head.position.set(motion.x, -(1 - growth) * length - motion.drop, motion.z);
  head.rotation.set(
    (windy ? 0.16 : 0) + Math.atan2(motion.z * 1.5, free),
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

test("legacy extras reproduce the reported growth gaps before head attachment opt-in", () => {
  for (const [extra, length, expected] of [
    [
      BLUEBELL_STALKS.filter((s) => s.name === "nodding bell pedicel").at(-1)!,
      1.8,
      1.036,
    ],
    [PANSY_STALKS.at(-1)!, 1.3, 0.656],
  ] as const) {
    const tip = extra.points.at(-1)!,
      state = stateFor(length, 0.2, false),
      legacy = new Vector3(...tip),
      expectedHead = new Vector3(...tip).applyMatrix4(state.head);
    writeStemVertex(legacy, new Vector3(0, 0, 1), state);
    assert.ok(Math.abs(legacy.distanceTo(expectedHead) - expected) < 1e-10);
  }
});

for (const specimen of STALKS) {
  test(`${specimen.name}: opted-in rendered stalk ends meet head while real lower insertions stay rooted throughout growth and contact`, () => {
    const production = new URL(specimen.path, import.meta.url),
      prepared = new URL(
        specimen.path.replace(
          "../components/flowers/",
          "../dist/floral-forms-work/prepared/",
        ),
        import.meta.url,
      ),
      source = readFileSync(
        existsSync(production) ? production : prepared,
        "utf8",
      ),
      optedIn = /headExtras\s*:/.test(source),
      parent = new Object3D();
    parent.position.set(0.5, -0.2, 0.35);
    parent.rotation.set(0.17, 0.61, -0.13);
    parent.scale.setScalar(0.74);
    parent.updateMatrix();
    for (const growth of [0.03, 0.2, 0.5, 1])
      for (const windy of [false, true]) {
        const state = stateFor(specimen.length, growth, windy);
        for (const extra of specimen.extras) {
          const root = extra.points[0],
            tip = extra.points.at(-1)!,
            actual = new Vector3(...tip),
            normal = new Vector3(0, 0, 1),
            expected = new Vector3(...tip)
              .applyMatrix4(state.head)
              .applyMatrix4(parent.matrix);
          if (optedIn)
            writeHeadAttachmentVertex(actual, normal, root, tip, state);
          else writeStemVertex(actual, normal, state);
          actual.applyMatrix4(parent.matrix);
          assert.ok(
            actual.distanceTo(expected) < 1e-10,
            `${extra.name}/growth ${growth}/wind ${windy}: rendered stalk misses head by ${actual.distanceTo(expected)}`,
          );
          const actualRoot = new Vector3(...root),
            expectedRoot = new Vector3(...root);
          writeHeadAttachmentVertex(actualRoot, normal, root, tip, state);
          if (root[1] < 0)
            writeStemVertex(expectedRoot, new Vector3(0, 0, 1), state);
          else expectedRoot.applyMatrix4(state.head);
          assert.ok(
            actualRoot.distanceTo(expectedRoot) < 1e-10,
            `${extra.name}: lower insertion must not move rigidly with its flower`,
          );
        }
      }
    assert.ok(
      optedIn,
      "the actual species wrapper enables the shared head attachment pathway",
    );
  });

  test(`${specimen.name}: real sealed stalk vertices keep finite unit normals and noncollapsed triangles after the attachment transform`, () => {
    const point = new Vector3(),
      normal = new Vector3(),
      a = new Vector3(),
      b = new Vector3(),
      c = new Vector3();
    for (const extra of specimen.extras) {
      const geometry = createOrganicTube({
          ...extra,
          segments: 22,
          sides: 6,
          grain: 0.06,
        }),
        positions = geometry.getAttribute("position"),
        normals = geometry.getAttribute("normal"),
        root = extra.points[0],
        tip = extra.points.at(-1)!,
        output = new Float64Array(positions.count * 3),
        ix = geometry.index!.array;
      for (const growth of [0.03, 0.2, 0.5, 1])
        for (const windy of [false, true]) {
          const state = stateFor(specimen.length, growth, windy);
          for (let i = 0; i < positions.count; i++) {
            point.fromBufferAttribute(positions, i);
            normal.fromBufferAttribute(normals, i);
            writeHeadAttachmentVertex(point, normal, root, tip, state);
            assert.ok(
              [...point.toArray(), ...normal.toArray()].every(Number.isFinite),
            );
            assert.ok(Math.abs(normal.length() - 1) < 1e-10);
            output.set(point.toArray(), i * 3);
          }
          for (let i = 0; i < ix.length; i += 3) {
            a.fromArray(output, ix[i] * 3);
            b.fromArray(output, ix[i + 1] * 3);
            c.fromArray(output, ix[i + 2] * 3);
            assert.ok(
              b.sub(a).cross(c.sub(a)).length() > 1e-12,
              `${extra.name}: collapsed triangle at growth ${growth}`,
            );
          }
        }
      geometry.dispose();
    }
  });
}

for (const [name, model, length] of [
  ["wisteria", WISTERIA_MODEL, 3.4],
  ["bottlebrush", BOTTLEBRUSH_MODEL, 2.9],
  ["scabiosa", SCABIOSA_MODEL, 2.42],
] as const)
  test(`${name}: native head-owned stalk geometry keeps its actual cluster pose through growth and wind`, () => {
    for (const growth of [0.03, 0.2, 0.5, 1])
      for (const windy of [false, true]) {
        const state = stateFor(length, growth, windy);
        for (const organ of model.organs.filter((o) =>
          /shoot|stalk|pedicel|rachis|insertion/.test(o.name),
        ))
          for (const source of organ.points) {
            const local = specimenClusterPoint(
                model.clusters[organ.cluster],
                source,
              ),
              expected = new Vector3(...local).applyMatrix4(state.head),
              actual = new Vector3(...local),
              normal = new Vector3(0, 0, 1);
            writeHeadAttachmentVertex(
              actual,
              normal,
              [0, 0, 0],
              [0, 1, 0],
              state,
            );
            assert.ok(actual.distanceTo(expected) < 1e-10);
          }
      }
  });

test("attachment normals agree with the actual bridge Jacobian, including nonuniform growth", () => {
  const root: Vec3 = [0, -0.54, 0],
    tip: Vec3 = [0.22, 0.12, 0.16],
    normal = new Vector3(0.3, 0.6, 0.7).normalize(),
    source = new Vector3(0.08, -0.18, 0.04),
    epsilon = 1e-6;
  for (const growth of [0.03, 0.2, 0.5, 1]) {
    const state = stateFor(0.54, growth, true),
      columns = [];
    for (let axis = 0; axis < 3; axis++) {
      const plus = source.clone(),
        minus = source.clone();
      plus.setComponent(axis, plus.getComponent(axis) + epsilon);
      minus.setComponent(axis, minus.getComponent(axis) - epsilon);
      writeHeadAttachmentVertex(plus, normal.clone(), root, tip, state);
      writeHeadAttachmentVertex(minus, normal.clone(), root, tip, state);
      columns.push(plus.sub(minus).multiplyScalar(0.5 / epsilon));
    }
    const jacobian = new Matrix3().set(
      columns[0].x,
      columns[1].x,
      columns[2].x,
      columns[0].y,
      columns[1].y,
      columns[2].y,
      columns[0].z,
      columns[1].z,
      columns[2].z,
    );
    assert.ok(
      jacobian.determinant() > 0.1,
      "growth preserves positive tissue volume",
    );
    const expected = normal
        .clone()
        .applyMatrix3(jacobian.clone().invert().transpose())
        .normalize(),
      actual = normal.clone();
    writeHeadAttachmentVertex(source.clone(), actual, root, tip, state);
    assert.ok(actual.distanceTo(expected) < 1e-8);
  }
});

test("legacy stem deformation and supported lower insertions retain their prior clamped coefficients", () => {
  for (const supportHeight of [0, 0.72])
    for (const growth of [0.03, 0.2, 0.5, 1]) {
      const state = stateFor(3.4, growth, true, supportHeight);
      for (const y of [-3.4, -2.8, -1.7, 0, 0.5]) {
        const p = new Vector3(0.02, y, -0.03),
          n = new Vector3(0.4, 0.2, 0.8).normalize(),
          t = Math.max(0, Math.min(1, (y + 3.4) / 3.4)),
          w = supportedBendWeight(t, supportHeight),
          s = supportedBendSlope(t, supportHeight) / 3.4,
          expected = new Vector3(
            p.x + state.motion.x * w,
            -3.4 + (y + 3.4) * growth - state.motion.drop * w,
            p.z + state.motion.z * w,
          ),
          expectedNormal = new Vector3(
            n.x,
            (n.y - s * (n.x * state.motion.x + n.z * state.motion.z)) /
              Math.max(0.02, growth - state.motion.drop * s),
            n.z,
          ).normalize();
        writeStemVertex(p, n, state);
        assert.ok(p.distanceTo(expected) < 1e-12);
        assert.ok(n.distanceTo(expectedNormal) < 1e-12);
      }
      const root: Vec3 = [0, -2.8, 0],
        actual = new Vector3(...root),
        expected = new Vector3(...root),
        normal = new Vector3(1, 0, 0);
      writeHeadAttachmentVertex(actual, normal, root, [0.1, 0.5, 0.1], state);
      writeStemVertex(expected, normal, state);
      assert.ok(actual.distanceTo(expected) < 1e-12);
    }
});

test("unpitched node collars retain stem radius and the exact growth/bend node attachment", () => {
  for (const growth of [0.03, 0.2, 0.5, 1]) {
    const state = stateFor(2.25, growth, true),
      node = { t: 0.32, angle: 2.55 },
      matrix = new Matrix4();
    assert.equal(writeStemNodeMatrix(matrix, node, state), matrix);
    const center = new Vector3().applyMatrix4(matrix),
      t = node.t,
      w = supportedBendWeight(t, 0),
      expected = new Vector3(
        0.025 * Math.sin(t * Math.PI) + state.motion.x * w,
        -2.25 + 2.25 * t * growth - state.motion.drop * w,
        state.motion.z * w,
      );
    assert.ok(center.distanceTo(expected) < 1e-12);
    for (let i = 0; i < 16; i++) {
      const a = (i * Math.PI) / 8,
        ring = new Vector3(
          Math.sin(a) * 0.08,
          0,
          Math.cos(a) * 0.08,
        ).applyMatrix4(matrix);
      assert.ok(
        Math.abs(ring.y - center.y) < 1e-12,
        "a collar cannot inherit blade pitch or flutter",
      );
      assert.ok(
        Math.abs(ring.distanceTo(center) - 0.08) < 1e-12,
        "stem radius is independent of blade growth scale",
      );
    }
    assert.ok(matrix.determinant() > 0);
  }
});

test("render ordering shares the actual head matrix before opted-in stem attachments", () => {
  const plant = readFileSync(
      new URL("../components/flowers/FlowerPlant.tsx", import.meta.url),
      "utf8",
    ),
    stem = readFileSync(
      new URL("../components/flowers/BotanicalStem.tsx", import.meta.url),
      "utf8",
    );
  assert.match(plant, /name="flower-head"/);
  assert.ok(
    (plant.match(/attachmentHeadPose\.copy\(head\.current\.matrix\)/g) ?? [])
      .length >= 3,
    "initial, wind and garden-contact paths publish the actual pose",
  );
  assert.match(plant, /}, -2\)/);
  assert.match(stem, /anatomy\.headExtras\?\.length \? -0\.5 : 0/);
});
