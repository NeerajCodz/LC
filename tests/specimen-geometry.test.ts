import test from "node:test";
import assert from "node:assert/strict";
import {
  specimenOrganGeometry,
  specimenOrganCarrier,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
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
