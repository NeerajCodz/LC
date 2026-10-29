import test from "node:test";
import assert from "node:assert/strict";
import {
  LANTANA_MODEL,
  LANTANA_HEADS,
  LANTANA_STALKS,
  lantanaCorolla,
} from "../components/flowers/lantana/lantanaGeometry";
import {
  specimenOrganParts,
  specimenClusterPoint,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";

test("lantana: two rounded axillary heads retain distinct cohorts and six closed buds", () => {
  assert.equal(LANTANA_HEADS.length, 2);
  assert.equal(LANTANA_MODEL.clusters.length, 42);
  const corollas = LANTANA_MODEL.surfaces.filter((s) => s.role === "tube");
  assert.equal(corollas.length, 42);
  assert.equal(corollas.filter((s) => s.tissue === undefined).length, 20);
  assert.equal(corollas.filter((s) => s.tissue === "disc").length, 10);
  assert.equal(corollas.filter((s) => s.tissue === "guide").length, 12);
  for (let h = 0; h < 2; h++) {
    const stalk = LANTANA_STALKS[h];
    assert.ok(stalk.points[0][1] < -0.25);
    assert.deepEqual(stalk.points.at(-1), LANTANA_HEADS[h]);
    assert.ok(stalk.points[0][0] === 0);
  }
});
test("lantana: one continuous curved corolla has four unequal rounded lobes", () => {
  const radii = Array.from({ length: 4 }, (_, i) => {
    const p = lantanaCorolla(i / 4, 1, 1),
      q = lantanaCorolla((i + 0.5) / 4, 1, 1);
    assert.ok(
      Math.hypot(p[0] - 0.014, p[2]) > Math.hypot(q[0] - 0.014, q[2]) + 0.035,
    );
    return Math.hypot(p[0] - 0.014, p[2]);
  });
  assert.ok(Math.max(...radii) - Math.min(...radii) > 0.015);
  for (const v of [0, 0.3, 0.7, 1]) {
    const a = lantanaCorolla(0, v, 0.5),
      b = lantanaCorolla(1, v, 0.5);
    assert.ok(Math.hypot(...a.map((n, i) => n - b[i])) < 1e-9);
  }
  const full = lantanaCorolla(0, 1, 1),
    bud = lantanaCorolla(0, 1, 1, true);
  assert.ok(
    Math.hypot(full[0] - 0.014, full[2]) >
      Math.hypot(bud[0] - 0.014, bud[2]) * 3,
  );
  assert.ok(bud[1] > 0.4);
  assert.equal(
    LANTANA_MODEL.surfaces.filter((s) => s.name.includes("terminal lobe"))
      .length,
    0,
  );
});
test("lantana: four didynamous included stamens, oblique stigma and superior ovary fit actual corolla buffers", () => {
  for (let c = 0; c < LANTANA_MODEL.clusters.length; c++) {
    const organs = LANTANA_MODEL.organs.filter((o) => o.cluster === c);
    const filaments = organs.filter(
      (o) => o.name === "included lantana stamen filament",
    );
    assert.equal(filaments.length, 4);
    assert.equal(new Set(filaments.map((o) => o.points.at(-1)![1])).size, 2);
    assert.equal(
      organs.filter((o) => o.name === "included lantana anther chamber").length,
      8,
    );
    assert.equal(
      organs.filter((o) => o.name === "oblique subcapitate lantana stigma")
        .length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "superior lantana ovary").length,
      1,
    );
    for (const quality of ["overview", "low"] as const) {
      const parts = specimenOrganParts(LANTANA_MODEL, c, quality, true);
      try {
        assert.equal(parts.length, 14);
        for (const { geometry } of parts)
          for (const a of [
            geometry.getAttribute("position"),
            geometry.morphAttributes.position![0],
          ])
            for (let i = 0; i < a.count; i++) {
              assert.ok(a.getY(i) < 0.36);
              assert.ok(
                Math.hypot(
                  a.getX(i) - 0.014 * (a.getY(i) / 0.43) ** 2,
                  a.getZ(i),
                ) < 0.027,
              );
            }
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
    const base = specimenClusterPoint(LANTANA_MODEL.clusters[c], [0, 0, 0]);
    const h = LANTANA_HEADS[Math.floor(c / 21)];
    assert.ok(Math.hypot(base[0] - h[0], base[2] - h[2]) < 0.43);
  }
});
verifySpecimen("lantana", LANTANA_MODEL);
test("lantana: actual continuous receptacles meet each sessile open-flower base", () => {
  const receptacles = LANTANA_MODEL.surfaces.filter(
    (s) => s.name === "continuous domed lantana receptacle",
  );
  assert.equal(receptacles.length, 2);
  for (let h = 0; h < 2; h++)
    for (let j = 0; j < 18; j++) {
      const flower = LANTANA_MODEL.clusters[h * 21 + j],
        center = LANTANA_HEADS[h],
        dx = flower.position[0] - center[0],
        dz = flower.position[2] - center[2],
        a = Math.atan2(dx, dz),
        v = 1 - (Math.hypot(dx, dz) - 0.008) / 0.427,
        local = receptacles[h].sample(a / (Math.PI * 2), v, 1),
        world = specimenClusterPoint(
          LANTANA_MODEL.clusters[receptacles[h].cluster],
          local,
        );
      assert.ok(
        Math.hypot(...world.map((n, k) => n - flower.position[k])) < 0.007,
      );
    }
});
