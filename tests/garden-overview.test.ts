import assert from "node:assert/strict";
import test from "node:test";
import { readdir } from "node:fs/promises";
import { fileURLToPath, pathToFileURL } from "node:url";
import { resolve } from "node:path";
import { FLOWER_TYPES, type Quality } from "../lib/flowers/types";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import { createPetalGeometry } from "../lib/three/geometry";
import { createCoreGrainGeometry } from "../lib/three/coreGeometry";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import { specimenInstanceBatches } from "../lib/three/floretBatches";
import { HYDRANGEA_MODEL } from "../components/flowers/hydrangea/hydrangeaGeometry";
import { PROTEA_MODEL } from "../components/flowers/king-protea/proteaGeometry";
import { GERBERA_MODEL } from "../components/flowers/gerbera/gerberaGeometry";
import { ZINNIA_MODEL } from "../components/flowers/zinnia/zinniaGeometry";
import { TORENIA_MODEL } from "../components/flowers/torenia/toreniaGeometry";
import {
  TORENIA_RENDER_MODEL,
  createToreniaStigmaGeometry,
} from "../components/flowers/torenia/toreniaStigmaGeometry";
import {
  specimenGeometry,
  type SpecimenSurface,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { createOrganBatch, organBatchGroups } from "../lib/three/organBatch";
import { createParametricShell } from "../lib/three/parametricShell";
import {
  createSurfaceBatch,
  surfaceBatchGroups,
} from "../lib/three/surfaceBatch";

test("all catalog dedicated heads leave room for stems and foliage within the native overview draw budget", async (t) => {
  const directory = fileURLToPath(
    new URL("../components/flowers/", import.meta.url),
  );
  let submitted = 0;
  const covered = new Set<string>();
  for (const file of await readdir(directory, { recursive: true })) {
    if (!file.endsWith("Geometry.ts")) continue;
    const type = file.split(/[\\/]/)[0];
    if (!FLOWER_TYPES.includes(type as (typeof FLOWER_TYPES)[number])) continue;
    const exports = await import(pathToFileURL(resolve(directory, file)).href);
    for (const [name, value] of Object.entries(exports)) {
      if (!name.endsWith("_MODEL") || name.endsWith("_RENDER_MODEL")) continue;
      const model = value as SpecimenModel;
      assert.ok(!covered.has(type), `${type} is counted once`);
      covered.add(type);
      const renderModel = type === "torenia" ? TORENIA_RENDER_MODEL : model,
        sensitive =
          type === "torenia"
            ? TORENIA_MODEL.surfaces.filter(
                (s) => s.name === "bilamellate torenia stigma",
              )
            : [],
        batches = surfaceBatchGroups(renderModel);
      assert.equal(
        batches.reduce((n, group) => n + group.entries.length, 0) +
          sensitive.length,
        model.surfaces.length,
        `${type} retains every authored surface`,
      );
      for (const batch of batches) {
        const geometry = createSurfaceBatch(batch.entries);
        submitted += geometry.index!.count;
        geometry.dispose();
      }
      for (let index = 0; index < sensitive.length; index++) {
        const geometry = createToreniaStigmaGeometry(
          sensitive[index].cluster,
          (index % 2) as 0 | 1,
          "overview",
        );
        submitted += geometry.index!.count;
        geometry.dispose();
      }
      for (const group of organBatchGroups(renderModel)) {
        const geometry = createOrganBatch(renderModel, group);
        submitted += geometry.index!.count;
        geometry.dispose();
      }
      for (const group of model.instances ?? []) {
        const parts = specimenInstanceGeometry(group, "overview");
        assert.equal(parts.surfaces.length, group.surfaces.length);
        assert.equal(parts.organs.length, group.organs.length);
        for (const geometry of [...parts.surfaces, ...parts.organs]) {
          // The renderer submits the full prototype for each retained pose.
          submitted += geometry.index!.count * group.poses.length;
          geometry.dispose();
        }
      }
    }
  }
  assert.deepEqual(
    [...covered].sort(),
    FLOWER_TYPES.filter(
      (type) => FLOWER_STRUCTURES[type].simulatedSurfaces,
    ).sort(),
    "every catalog specimen using the dedicated model path is accounted for",
  );
  // This is the dedicated-head portion of the existing eight-million-input
  // native frame budget. The remaining draws include radial heads, roots,
  // branches, leaves and the ground; the browser check still measures them all.
  assert.ok(
    submitted < 4300000,
    `${submitted} indexed inputs in dedicated overview heads`,
  );
  t.diagnostic(`${submitted} actual dedicated overview head indexed inputs`);
});

test("compatible overview tissues batch across independently posed flowers within the native draw-call budget", async (t) => {
  const directory = fileURLToPath(
    new URL("../components/flowers/", import.meta.url),
  );
  let draws = 0;
  for (const file of await readdir(directory, { recursive: true })) {
    if (!file.endsWith("Geometry.ts")) continue;
    const type = file.split(/[\\/]/)[0];
    if (!FLOWER_TYPES.includes(type as (typeof FLOWER_TYPES)[number])) continue;
    const exports = await import(pathToFileURL(resolve(directory, file)).href);
    for (const [name, value] of Object.entries(exports)) {
      if (!name.endsWith("_MODEL") || name.endsWith("_RENDER_MODEL")) continue;
      const model = value as SpecimenModel;
      const renderModel = type === "torenia" ? TORENIA_RENDER_MODEL : model;
      draws += surfaceBatchGroups(renderModel, true).length;
      if (type === "torenia")
        draws += TORENIA_MODEL.surfaces.filter(
          (s) => s.name === "bilamellate torenia stigma",
        ).length;
      draws += organBatchGroups(renderModel).length;
      for (const group of model.instances ?? []) {
        const parts = specimenInstanceBatches(group, "overview");
        draws += parts.surfaces.length + parts.organs.length;
        parts.surfaces.forEach((batch) => batch.geometry.dispose());
        parts.organs.forEach((g) => g.dispose());
      }
    }
  }
  // Count the current connected dedicated-head path. Native browser coverage
  // additionally measures roots, foliage, radial heads and environment draws.
  assert.ok(draws < 800, `${draws} dedicated overview head draws`);
  t.diagnostic(`${draws} actual dedicated overview head draws`);
});

test("distant fused limbs retain five and six lobes, sealed thickness and folded normals while focused buffers stay unchanged", () => {
  for (const lobes of [5, 6]) {
    const surface: SpecimenSurface = {
      name: `${lobes}-lobed corolla`,
      cluster: 0,
      role: "tube",
      periodic: true,
      thickness: 0.006,
      sample: (u, v, open) => {
        const a = u * Math.PI * 2,
          radius =
            0.04 +
            v ** 3 * (0.01 + open * (0.025 + 0.02 * Math.cos(lobes * a)));
        return [Math.cos(a) * radius, v * 0.16, Math.sin(a) * radius];
      },
    };
    const overview = specimenGeometry(surface, "overview"),
      p = overview.getAttribute("position"),
      uv = overview.getAttribute("uv"),
      half = p.count / 2,
      rim: number[] = [];
    for (let i = 0; i < half; i++)
      if (uv.getY(i) === 1) rim.push(Math.hypot(p.getX(i), p.getZ(i)));
    assert.equal(rim.length, 24);
    assert.equal(
      rim.filter(
        (r, i) =>
          r >= rim[(i + rim.length - 1) % rim.length] &&
          r > rim[(i + 1) % rim.length],
      ).length,
      lobes,
    );
    for (const position of [p, ...overview.morphAttributes.position!])
      for (let i = 0; i < half; i++)
        assert.ok(
          Math.hypot(
            position.getX(i) - position.getX(i + half),
            position.getY(i) - position.getY(i + half),
            position.getZ(i) - position.getZ(i + half),
          ) > 0.004,
        );
    for (const n of [
      overview.getAttribute("normal"),
      ...overview.morphAttributes.normal!,
    ])
      for (let i = 0; i < n.count; i++)
        assert.ok(
          Math.abs(Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) - 1) < 0.002,
        );
    const edges = new Map<string, number>(),
      ix = overview.index!.array;
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((count) => count === 2));
    overview.dispose();
    for (const [quality, columns, rows] of [
      ["low", 12, 16],
      ["medium", 20, 24],
      ["high", 32, 32],
      ["ultra", 48, 44],
    ] as const) {
      const actual = specimenGeometry(surface, quality),
        original = createParametricShell({ ...surface, columns, rows });
      for (const name of ["position", "normal", "uv", "color"])
        assert.deepEqual(
          actual.getAttribute(name).array,
          original.getAttribute(name).array,
          `${quality} ${lobes}-lobed ${name}`,
        );
      assert.deepEqual(actual.index!.array, original.index!.array);
      for (const name of ["position", "normal"] as const)
        assert.deepEqual(
          actual.morphAttributes[name]![0].array,
          original.morphAttributes[name]![0].array,
        );
      actual.dispose();
      original.dispose();
    }
  }
});

test("garden overview petals retain sealed thickness and bloom normals across the catalog", () => {
  let overviewIndices = 0,
    lowIndices = 0;
  for (const type of FLOWER_TYPES)
    for (const layer of FLOWER_STRUCTURES[type].layers) {
      const g = createPetalGeometry(layer.profile, 123, "overview" as Quality);
      const low = createPetalGeometry(layer.profile, 123, "low");
      const p = g.getAttribute("position"),
        half = p.count / 2;
      for (const a of [
        p,
        g.getAttribute("normal"),
        ...g.morphAttributes.position!,
        ...g.morphAttributes.normal!,
      ]) {
        assert.equal(a.count, p.count);
        assert.ok(Array.from(a.array).every(Number.isFinite), type);
      }
      for (const a of [p, ...g.morphAttributes.position!])
        for (let i = 0; i < half; i++)
          assert.ok(
            Math.hypot(
              a.getX(i) - a.getX(i + half),
              a.getY(i) - a.getY(i + half),
              a.getZ(i) - a.getZ(i + half),
            ) > 0,
            type,
          );
      const edges = new Map<string, number>(),
        ix = g.index!.array;
      for (let i = 0; i < ix.length; i += 3)
        for (let j = 0; j < 3; j++) {
          const a = ix[i + j],
            b = ix[i + ((j + 1) % 3)],
            key = a < b ? `${a}:${b}` : `${b}:${a}`;
          edges.set(key, (edges.get(key) ?? 0) + 1);
        }
      assert.ok(
        [...edges.values()].every((n) => n === 2),
        type,
      );
      overviewIndices += ix.length * layer.count;
      lowIndices += low.index!.count * layer.count;
      g.dispose();
      low.dispose();
    }
  assert.ok(
    overviewIndices < lowIndices * 0.65,
    `${overviewIndices}/${lowIndices}`,
  );
});

test("overview bounds dense organ tessellation while retaining every floret and organ", () => {
  let overviewVertices = 0,
    lowVertices = 0;
  for (const model of [
    HYDRANGEA_MODEL,
    PROTEA_MODEL,
    GERBERA_MODEL,
    ZINNIA_MODEL,
  ])
    for (const group of model.instances ?? []) {
      const poses = JSON.stringify(group.poses);
      const overview = specimenInstanceGeometry(group, "overview"),
        low = specimenInstanceGeometry(group, "low");
      assert.equal(overview.surfaces.length, group.surfaces.length);
      assert.equal(overview.organs.length, group.organs.length);
      assert.equal(JSON.stringify(group.poses), poses);
      for (const g of overview.organs) {
        overviewVertices += g.index!.count * group.poses.length;
        assert.ok(
          Array.from(g.getAttribute("normal").array).every(Number.isFinite),
        );
        assert.equal(
          g.morphAttributes.position![0].count,
          g.getAttribute("position").count,
        );
      }
      for (const g of low.organs)
        lowVertices += g.index!.count * group.poses.length;
      for (const g of [
        ...overview.organs,
        ...overview.surfaces,
        ...low.organs,
        ...low.surfaces,
      ])
        g.dispose();
    }
  assert.ok(
    overviewVertices < lowVertices * 0.55,
    `${overviewVertices}/${lowVertices}`,
  );
});

test("overview retains all 610 sunflower seeds with a bounded prototype workload", () => {
  const grain = createCoreGrainGeometry("overview" as Quality);
  const low = createCoreGrainGeometry("low");
  const high = createCoreGrainGeometry("high");
  assert.ok(grain.index!.count * 610 < 150000);
  assert.ok(grain.index!.count < low.index!.count / 6);
  assert.deepEqual(
    low.getAttribute("position").array,
    high.getAttribute("position").array,
  );
  for (const geometry of [grain, low, high]) geometry.dispose();
});
