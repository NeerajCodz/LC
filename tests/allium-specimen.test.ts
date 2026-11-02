import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import {
  ALLIUM_MODEL,
  ALLIUM_FLORET_COUNT,
  ALLIUM_PEDICELS,
  ALLIUM_FLORET,
  ALLIUM_INSERTION,
} from "../components/flowers/allium/alliumGeometry";
import { specimenOrganGeometry } from "../lib/three/specimenModel";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("Allium supported main florets", ALLIUM_MODEL);
verifySpecimen("Allium six separate instanced tepals", {
  clusters: [],
  surfaces: ALLIUM_FLORET.surfaces,
  organs: [],
});

test("Allium: the dense globe consists of complete separate six-tepalled, six-stamen flowers", () => {
  const instances = ALLIUM_MODEL.instances![0];
  assert.equal(ALLIUM_FLORET_COUNT, 180);
  assert.equal(
    instances.poses.length + ALLIUM_MODEL.clusters.length - 1,
    ALLIUM_FLORET_COUNT,
  );
  assert.equal(ALLIUM_FLORET.surfaces.length, 6);
  assert.ok(
    ALLIUM_FLORET.surfaces.every((s) => !s.periodic && s.role === "petal"),
  );
  assert.equal(
    ALLIUM_FLORET.organs.filter((o) => o.name === "stamen filament").length,
    6,
  );
  assert.equal(
    ALLIUM_FLORET.organs.filter((o) => o.name === "stamen anther chamber")
      .length,
    12,
  );
  assert.equal(
    ALLIUM_FLORET.organs.filter((o) => o.name === "superior ovary").length,
    1,
  );
  assert.equal(
    ALLIUM_FLORET.organs.filter((o) => o.name === "central style").length,
    1,
  );
  assert.ok(
    ALLIUM_FLORET.surfaces.every((s) => {
      const p = s.sample(0.5, 1, 1);
      return Math.hypot(p[0], p[2]) > 0.15;
    }),
  );
});
test("Allium: every true flower has a real radial pedicel rooted at the shared insertion", () => {
  assert.equal(ALLIUM_PEDICELS.length, ALLIUM_FLORET_COUNT);
  const poses = [
    ...ALLIUM_MODEL.clusters.slice(1),
    ...ALLIUM_MODEL.instances![0].poses,
  ];
  for (let i = 0; i < poses.length; i++) {
    const organ = ALLIUM_PEDICELS[i],
      pose = poses[i];
    assert.deepEqual(organ.points[0], ALLIUM_INSERTION);
    assert.deepEqual(organ.points.at(-1), pose.position);
    const tangent = new Vector3(...organ.points.at(-1)!)
      .sub(new Vector3(...organ.points.at(-2)!))
      .normalize();
    const axis = new Vector3(0, 1, 0).applyEuler(new Euler(...pose.rotation));
    assert.ok(tangent.dot(axis) > 0.9999);
  }
  assert.equal(
    ALLIUM_MODEL.surfaces.filter(
      (s) => s.name === "papery basal spathe remnant",
    ).length,
    2,
  );
});
test("Allium: reproductive organs retain finite low-tier geometry and included folded positions", () => {
  const batch = specimenInstanceGeometry(ALLIUM_FLORET, "overview");
  assert.equal(batch.surfaces.length, 6);
  assert.equal(batch.organs.length, ALLIUM_FLORET.organs.length);
  for (const organ of ALLIUM_FLORET.organs) {
    const g = specimenOrganGeometry(organ, "overview");
    for (const a of [
      g.getAttribute("position"),
      g.getAttribute("normal"),
      ...(g.morphAttributes.normal ?? []),
    ])
      assert.ok(Array.from(a.array).every(Number.isFinite), organ.name);
    if (organ.foldedPoints) assert.equal(g.morphAttributes.normal!.length, 1);
    g.dispose();
  }
  for (const organ of ALLIUM_FLORET.organs.filter((o) =>
    /stamen|style|stigma/.test(o.name),
  ))
    for (const p of organ.foldedPoints!) {
      assert.ok(Math.hypot(p[0], p[2]) < 0.035);
      assert.ok(p[1] < 0.163);
    }
  [...batch.surfaces, ...batch.organs].forEach((g) => g.dispose());
});
