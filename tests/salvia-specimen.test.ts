import test from "node:test";
import assert from "node:assert/strict";
import {
  SALVIA_MODEL,
  SALVIA_STALKS,
  salviaCorolla,
} from "../components/flowers/salvia/salviaGeometry";
import {
  specimenGeometry,
  specimenCages,
  specimenClusterPoint,
  SINGLE_CLUSTER,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";

verifySpecimen("salvia", SALVIA_MODEL);
test("salvia: mature flowers spread below graduated upright buds without a bare terminal axis", () => {
  const elevations: number[] = [];
  for (const c of SALVIA_MODEL.clusters.slice(1)) {
    const tip = specimenClusterPoint(c, [0, 0, 1]),
      up = specimenClusterPoint(c, [0, 1, 0]),
      rise = (tip[1] - c.position[1]) / c.scale;
    assert.ok(rise > -0.3 && rise < 0.9, `unbounded flower pitch: ${rise}`);
    assert.ok(
      up[1] > c.position[1] + c.scale * 0.6,
      "hood rolls below flower's upper side",
    );
    elevations.push(Math.asin(rise));
  }
  assert.ok(
    elevations.slice(0, 4).some((pitch) => pitch < 0.08),
    "older basal corollas all point steeply upward",
  );
  const mean = (values: number[]) =>
    values.reduce((sum, n) => sum + n, 0) / values.length;
  assert.ok(
    mean(elevations.slice(-4)) > mean(elevations.slice(0, 4)) + 0.3,
    "young terminal buds must be more erect than mature basal flowers",
  );
  const y = SALVIA_MODEL.clusters.slice(1).map((c) => c.position[1]);
  assert.ok(
    Math.max(...y) - Math.min(...y) < 0.9,
    "terminal whorls are too far apart",
  );
  const axis = SALVIA_STALKS[0],
    tip = axis.points.at(-1)!;
  const lastInsertions = SALVIA_MODEL.clusters
    .slice(-4)
    .map((c) => c.position[1]);
  assert.ok(
    tip[1] <= Math.max(...lastInsertions) + 0.075,
    "green shoot protrudes above the compact terminal buds",
  );
  assert.ok(
    tip[1] >= Math.min(...lastInsertions),
    "axis ends below the terminal insertions",
  );
});
test("salvia: real calyx walls form broad persistent lips around a narrower bilateral corolla", () => {
  const calyx = SALVIA_MODEL.surfaces.find((s) => s.role === "calyx")!;
  const tube = SALVIA_MODEL.surfaces.find((s) => s.role === "tube")!;
  for (const quality of ["overview", "high"] as const) {
    const g = specimenGeometry(calyx, quality),
      c = specimenGeometry(tube, quality);
    try {
      g.computeBoundingBox();
      const box = g.boundingBox!;
      assert.ok(
        (box.max.x - box.min.x) / (box.max.z - box.min.z) > 0.42,
        "persistent calyx is a narrow cylinder instead of broad lips",
      );
      const p = c.getAttribute("position"),
        uv = c.getAttribute("uv");
      let hoodWidth = 0,
        lowerWidth = 0;
      for (let i = 0; i < p.count / 2; i++)
        if (uv.getY(i) > 0.999) {
          const a = uv.getX(i) * Math.PI * 2;
          if (Math.cos(a) > 0.2)
            hoodWidth = Math.max(hoodWidth, Math.abs(p.getX(i)));
          if (Math.cos(a) < -0.2)
            lowerWidth = Math.max(lowerWidth, Math.abs(p.getX(i)));
        }
      assert.ok(
        lowerWidth > hoodWidth * 1.15,
        "upper hood and three-part lower lip have the same tubular width",
      );
    } finally {
      g.dispose();
      c.dispose();
    }
  }
});
test("salvia: each verticillaster has four connected flowers with one continuous hooded tube", () => {
  assert.equal(SALVIA_MODEL.clusters.length, 21);
  assert.deepEqual(SALVIA_MODEL.clusters[0], SINGLE_CLUSTER);
  for (let c = 1; c < 21; c++) {
    const surfaces = SALVIA_MODEL.surfaces.filter((s) => s.cluster === c);
    assert.equal(surfaces.filter((s) => s.role === "tube").length, 1);
    assert.equal(surfaces.filter((s) => s.role === "calyx").length, 1);
    assert.ok(
      SALVIA_STALKS.some(
        (s) => s.points.at(-1) === SALVIA_MODEL.clusters[c].position,
      ),
    );
    assert.equal(
      SALVIA_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "fertile salvia anther",
      ).length,
      2,
    );
    assert.equal(
      SALVIA_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "reduced salvia staminode",
      ).length,
      2,
    );
  }
  assert.ok(salviaCorolla(0, 1, 1)[2] > salviaCorolla(0.5, 1, 1)[2] + 0.06);
});
test("salvia: real high-quality hood and folded rim remain separated with finite unit normals", () => {
  const surface = SALVIA_MODEL.surfaces.find((s) => s.role === "tube")!;
  const g = specimenGeometry(surface, "high");
  for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
    for (let i = 0; i < a.count; i++)
      assert.ok(
        Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
      );
  const p = g.getAttribute("position"),
    f = g.morphAttributes.position![0],
    half = p.count / 2;
  for (const fraction of [0, 0.25, 0.5, 0.75, 1])
    for (let i = 0; i < half; i++) {
      const d = [0, 1, 2].map(
        (axis) =>
          (p.array[i * 3 + axis] - p.array[(i + half) * 3 + axis]) * fraction +
          (f.array[i * 3 + axis] - f.array[(i + half) * 3 + axis]) *
            (1 - fraction),
      );
      assert.ok(Math.hypot(...d) > surface.thickness * 0.6);
    }
  g.dispose();
  for (const mobile of [false, true])
    assert.ok(
      specimenCages(SALVIA_MODEL, mobile).patches.reduce(
        (n, p) => n + p.open.length / 3,
        0,
      ) <= (mobile ? 512 : 2048),
    );
});
