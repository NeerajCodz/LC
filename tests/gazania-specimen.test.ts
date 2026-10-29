import test from "node:test";
import assert from "node:assert/strict";
import {
  GAZANIA_MODEL,
  GAZANIA_HEAD_CENTER,
} from "../components/flowers/gazania/gazaniaGeometry";
import {
  specimenClusterPoint,
  specimenOrganGeometry,
} from "../lib/three/specimenModel";
import { Mesh, MeshBasicMaterial, DoubleSide, Raycaster, Vector3 } from "three";
import { verifySpecimen } from "./specimen-checks";
import {
  GAZANIA_LEAF,
  createGazaniaLeaf,
} from "../components/flowers/gazania/gazaniaLeaf";
verifySpecimen("gazania", GAZANIA_MODEL);
verifySpecimen("gazania disk prototypes", {
  clusters: [],
  surfaces: GAZANIA_MODEL.instances![0].surfaces,
  organs: [],
});
verifySpecimen("gazania white-backed pinnatifid leaf", {
  clusters: [],
  surfaces: [GAZANIA_LEAF],
  organs: [],
});
test("gazania disk bases insert into the actual sealed receptacle surface", () => {
  const receptacle = GAZANIA_MODEL.organs.find(
    (o) => o.name === "solid disk receptacle",
  )!;
  const geometry = specimenOrganGeometry(receptacle, "high");
  const material = new MeshBasicMaterial({ side: DoubleSide });
  const mesh = new Mesh(geometry, material);
  mesh.updateMatrixWorld();
  const ray = new Raycaster(),
    down = new Vector3(0, -1, 0);
  for (const pose of GAZANIA_MODEL.instances![0].poses) {
    ray.set(new Vector3(pose.position[0], 1, pose.position[2]), down);
    const hit = ray.intersectObject(mesh)[0];
    assert.ok(hit, "every true floret has real receptacular tissue below it");
    assert.ok(
      Math.abs(hit.point.y - pose.position[1]) < 0.045,
      "floret insertion meets real supporting tissue",
    );
  }
  geometry.dispose();
  material.dispose();
});
test("gazania foliage keeps real lobes, rolled margins and matching folded normals", () => {
  const widths = Array.from({ length: 61 }, (_, i) =>
    Math.abs(GAZANIA_LEAF.sample(1, 0.15 + i / 100, 1)[0]),
  );
  assert.ok(
    widths.some(
      (w, i) => i > 0 && i < 60 && w < widths[i - 1] && w < widths[i + 1],
    ),
  );
  const rim = GAZANIA_LEAF.sample(1, 0.5, 1),
    middle = GAZANIA_LEAF.sample(0.5, 0.5, 1);
  assert.ok(rim[2] < middle[2]);
  for (const q of ["overview", "low", "high"] as const) {
    const g = createGazaniaLeaf(q);
    assert.equal(
      g.morphAttributes.normal![0].count,
      g.getAttribute("normal").count,
    );
    assert.ok(g.getAttribute("tissueSide"));
    g.dispose();
  }
});
test("gazania keeps sterile rays, a fused involucre and true five-lobed disk florets", () => {
  assert.equal(
    GAZANIA_MODEL.surfaces.filter((s) => s.name === "sterile ray ligule")
      .length,
    20,
  );
  assert.equal(
    GAZANIA_MODEL.surfaces.filter((s) => s.name === "free phyllary apex")
      .length,
    24,
  );
  assert.equal(
    GAZANIA_MODEL.organs.filter((o) => /ray.*(style|stamen)/.test(o.name))
      .length,
    0,
  );
  const disk = GAZANIA_MODEL.instances![0];
  assert.equal(disk.poses.length, 96);
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
  const tube = disk.surfaces[0];
  for (let i = 0; i < 5; i++)
    assert.ok(
      tube.sample(i / 5, 1, 1)[1] > tube.sample((i + 0.5) / 5, 1, 1)[1] + 0.015,
    );
  const cup = GAZANIA_MODEL.surfaces.find(
    (s) => s.name === "connate involucral cup",
  )!;
  assert.ok(cup.periodic);
  assert.ok(
    Math.hypot(...[cup.sample(0, 0, 1)[0], cup.sample(0, 0, 1)[2]]) < 0.06,
  );
});
test("gazania rays close over the disk and head insertion remains rooted", () => {
  const ray = GAZANIA_MODEL.surfaces.find(
    (s) => s.name === "sterile ray ligule",
  )!;
  assert.deepEqual(ray.sample(0.5, 0, 0), ray.sample(0.5, 0, 1));
  const bud = ray.sample(0.5, 1, 0),
    full = ray.sample(0.5, 1, 1);
  assert.ok(Math.hypot(bud[0], bud[2]) < 0.015);
  assert.ok(Math.hypot(full[0], full[2]) > 1);
  const insertion = specimenClusterPoint(
    GAZANIA_MODEL.clusters[0],
    [0, -0.18, 0],
  );
  assert.ok(Math.hypot(insertion[0], insertion[1] + 0.18, insertion[2]) < 1e-9);
  assert.ok(GAZANIA_HEAD_CENTER.every(Number.isFinite));
});
