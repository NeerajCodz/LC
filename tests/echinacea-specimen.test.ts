import test from "node:test";
import assert from "node:assert/strict";
import { ECHINACEA_MODEL, ECHINACEA_HEAD_CENTER } from "../components/flowers/echinacea/echinaceaGeometry";
import { specimenClusterPoint } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("echinacea", ECHINACEA_MODEL);
verifySpecimen("echinacea disk prototypes", { clusters: [], surfaces: ECHINACEA_MODEL.instances![0].surfaces, organs: [] });
test("echinacea has recurved sterile rays and a conic disk with real spiny paleae", () => {
  const rays = ECHINACEA_MODEL.surfaces.filter(s => s.name === "sterile recurved ray");
  assert.equal(rays.length, 21);
  for (const ray of rays) {
    const root = ray.sample(0.5, 0, 1), tip = ray.sample(0.5, 1, 1);
    assert.ok(tip[1] < root[1] - 0.35);
    assert.deepEqual(ray.sample(0.5, 0, 0), root);
    const bud = ray.sample(0.5, 1, 0);
    assert.ok(Math.hypot(bud[0], bud[2]) < 0.016);
  }
  const disk = ECHINACEA_MODEL.instances![0];
  assert.equal(disk.poses.length, 112);
  assert.equal(disk.organs.filter(o => o.name === "sharp receptacular palea").length, 1);
  assert.equal(disk.organs.filter(o => o.name === "stamen filament").length, 5);
  assert.equal(disk.organs.filter(o => o.name === "stamen anther chamber").length, 10);
  assert.equal(disk.organs.filter(o => o.name === "disk style arm").length, 2);
  const inner = disk.poses.reduce((a,b) => a.position[1] > b.position[1] ? a:b);
  const outer = disk.poses.reduce((a,b) => a.position[1] < b.position[1] ? a:b);
  assert.ok(inner.position[1] > outer.position[1] + 0.3);
  const palea = disk.organs.find(o => o.name === "sharp receptacular palea")!;
  assert.ok(palea.points.at(-1)![1] > disk.surfaces[0].sample(0,1,1)[1]);
  assert.ok(palea.endRadius! < palea.radius * 0.1);
});
test("echinacea cone and head insertion retain their anchored carrier", () => {
  const cone = ECHINACEA_MODEL.surfaces.find(s => s.name === "conical receptacle")!;
  assert.ok(cone.periodic && cone.contactObstacle);
  assert.ok(cone.sample(0,1,1)[1] > cone.sample(0,0,1)[1] + 0.4);
  const insertion = specimenClusterPoint(ECHINACEA_MODEL.clusters[0], [0,-0.18,0]);
  assert.ok(Math.hypot(insertion[0], insertion[1] + 0.18, insertion[2]) < 1e-9);
  assert.ok(ECHINACEA_HEAD_CENTER.every(Number.isFinite));
});
