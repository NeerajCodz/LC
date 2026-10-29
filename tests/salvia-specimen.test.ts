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
test("salvia: every actual flower ascends radially with an upright hood in a compact graduated spike", () => {
  const elevations: number[] = [];
  for (const c of SALVIA_MODEL.clusters.slice(1)) {
    const tip = specimenClusterPoint(c, [0, 0, 1]),
      up = specimenClusterPoint(c, [0, 1, 0]),
      rise = (tip[1] - c.position[1]) / c.scale;
    assert.ok(rise > 0.4, `corolla axis lacks consistent ascent: ${rise}`);
    assert.ok(
      up[1] > c.position[1] + c.scale * 0.55,
      "hood rolls below flower's upper side",
    );
    elevations.push(Math.asin(rise));
  }
  assert.ok(
    Math.max(...elevations) - Math.min(...elevations) > 0.18,
    "identical pitches look manufactured",
  );
  const y = SALVIA_MODEL.clusters.slice(1).map((c) => c.position[1]);
  assert.ok(
    Math.max(...y) - Math.min(...y) < 0.9,
    "terminal whorls are too far apart",
  );
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
