import assert from "node:assert/strict";
import test from "node:test";
import { FLOWER_TYPES, type Quality } from "../lib/flowers/types";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import { createPetalGeometry } from "../lib/three/geometry";
import { createCoreGrainGeometry } from "../lib/three/coreGeometry";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import { HYDRANGEA_MODEL } from "../components/flowers/hydrangea/hydrangeaGeometry";
import { PROTEA_MODEL } from "../components/flowers/king-protea/proteaGeometry";
import { GERBERA_MODEL } from "../components/flowers/gerbera/gerberaGeometry";
import { ZINNIA_MODEL } from "../components/flowers/zinnia/zinniaGeometry";

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
