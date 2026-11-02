import test from "node:test";
import assert from "node:assert/strict";
import { Triangle, Vector3 } from "three";
import {
  CALCEOLARIA_MODEL,
  CALCEOLARIA_STALKS,
  calceolariaCorolla,
} from "../components/flowers/calceolaria/calceolariaGeometry";
import {
  specimenGeometry,
  specimenOrganParts,
  specimenCages,
} from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";
import { verifySpecimen } from "./specimen-checks";

verifySpecimen("calceolaria", CALCEOLARIA_MODEL);

test("calceolaria: four flowers and two young buds retain four sepals, two stamens and a complete pistil", () => {
  assert.equal(CALCEOLARIA_MODEL.clusters.length, 6);
  for (let cluster = 0; cluster < 6; cluster++) {
    const surfaces = CALCEOLARIA_MODEL.surfaces.filter(
      (s) => s.cluster === cluster,
    );
    assert.equal(surfaces.filter((s) => s.role === "tube").length, 1);
    assert.equal(surfaces.filter((s) => s.role === "calyx").length, 4);
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(
        CALCEOLARIA_MODEL,
        cluster,
        quality,
        true,
      );
      try {
        for (const [name, count] of [
          ["included calceolaria stamen filament", 2],
          ["divaricate calceolaria anther theca", 4],
          ["included calceolaria style", 1],
          ["capitate calceolaria stigma", 1],
          ["calceolaria superior ovary", 1],
        ] as const)
          assert.equal(
            parts.filter((p) => p.organ.name === name).length,
            count,
            `${quality}/${cluster}/${name}`,
          );
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
  }
});

test("calceolaria: the continuous bilateral sack has a narrow open mouth and a small upper hood at every bloom", () => {
  for (const stage of [0, 0.5, 1]) {
    const body = calceolariaCorolla(0, 0.55, stage),
      mouth = calceolariaCorolla(0, 1, stage),
      lower = calceolariaCorolla(0.75, 0.55, stage),
      upper = calceolariaCorolla(0.25, 0.55, stage),
      roofRim = calceolariaCorolla(0.25, 1, stage),
      floorRim = calceolariaCorolla(0.75, 1, stage);
    assert.ok(
      body[0] > mouth[0] * 1.8,
      "pouch body must swell behind its real neck",
    );
    assert.ok(
      -lower[1] > upper[1] * 2,
      "lower lip must dominate the small upper hood",
    );
    assert.ok(
      roofRim[1] - floorRim[1] > 0.045,
      "bud cavity must never collapse",
    );
    assert.ok(
      roofRim[2] < floorRim[2],
      "upper hood overhangs the narrow mouth",
    );
    for (const v of [0, 0.2, 0.6, 1]) {
      assert.deepEqual(
        calceolariaCorolla(0, v, stage),
        calceolariaCorolla(1, v, stage),
      );
      const a = calceolariaCorolla(0.125, v, stage),
        b = calceolariaCorolla(0.375, v, stage);
      assert.ok(Math.abs(a[0] + b[0]) < 1e-10);
      assert.ok(Math.abs(a[1] - b[1]) < 1e-10);
      assert.ok(Math.abs(a[2] - b[2]) < 1e-10);
    }
  }
  for (let i = 0; i < 16; i++)
    assert.deepEqual(
      calceolariaCorolla(i / 16, 0, 0),
      calceolariaCorolla(i / 16, 0, 1),
      "floral insertion stays pinned during inflation",
    );
});

test("calceolaria: real pedicels meet every distinct flower insertion and branch above the rooted shoot", () => {
  const pedicels = CALCEOLARIA_STALKS.filter(
    (s) => s.name === "calceolaria flower pedicel",
  );
  assert.equal(pedicels.length, 6);
  for (let i = 0; i < pedicels.length; i++) {
    assert.deepEqual(
      pedicels[i].points.at(-1),
      CALCEOLARIA_MODEL.clusters[i].position,
    );
    assert.ok(pedicels[i].points[0][1] < 0);
    assert.ok(pedicels[i].points.at(-1)![1] > pedicels[i].points[0][1]);
  }
  assert.equal(
    new Set(pedicels.map((s) => s.points.at(-1)!.join(","))).size,
    6,
  );
});

test("calceolaria: actual low and overview reproductive buffers clear the hollow wall through reverse bloom", () => {
  const triangle = new Triangle(),
    point = new Vector3(),
    closest = new Vector3();
  for (const quality of ["overview", "low"] as const) {
    const surface = CALCEOLARIA_MODEL.surfaces.find((s) => s.role === "tube")!,
      wall = specimenGeometry(surface, quality),
      parts = specimenOrganParts(CALCEOLARIA_MODEL, 0, quality, true).filter(
        (p) => /theca|stigma/.test(p.organ.name),
      );
    try {
      for (const open of [1, 0.5, 0, 0.5, 1]) {
        const w = wall.getAttribute("position"),
          f = wall.morphAttributes.position![0],
          ix = wall.index!.array,
          at = (target: Vector3, i: number) =>
            target.set(
              w.getX(i) * open + f.getX(i) * (1 - open),
              w.getY(i) * open + f.getY(i) * (1 - open),
              w.getZ(i) * open + f.getZ(i) * (1 - open),
            );
        for (const { organ, geometry } of parts) {
          const p = geometry.getAttribute("position"),
            folded = geometry.morphAttributes.position![0];
          for (let i = 0; i < p.count; i++) {
            point.set(
              p.getX(i) * open + folded.getX(i) * (1 - open),
              p.getY(i) * open + folded.getY(i) * (1 - open),
              p.getZ(i) * open + folded.getZ(i) * (1 - open),
            );
            let distance = Infinity;
            for (let k = 0; k < ix.length; k += 3) {
              at(triangle.a, ix[k]);
              at(triangle.b, ix[k + 1]);
              at(triangle.c, ix[k + 2]);
              distance = Math.min(
                distance,
                triangle.closestPointToPoint(point, closest).distanceTo(point),
              );
            }
            assert.ok(
              distance > 0.003,
              `${quality}/${open}/${organ.name}: wall clearance ${distance}`,
            );
          }
        }
      }
    } finally {
      wall.dispose();
      parts.forEach((p) => p.geometry.dispose());
    }
  }
});

test("calceolaria: assembled periodic pouch cages retain fixed roots within both whole-plant ceilings", () => {
  for (const constrained of [false, true]) {
    const { patches, indices } = specimenCages(CALCEOLARIA_MODEL, constrained),
      sim = new PetalDynamics(patches, constrained);
    assert.equal(patches.length, 6);
    assert.ok(sim.inverseMass.length <= (constrained ? 512 : 2048));
    for (let p = 0; p < patches.length; p++) {
      assert.equal(CALCEOLARIA_MODEL.surfaces[indices[p]].role, "tube");
      assert.equal(patches[p].periodic, true);
      for (let i = 0; i < patches[p].columns; i++) {
        assert.equal(sim.inverseMass[sim.offsets[p] + i], 0);
        for (let axis = 0; axis < 3; axis++)
          assert.equal(
            patches[p].open[i * 3 + axis],
            patches[p].folded[i * 3 + axis],
          );
      }
    }
  }
});
