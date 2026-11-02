import test from "node:test";
import assert from "node:assert/strict";
import {
  TRILLIUM_MODEL,
  trilliumPetal,
} from "../components/flowers/trillium/trilliumGeometry";
import {
  specimenCages,
  specimenGeometry,
  specimenOrganGeometry,
} from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";
import { verifySpecimen } from "./specimen-checks";

verifySpecimen("trillium", TRILLIUM_MODEL);
test("trillium: three separate undulate petals alternate with three shorter green sepals", () => {
  const petals = TRILLIUM_MODEL.surfaces.filter((s) => s.role === "petal"),
    sepals = TRILLIUM_MODEL.surfaces.filter((s) => s.role === "calyx");
  assert.equal(petals.length, 3);
  assert.equal(sepals.length, 3);
  for (let i = 0; i < 3; i++) {
    const tip = petals[i].sample(0.5, 1, 1),
      sepal = sepals[i].sample(0.5, 1, 1);
    assert.ok(
      Math.hypot(tip[0], tip[2]) > Math.hypot(sepal[0], sepal[2]) * 1.3,
    );
    const angle = Math.atan2(tip[0], tip[2]),
      sepalAngle = Math.atan2(sepal[0], sepal[2]);
    assert.ok(Math.abs(Math.cos(angle - sepalAngle) - 0.5) < 0.001);
    assert.ok(petals[i].flexible && !petals[i].periodic);
  }
  const edge = (v: number) =>
    trilliumPetal(0, v, 1, 0)[1] - trilliumPetal(0.5, v, 1, 0)[1];
  assert.ok(
    Math.abs(edge(0.66) - edge(0.83)) > 0.015,
    "distal margins lost their undulation",
  );
});
test("trillium: six real long anthers surround a six-angled ovary and three stigma branches at every tier", () => {
  for (const name of ["trillium filament", "pale yellow trillium anther"])
    assert.equal(
      TRILLIUM_MODEL.organs.filter((o) => o.name === name).length,
      6,
    );
  assert.equal(
    TRILLIUM_MODEL.organs.filter((o) => o.name === "trillium stigma branch")
      .length,
    3,
  );
  assert.equal(
    TRILLIUM_MODEL.surfaces.filter(
      (s) => s.name === "six-angled trillium ovary",
    ).length,
    1,
  );
  for (const quality of ["overview", "low", "ultra"] as const)
    for (const organ of TRILLIUM_MODEL.organs) {
      const g = specimenOrganGeometry(organ, quality);
      assert.ok(g.index && g.index.count > 0);
      assert.ok(
        Array.from(g.getAttribute("position").array).every(Number.isFinite),
      );
      g.dispose();
    }
  const anther = TRILLIUM_MODEL.organs.find(
      (o) => o.name === "pale yellow trillium anther",
    )!,
    filament = TRILLIUM_MODEL.organs.find(
      (o) => o.name === "trillium filament",
    )!;
  assert.ok(
    anther.points.at(-1)![1] - anther.points[0][1] >
      filament.points.at(-1)![1] - filament.points[0][1],
  );
});
test("trillium: petal insertions stay pinned and actual half-bloom skins preserve positive walls", () => {
  const { patches } = specimenCages(TRILLIUM_MODEL, false),
    simulation = new PetalDynamics(patches, false);
  for (let p = 0; p < patches.length; p++)
    for (let i = 0; i <= patches[p].columns; i++)
      assert.equal(simulation.inverseMass[simulation.offsets[p] + i], 0);
  for (const s of TRILLIUM_MODEL.surfaces) {
    const g = specimenGeometry(s, "ultra"),
      p = g.getAttribute("position"),
      f = g.morphAttributes.position![0],
      half = p.count / 2;
    for (const open of [0, 0.5, 1])
      for (let i = 0; i < half; i++) {
        const wall = [0, 1, 2].map(
          (k) =>
            (p.array[i * 3 + k] - p.array[(i + half) * 3 + k]) * open +
            (f.array[i * 3 + k] - f.array[(i + half) * 3 + k]) * (1 - open),
        );
        assert.ok(
          Math.hypot(...wall) > s.thickness * 0.35,
          `${s.name} wall inverts at ${open}`,
        );
      }
    g.dispose();
  }
});
