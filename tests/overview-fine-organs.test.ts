import assert from "node:assert/strict";
import test from "node:test";
import { readdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { CatmullRomCurve3, Vector3, type BufferGeometry } from "three";
import { FLOWER_TYPES } from "../lib/flowers/types";
import {
  specimenOrganGeometry,
  specimenOrganParts,
  type SpecimenModel,
  type SpecimenOrgan,
} from "../lib/three/specimenModel";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";

const nextTen = new Set([
  "lupine",
  "hollyhock",
  "fritillaria",
  "tuberose",
  "ixora",
  "pentas",
  "torenia",
  "lobelia",
  "hoya",
  "impatiens",
]);

async function priorModels() {
  const directory = fileURLToPath(
    new URL("../components/flowers/", import.meta.url),
  );
  const models: { type: string; model: SpecimenModel }[] = [];
  for (const file of await readdir(directory, { recursive: true })) {
    if (!file.endsWith("Geometry.ts")) continue;
    const type = file.split(/[\\/]/)[0];
    if (
      !FLOWER_TYPES.includes(type as (typeof FLOWER_TYPES)[number]) ||
      nextTen.has(type)
    )
      continue;
    const exports = await import(pathToFileURL(resolve(directory, file)).href);
    for (const [name, model] of Object.entries(exports))
      if (name.endsWith("_MODEL"))
        models.push({ type, model: model as SpecimenModel });
  }
  return models;
}

function sealed(g: BufferGeometry) {
  const ix = g.index!.array,
    edges = new Map<string, number>();
  for (let i = 0; i < ix.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = ix[i + j],
        b = ix[i + ((j + 1) % 3)],
        key = a < b ? `${a}:${b}` : `${b}:${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok([...edges.values()].every((count) => count === 2));
}

test("only explicit fine organ opt-ins reduce circumference, keeping sealed caps and matching open/folded carrier samples", () => {
  const organ: SpecimenOrgan = {
    name: "small included stamen",
    cluster: 0,
    points: [
      [0, 0, 0],
      [0.02, 0.11, 0.02],
      [0.04, 0.19, -0.01],
    ],
    foldedPoints: [
      [0, 0, 0],
      [0.009, 0.065, 0.006],
      [0.012, 0.09, 0.01],
    ],
    radius: 0.006,
    endRadius: 0.004,
    overviewSides: 3,
    color: "#d5c5a4",
  };
  const actual = specimenOrganGeometry(organ, "overview"),
    original = specimenOrganGeometry(
      { ...organ, overviewSides: undefined },
      "overview",
    );
  assert.equal(actual.index!.count, 54);
  assert.equal(original.index!.count, 72);
  sealed(actual);
  for (const [positions, points] of [
    [actual.getAttribute("position"), organ.points],
    [actual.morphAttributes.position![0], organ.foldedPoints!],
  ] as const) {
    assert.equal(
      positions.count,
      11,
      "three transported rings and both anatomical cap centers remain",
    );
    const curve = new CatmullRomCurve3(points.map((p) => new Vector3(...p))),
      expected = new Vector3(),
      center = new Vector3();
    for (let row = 0; row <= 2; row++) {
      center.set(0, 0, 0);
      for (let side = 0; side < 3; side++) {
        const i = row * 3 + side;
        center.x += positions.getX(i) / 3;
        center.y += positions.getY(i) / 3;
        center.z += positions.getZ(i) / 3;
      }
      curve.getPointAt(row / 2, expected);
      assert.ok(
        center.distanceTo(expected) < organ.radius * 0.026 + 1e-7,
        "grain is bounded around the same exact carrier sample",
      );
    }
    for (const end of [0, 1]) {
      curve.getPointAt(end, expected);
      center.fromBufferAttribute(positions, 9 + end);
      assert.ok(
        center.distanceTo(expected) < 1e-7,
        "anatomical endpoints stay fixed",
      );
    }
  }
  for (const normals of [
    actual.getAttribute("normal"),
    actual.morphAttributes.normal![0],
  ])
    assert.ok(Array.from(normals.array).every(Number.isFinite));
  actual.dispose();
  original.dispose();
});

test("fine cross-sections reduce the real catalog workload with every emitted organ and floret retained", async () => {
  let before = 0,
    after = 0;
  for (const { model } of await priorModels()) {
    const original: SpecimenModel = {
      ...model,
      organs: model.organs.map((organ) => ({
        ...organ,
        overviewSides: undefined,
      })),
    };
    for (let cluster = 0; cluster < model.clusters.length; cluster++)
      for (const included of [false, true]) {
        const actual = specimenOrganParts(model, cluster, "overview", included),
          unhinted = specimenOrganParts(
            original,
            cluster,
            "overview",
            included,
          );
        assert.equal(actual.length, unhinted.length);
        actual.forEach(({ geometry }, i) => {
          after += geometry.index!.count;
          before += unhinted[i].geometry.index!.count;
          sealed(geometry);
          geometry.dispose();
          unhinted[i].geometry.dispose();
        });
      }
    for (const group of model.instances ?? []) {
      const actual = specimenInstanceGeometry(group, "overview"),
        unhinted = specimenInstanceGeometry(
          {
            ...group,
            organs: group.organs.map((organ) => ({
              ...organ,
              overviewSides: undefined,
            })),
          },
          "overview",
        );
      assert.equal(actual.organs.length, group.organs.length);
      actual.organs.forEach((geometry, i) => {
        after += geometry.index!.count * group.poses.length;
        before += unhinted.organs[i].index!.count * group.poses.length;
        sealed(geometry);
      });
      [
        ...actual.surfaces,
        ...actual.organs,
        ...unhinted.surfaces,
        ...unhinted.organs,
      ].forEach((geometry) => geometry.dispose());
    }
  }
  assert.ok(
    after < before * 0.95,
    `fine sections must save at least five percent: ${after} / ${before}`,
  );
});

test("explicit narrow organ hints leave all focused geometry and broad attachments unchanged", async () => {
  for (const { type, model } of await priorModels()) {
    const checked = new Set<string>();
    for (const organ of [
      ...model.organs,
      ...(model.instances ?? []).flatMap((group) => group.organs),
    ]) {
      if (organ.overviewSides === undefined) continue;
      if (organ.overviewSides < 4)
        assert.ok(
          organ.radius <= 0.012 &&
            (organ.endRadius ?? organ.radius * 0.6) <= 0.015,
          `${type} ${organ.name}`,
        );
      assert.ok(
        !/stalk|pedicel|spur/.test(organ.name),
        "diagnostic spurs and carrier shoots keep their original sections",
      );
      const key = `${organ.name}/${organ.radius}/${organ.flatten}`;
      if (checked.has(key)) continue;
      checked.add(key);
      for (const quality of ["low", "medium", "high", "ultra"] as const) {
        const actual = specimenOrganGeometry(organ, quality),
          original = specimenOrganGeometry(
            { ...organ, overviewSides: undefined },
            quality,
          );
        assert.deepEqual(actual.index!.array, original.index!.array);
        for (const name of Object.keys(original.attributes))
          assert.deepEqual(
            actual.getAttribute(name).array,
            original.getAttribute(name).array,
          );
        for (const name of ["position", "normal"] as const)
          for (
            let i = 0;
            i < (original.morphAttributes[name]?.length ?? 0);
            i++
          )
            assert.deepEqual(
              actual.morphAttributes[name]![i].array,
              original.morphAttributes[name]![i].array,
            );
        actual.dispose();
        original.dispose();
      }
    }
  }
});
