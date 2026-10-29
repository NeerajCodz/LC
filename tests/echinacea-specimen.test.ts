import test from "node:test";
import assert from "node:assert/strict";
import {
  ECHINACEA_MODEL,
  ECHINACEA_HEAD_CENTER,
} from "../components/flowers/echinacea/echinaceaGeometry";
import {
  specimenClusterPoint,
  specimenGeometry,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
import {
  ECHINACEA_LEAF,
  createEchinaceaLeaf,
} from "../components/flowers/echinacea/echinaceaLeaf";
verifySpecimen("echinacea", ECHINACEA_MODEL);
verifySpecimen("echinacea disk prototypes", {
  clusters: [],
  surfaces: ECHINACEA_MODEL.instances![0].surfaces,
  organs: [],
});
verifySpecimen("echinacea ovate serrate leaf", {
  clusters: [],
  surfaces: [ECHINACEA_LEAF],
  organs: [],
});
test("echinacea conical apex inner shell never crosses the axis", () => {
  const cone = ECHINACEA_MODEL.surfaces.find(
    (s) => s.name === "conical receptacle",
  )!;
  for (const q of ["overview", "low", "medium", "high", "ultra"] as const) {
    const g = specimenGeometry(cone, q);
    for (const p of [
      g.getAttribute("position"),
      g.morphAttributes.position![0],
    ]) {
      const half = p.count / 2;
      for (let i = 0; i < half; i++) {
        const x = p.getX(i),
          z = p.getZ(i),
          ix = p.getX(i + half),
          iz = p.getZ(i + half);
        assert.ok(
          x * ix + z * iz > 0,
          "opposite tissue faces remain on the same side of the cone axis",
        );
      }
    }
    g.dispose();
  }
});
test("echinacea leaves have broad ovate blades, three relief veins and quality-scaled sealed hairs", () => {
  assert.ok(Math.abs(ECHINACEA_LEAF.sample(1, 0.45, 1)[0]) > 0.27);
  assert.ok(Math.abs(ECHINACEA_LEAF.sample(1, 0.08, 1)[0]) < 0.01);
  const low = createEchinaceaLeaf("overview"),
    high = createEchinaceaLeaf("high");
  assert.ok(
    high.getAttribute("position").count > low.getAttribute("position").count,
  );
  for (const g of [low, high]) {
    const p = g.getAttribute("position");
    for (const a of [
      p,
      g.getAttribute("normal"),
      g.morphAttributes.position![0],
      g.morphAttributes.normal![0],
    ]) {
      assert.equal(a.count, p.count);
      assert.ok(Array.from(a.array).every(Number.isFinite));
    }
    const edges = new Map<string, number>();
    const ix = g.index!.array;
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((n) => n === 2));
    g.dispose();
  }
});
test("echinacea has recurved sterile rays and a conic disk with real spiny paleae", () => {
  const rays = ECHINACEA_MODEL.surfaces.filter(
    (s) => s.name === "sterile recurved ray",
  );
  assert.equal(rays.length, 21);
  for (const ray of rays) {
    const root = ray.sample(0.5, 0, 1),
      tip = ray.sample(0.5, 1, 1);
    assert.ok(tip[1] < root[1] - 0.35);
    assert.deepEqual(ray.sample(0.5, 0, 0), root);
    const bud = ray.sample(0.5, 1, 0);
    assert.ok(Math.hypot(bud[0], bud[2]) < 0.016);
  }
  const disk = ECHINACEA_MODEL.instances![0];
  assert.equal(disk.poses.length, 112);
  assert.equal(
    disk.organs.filter((o) => o.name === "sharp receptacular palea").length,
    1,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "stamen filament").length,
    5,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "stamen anther chamber").length,
    10,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "disk style arm").length,
    2,
  );
  const inner = disk.poses.reduce((a, b) =>
    a.position[1] > b.position[1] ? a : b,
  );
  const outer = disk.poses.reduce((a, b) =>
    a.position[1] < b.position[1] ? a : b,
  );
  assert.ok(inner.position[1] > outer.position[1] + 0.3);
  const palea = disk.organs.find((o) => o.name === "sharp receptacular palea")!;
  assert.ok(palea.points.at(-1)![1] > disk.surfaces[0].sample(0, 1, 1)[1]);
  assert.ok(palea.endRadius! < palea.radius * 0.1);
});
test("echinacea cone and head insertion retain their anchored carrier", () => {
  const cone = ECHINACEA_MODEL.surfaces.find(
    (s) => s.name === "conical receptacle",
  )!;
  assert.ok(cone.periodic && cone.contactObstacle);
  assert.ok(cone.sample(0, 1, 1)[1] > cone.sample(0, 0, 1)[1] + 0.4);
  const insertion = specimenClusterPoint(
    ECHINACEA_MODEL.clusters[0],
    [0, -0.18, 0],
  );
  assert.ok(Math.hypot(insertion[0], insertion[1] + 0.18, insertion[2]) < 1e-9);
  assert.ok(ECHINACEA_HEAD_CENTER.every(Number.isFinite));
});
