import test from "node:test";
import assert from "node:assert/strict";
import {
  specimenGeometry,
  specimenCages,
  specimenOrganGeometry,
  specimenOrganCarrier,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { PetalDynamics } from "../lib/three/petalDynamics";
import {
  CARNATION_MODEL,
  carnationPetal,
} from "../components/flowers/carnation/carnationGeometry";
import {
  PLUMERIA_MODEL,
  plumeriaLobe,
} from "../components/flowers/plumeria/plumeriaGeometry";
import {
  FOXGLOVE_MODEL,
  foxgloveBell,
} from "../components/flowers/foxglove/foxgloveGeometry";
import { SWEET_PEA_MODEL } from "../components/flowers/sweet-pea/sweetPeaGeometry";
import { BOUGAINVILLEA_MODEL } from "../components/flowers/bougainvillea/bougainvilleaGeometry";

test("foxglove internal organs morph inside closed corollas with matched normals", () => {
  for (let cluster = 1; cluster <= 12; cluster++) {
    const bell = FOXGLOVE_MODEL.surfaces[cluster - 1];
    assert.deepEqual(
      specimenOrganCarrier(FOXGLOVE_MODEL, cluster),
      {
        delay: bell.delay,
        phase: (cluster - 1) * 0.31,
      },
      "included organs follow their bell's bottom-to-top bloom stage",
    );
  }
  const included = FOXGLOVE_MODEL.organs.filter(
    (o) => o.cluster === 1 && /stamen|style|hair/.test(o.name),
  );
  assert.equal(included.length, 21);
  for (const organ of included) {
    assert.ok(organ.foldedPoints, organ.name);
    const g = specimenOrganGeometry(organ, "low"),
      folded = g.morphAttributes.position![0],
      normals = g.morphAttributes.normal![0];
    assert.equal(folded.count, g.getAttribute("position").count);
    for (let i = 0; i < folded.count; i++) {
      const v = Math.max(0, Math.min(1, folded.getZ(i) / 0.42));
      const r = Math.hypot(
        folded.getX(i),
        (folded.getY(i) + 0.12 * v * v) / 0.95,
      );
      const wall = foxgloveBell(0, v, 0)[0];
      assert.ok(r < wall - 0.002, `${organ.name} stays inside the bud wall`);
      assert.ok(
        Math.abs(
          Math.hypot(normals.getX(i), normals.getY(i), normals.getZ(i)) - 1,
        ) < 0.002,
      );
    }
    g.dispose();
  }
});

export function verifySpecimen(name: string, model: SpecimenModel) {
  test(`${name}: deterministic sealed surfaces, positive thickness and stable bloom normals`, () => {
    for (const s of model.surfaces) {
      const g = specimenGeometry(s, "low"),
        b = specimenGeometry(s, "low");
      const p = g.getAttribute("position"),
        f = g.morphAttributes.position![0],
        half = p.count / 2;
      assert.deepEqual(p.array, b.getAttribute("position").array, s.name);
      for (const a of [
        p,
        f,
        g.getAttribute("normal"),
        g.morphAttributes.normal![0],
      ])
        assert.ok(Array.from(a.array).every(Number.isFinite), s.name);
      for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
        for (let i = 0; i < a.count; i++)
          assert.ok(
            Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
            s.name,
          );
      for (const a of [p, f])
        for (let i = 0; i < half; i++)
          assert.ok(
            Math.hypot(
              a.getX(i) - a.getX(i + half),
              a.getY(i) - a.getY(i + half),
              a.getZ(i) - a.getZ(i + half),
            ) >
              s.thickness * 0.79,
            s.name,
          );
      const edges = new Map<string, number>(),
        ix = g.index!.array;
      for (let i = 0; i < ix.length; i += 3)
        for (let j = 0; j < 3; j++) {
          const a = ix[i + j],
            b = ix[i + ((j + 1) % 3)],
            key = a < b ? `${a}:${b}` : `${b}:${a}`;
          edges.set(key, (edges.get(key) ?? 0) + 1);
        }
      assert.ok(
        [...edges.values()].every((n) => n === 2),
        s.name,
      );
      for (const open of [0, 0.5, 1])
        for (let i = 0; i < ix.length; i += 3) {
          const a = ix[i] * 3,
            b = ix[i + 1] * 3,
            c = ix[i + 2] * 3;
          const x = (k: number) => p.array[k] * open + f.array[k] * (1 - open);
          const ux = x(b) - x(a),
            uy = x(b + 1) - x(a + 1),
            uz = x(b + 2) - x(a + 2),
            vx = x(c) - x(a),
            vy = x(c + 1) - x(a + 1),
            vz = x(c + 2) - x(a + 2);
          assert.ok(
            Math.hypot(
              uy * vz - uz * vy,
              uz * vx - ux * vz,
              ux * vy - uy * vx,
            ) > 1e-12,
            `${s.name} at ${open}`,
          );
        }
      g.dispose();
      b.dispose();
    }
  });
  test(`${name}: whole-plant cages respect both node ceilings`, () => {
    for (const constrained of [true, false]) {
      const { patches } = specimenCages(model, constrained);
      const sim = new PetalDynamics(patches, constrained);
      assert.ok(sim.inverseMass.length <= (constrained ? 512 : 2048));
    }
  });
}
verifySpecimen("carnation", CARNATION_MODEL);
verifySpecimen("plumeria", PLUMERIA_MODEL);
verifySpecimen("foxglove", FOXGLOVE_MODEL);
verifySpecimen("sweet pea", SWEET_PEA_MODEL);
verifySpecimen("bougainvillea", BOUGAINVILLEA_MODEL);
test("upper sweet pea stalks and bougainvillea branches attach to a continuous shoot", () => {
  for (const [model, name] of [
    [SWEET_PEA_MODEL, "flower stalk"],
    [BOUGAINVILLEA_MODEL, "woody cyme branch"],
  ] as const) {
    const axis = model.organs.find((o) => o.name.includes("shoot axis"));
    assert.ok(axis, "a continuous flowering axis connects upper branches");
    const heights = axis.points.map((p) => p[1]);
    for (const branch of model.organs.filter((o) => o.name === name)) {
      const base = branch.points[0];
      assert.ok(
        base[1] >= Math.min(...heights) && base[1] <= Math.max(...heights),
      );
      assert.ok(
        Math.hypot(base[0], base[2]) <= axis.radius,
        "branch insertion lies on the shoot",
      );
    }
  }
});
test("double carnation covers its calyx and corolla buds close around included organs", () => {
  for (let i = 30; i < 40; i++) {
    const tip = carnationPetal(i)(0.5, 1, 1);
    assert.ok(
      Math.hypot(tip[0], tip[2]) < 0.12,
      "inner ruff covers the center",
    );
    assert.ok(tip[1] > 0.5, "inner petals arch above the calyx");
  }
  for (let i = 0; i < 5; i++) {
    const lobe = plumeriaLobe(i),
      tip = lobe(0.5, 1, 0);
    assert.ok(Math.hypot(tip[0], tip[2]) < 0.025, "furled tip tapers inward");
    const left = lobe(0, 0.5, 0),
      right = plumeriaLobe((i + 4) % 5)(1, 0.5, 0);
    assert.ok(
      Math.hypot(left[0] - right[0], left[1] - right[1], left[2] - right[2]) <
        0.025,
      "adjacent bud sectors overlap",
    );
  }
  for (let i = 0; i < 12; i++) {
    const bud = foxgloveBell(i / 12, 1, 0),
      open = foxgloveBell(i / 12, 1, 1);
    assert.ok(
      Math.hypot(bud[0], bud[1] + 0.12) <
        Math.hypot(open[0], open[1] + 0.12) / 4,
      "foxglove bud mouth stays closed",
    );
  }
});
test("five specimens preserve their defining authored organ arrangements", () => {
  const count = (m: SpecimenModel, role: string) =>
    m.surfaces.filter((s) => s.role === role).length;
  assert.equal(count(CARNATION_MODEL, "petal"), 40);
  assert.equal(count(PLUMERIA_MODEL, "petal"), 17); // 15 limbs and two younger buds.
  assert.equal(
    FOXGLOVE_MODEL.surfaces.filter((s) => s.flexible && s.periodic).length,
    12,
  );
  assert.equal(count(SWEET_PEA_MODEL, "banner"), 3);
  assert.equal(count(SWEET_PEA_MODEL, "wing"), 6);
  assert.equal(count(SWEET_PEA_MODEL, "keel"), 6);
  assert.equal(count(BOUGAINVILLEA_MODEL, "bract"), 9);
  assert.equal(count(BOUGAINVILLEA_MODEL, "tube"), 9);
  for (const m of [
    CARNATION_MODEL,
    PLUMERIA_MODEL,
    FOXGLOVE_MODEL,
    SWEET_PEA_MODEL,
    BOUGAINVILLEA_MODEL,
  ])
    for (const part of [...m.surfaces, ...m.organs])
      assert.ok(part.cluster >= 0 && part.cluster < m.clusters.length);
});
