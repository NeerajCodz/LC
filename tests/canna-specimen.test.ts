import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Matrix4, Vector3 } from "three";
import {
  CANNA_MODEL,
  CANNA_STALKS,
  cannaHalfStamen,
} from "../components/flowers/canna/cannaGeometry";
import {
  CANNA_LEAF,
  CANNA_SHEATH,
  CANNA_LEAF_TILT,
  createCannaLeafGeometry,
  CANNA_BASAL_NECK,
} from "../components/flowers/canna/cannaLeaf";
import {
  specimenGeometry,
  specimenOrganGeometry,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
import { writeStemNodeMatrix } from "../lib/three/plantAttachments";

verifySpecimen("canna", CANNA_MODEL);
verifySpecimen("canna sheathing leaves", {
  clusters: [],
  surfaces: [CANNA_LEAF, CANNA_SHEATH, CANNA_BASAL_NECK],
  organs: [],
});

test("canna: dedicated anatomy preserves its defining floral arrangement", () => {
  assert.equal(CANNA_MODEL.clusters.length, 4);
  for (const c of [0, 1, 2, 3]) {
    const surfaces = CANNA_MODEL.surfaces.filter((s) => s.cluster === c),
      organs = CANNA_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      surfaces.filter((s) => s.name === "outer petaloid staminode").length,
      3,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "narrow true petal").length,
      3,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "persistent sepal").length,
      3,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "reflexed labellum").length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "fertile petaloid half-stamen").length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "flat petaloid style").length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "single adnate anther locule").length,
      1,
    );
    assert.equal(
      organs.filter((o) => o.name === "inferior warty ovary").length,
      1,
    );
    assert.equal(organs.filter((o) => o.name === "stamen filament").length, 0);
  }
});

test("canna: three narrow true petals meet their continuous basal corolla tube", () => {
  for (const c of [0, 1, 2, 3]) {
    const tube = CANNA_MODEL.surfaces.find(
      (s) => s.cluster === c && s.name === "true corolla basal tube",
    )!;
    assert.ok(tube.periodic);
    const petals = CANNA_MODEL.surfaces.filter(
      (s) => s.cluster === c && s.name === "narrow true petal",
    );
    for (let i = 0; i < 3; i++)
      for (const stage of [0, 0.5, 1]) {
        const a = (i * Math.PI * 2) / 3 + 0.18,
          root = petals[i].sample(0.5, 0, stage),
          rim = tube.sample(a / (Math.PI * 2), 1, stage);
        assert.ok(Math.hypot(...root.map((n, axis) => n - rim[axis])) < 1e-10);
      }
    assert.ok(
      CANNA_MODEL.organs
        .find((o) => o.cluster === c && o.name === "inferior warty ovary")!
        .points.every((p) => p[1] < tube.sample(0.5, 0, 1)[1]),
    );
  }
});

test("canna: the single anther remains adnate to the half-stamen apical margin", () => {
  for (const c of [0, 1, 2, 3]) {
    const anther = CANNA_MODEL.organs.find(
      (o) => o.cluster === c && o.name === "single adnate anther locule",
    )!;
    for (const stage of [0, 1]) {
      const points = stage ? anther.points : anther.foldedPoints!;
      for (const [i, v] of [0.82, 0.91, 0.995].entries()) {
        const margin = cannaHalfStamen(1, v, stage, c === 3),
          p = points[i];
        assert.ok(Math.hypot(...p.map((n, axis) => n - margin[axis])) < 0.012);
      }
    }
    const lip = CANNA_MODEL.surfaces.find(
      (s) => s.cluster === c && s.name === "reflexed labellum",
    )!;
    if (c < 3)
      assert.ok(lip.sample(0.5, 1, 1)[1] < lip.sample(0.5, 0.62, 1)[1]);
  }
});

test("canna: authored flower and bud insertions terminate their cincinnus branches", () => {
  const pedicels = CANNA_STALKS.filter(
    (o) => o.name === "short cincinnus branch",
  );
  assert.equal(pedicels.length, CANNA_MODEL.clusters.length);
  pedicels.forEach((o, i) =>
    assert.deepEqual(o.points.at(-1), CANNA_MODEL.clusters[i].position),
  );
  const adult = CANNA_MODEL.surfaces.find(
      (s) => s.cluster === 0 && s.name === "outer petaloid staminode",
    )!,
    bud = CANNA_MODEL.surfaces.find(
      (s) => s.cluster === 3 && s.name === "outer petaloid staminode",
    )!;
  assert.ok(
    Math.hypot(bud.sample(0.5, 0.85, 1)[0], bud.sample(0.5, 0.85, 1)[2]) <
      Math.hypot(adult.sample(0.5, 0.85, 1)[0], adult.sample(0.5, 0.85, 1)[2]) *
        0.55,
  );
});

test("canna: fine organs preserve real deterministic sealed geometry and folded normals", () => {
  for (const o of [
    ...CANNA_MODEL.organs,
    ...CANNA_MODEL.instances!.flatMap((g) => g.organs),
  ]) {
    const g = specimenOrganGeometry(o, "overview"),
      b = specimenOrganGeometry(o, "overview");
    assert.deepEqual(
      g.getAttribute("position").array,
      b.getAttribute("position").array,
    );
    for (const a of [
      g.getAttribute("position"),
      g.getAttribute("normal"),
      ...(g.morphAttributes.position ?? []),
      ...(g.morphAttributes.normal ?? []),
    ])
      assert.ok(Array.from(a.array).every(Number.isFinite));
    assert.ok(g.index!.count > 0);
    if (o.foldedPoints) assert.equal(g.morphAttributes.normal!.length, 1);
    g.dispose();
    b.dispose();
  }
  assert.equal(
    CANNA_MODEL.instances!.reduce((sum, g) => sum + g.poses.length, 0),
    96,
  );
});

test("canna: substantial continuous blades emerge from wrapped sheathing bases", () => {
  assert.ok(CANNA_LEAF.thickness > 0.02);
  const edge = CANNA_LEAF.sample(1, 0.5, 1),
    base = CANNA_LEAF.sample(0.5, 0, 1);
  assert.ok(edge[0] > 0.38);
  assert.ok(Math.abs(base[1] - CANNA_SHEATH.sample(0.5, 1, 1)[1]) < 0.04);
  assert.ok(CANNA_SHEATH.sample(0, 0, 1)[0] < 0);
  assert.ok(CANNA_SHEATH.sample(1, 0, 1)[0] > 0);
});

test("canna: the authored green blade side faces upward without moving its sheath or curvature", () => {
  const geometry = createCannaLeafGeometry("low"),
    baseline = specimenGeometry(CANNA_LEAF, "low"),
    normal = geometry.getAttribute("normal"),
    foldedNormal = geometry.morphAttributes.normal![0],
    sides = geometry.getAttribute("tissueSide"),
    half = normal.count / 2,
    tilt = CANNA_LEAF_TILT;
  for (const a of [normal, foldedNormal])
    for (const row of [4, 8, 12]) {
      const original = row * 13 + 6,
        upper = sides.getX(original) > 0 ? original : original + half,
        n = new Vector3(a.getX(upper), a.getY(upper), a.getZ(upper)).applyEuler(
          new Euler(tilt, 0.15, 0.1, "YXZ"),
        );
      assert.ok(
        n.y > 0.6,
        "green adaxial pigment faces upward through the actual shoot pitch",
      );
    }
  for (const name of ["position", "normal", "uv"])
    assert.deepEqual(
      geometry.getAttribute(name).array,
      baseline.getAttribute(name).array,
      `${name}: the blade retains its exact authored shape`,
    );
  assert.deepEqual(
    geometry.morphAttributes.position![0].array,
    baseline.morphAttributes.position![0].array,
  );
  assert.deepEqual(
    geometry.morphAttributes.normal![0].array,
    baseline.morphAttributes.normal![0].array,
  );
  assert.deepEqual(geometry.index!.array, baseline.index!.array);
  geometry.dispose();
  baseline.dispose();
});

test("canna: the sheath encloses the shoot in its raw and actual unpitched node frames", () => {
  const nodes = [
      { t: 0.16, angle: 0.15 },
      { t: 0.32, angle: 2.55 },
      { t: 0.51, angle: 4.95 },
      { t: 0.68, angle: 7.35 },
    ],
    halfTurn = Math.PI / (2 * 5.3);
  for (const v of [0, 0.5, 1]) {
    const left = CANNA_SHEATH.sample(0.5 - halfTurn, v, 1),
      right = CANNA_SHEATH.sample(0.5 + halfTurn, v, 1),
      center = new Vector3(
        (left[0] + right[0]) / 2,
        (left[1] + right[1]) / 2,
        (left[2] + right[2]) / 2,
      );
    assert.ok(
      Math.hypot(center.x, center.z) < 1e-10,
      "the raw ring center is the stem axis, without a hidden -.044 offset",
    );
    for (const node of nodes)
      for (const growth of [0.2, 0.5, 1])
        for (const motion of [
          { x: 0, z: 0, drop: 0 },
          { x: 0.24, z: -0.19, drop: 0.06 },
        ]) {
          const matrix = writeStemNodeMatrix(new Matrix4(), node, {
              stemLength: 2.25,
              supportHeight: 0,
              growth,
              motion,
              head: new Matrix4().makeRotationX(0.24),
            }),
            axis = center.clone().applyMatrix4(matrix);
          for (let i = 0; i <= 16; i++) {
            const p = new Vector3(
                ...CANNA_SHEATH.sample(i / 16, v, 1),
              ).applyMatrix4(matrix),
              r = Math.hypot(p.x - axis.x, p.z - axis.z);
            assert.ok(
              r - CANNA_SHEATH.thickness * 0.5 > 0.0552,
              "the transformed sheath's inner bore encloses the stout shoot at every node",
            );
            assert.ok(
              Math.abs(p.y - axis.y) < 1e-10,
              "the wrapping ring has no inherited blade pitch or roll",
            );
          }
        }
  }
});

test("canna: a real basal neck joins the unpitched shoot insertion to the existing blade base", () => {
  const neck = CANNA_BASAL_NECK;
  for (const stage of [0, 0.5, 1]) {
    assert.deepEqual(neck.sample(0.5, 0, stage), [0, 0, 0]);
    assert.deepEqual(
      neck.sample(0.5, 1, stage),
      CANNA_LEAF.sample(0.5, 0, stage),
    );
  }
  verifyNeck(neck);
});

function verifyNeck(
  neck: import("../lib/three/specimenModel").SpecimenSurface,
) {
  for (const quality of [
    "overview",
    "low",
    "medium",
    "high",
    "ultra",
  ] as const) {
    const g = specimenGeometry(neck, quality),
      p = g.getAttribute("position"),
      f = g.morphAttributes.position![0],
      ix = g.index!.array,
      half = p.count / 2,
      edges = new Map<string, number>();
    for (const a of [
      p,
      f,
      g.getAttribute("normal"),
      g.morphAttributes.normal![0],
    ])
      assert.ok(Array.from(a.array).every(Number.isFinite));
    for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
      for (let i = 0; i < a.count; i++)
        assert.ok(
          Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
        );
    for (const a of [p, f])
      for (let i = 0; i < half; i++)
        assert.ok(
          Math.hypot(
            a.getX(i) - a.getX(i + half),
            a.getY(i) - a.getY(i + half),
            a.getZ(i) - a.getZ(i + half),
          ) >
            neck.thickness * 0.79,
        );
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          key = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((n) => n === 2));
    for (const stage of [0, 0.5, 1])
      for (let i = 0; i < ix.length; i += 3) {
        const a = ix[i] * 3,
          b = ix[i + 1] * 3,
          c = ix[i + 2] * 3,
          at = (k: number) => p.array[k] * stage + f.array[k] * (1 - stage),
          ux = at(b) - at(a),
          uy = at(b + 1) - at(a + 1),
          uz = at(b + 2) - at(a + 2),
          vx = at(c) - at(a),
          vy = at(c + 1) - at(a + 1),
          vz = at(c + 2) - at(a + 2);
        assert.ok(
          Math.hypot(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx) >
            1e-12,
        );
      }
    g.dispose();
  }
}
