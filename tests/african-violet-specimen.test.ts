import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import { verifySpecimen } from "./specimen-checks";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { FLOWERS } from "../lib/flowers/catalog";
import {
  AFRICAN_VIOLET_LEAF,
  AFRICAN_VIOLET_LEAF_FACE_ROTATION,
  AFRICAN_VIOLET_LEAF_TILT,
} from "../components/flowers/african-violet/africanVioletLeaf";
import { specimenGeometry } from "../lib/three/specimenModel";
verifySpecimen("african violet foliage", {
  clusters: [],
  surfaces: [AFRICAN_VIOLET_LEAF],
  organs: [],
});
test("african violet exposes its accepted name throughout the catalog", () => {
  assert.ok((FLOWER_TYPES as readonly string[]).includes("african-violet"));
  assert.ok(
    FLOWERS.some(
      (f) =>
        (f.type as string) === "african-violet" &&
        f.latin === "Streptocarpus ionanthus",
    ),
  );
});
test("african violet leaf tissue has positive fleshy thickness and real deterministic hairs", async () => {
  const leaf =
    await import("../components/flowers/african-violet/africanVioletLeaf").catch(
      () => null,
    );
  assert.ok(leaf, "dedicated african violet foliage is missing");
  assert.ok(leaf.AFRICAN_VIOLET_LEAF.thickness >= 0.02);
  const a = leaf.createAfricanVioletHairs("low"),
    b = leaf.createAfricanVioletHairs("low");
  assert.ok(a.getAttribute("position").count > 200);
  assert.deepEqual(
    a.getAttribute("position").array,
    b.getAttribute("position").array,
  );
  assert.ok(
    Array.from(a.getAttribute("position").array).every(Number.isFinite),
  );
  a.dispose();
  b.dispose();
});
verifySpecimen("african violet", AFRICAN_VIOLET_MODEL);
test("african violet retains joined paired anthers and a lateral style", () => {
  for (let c = 0; c < 6; c++) {
    assert.equal(
      AFRICAN_VIOLET_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "connivent stamen filament",
      ).length,
      2,
    );
    assert.equal(
      AFRICAN_VIOLET_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "joined yellow anther chamber",
      ).length,
      4,
    );
    assert.equal(
      AFRICAN_VIOLET_MODEL.organs.filter(
        (o) => o.cluster === c && o.name === "staminodial peg",
      ).length,
      2,
    );
    assert.ok(
      AFRICAN_VIOLET_MODEL.organs
        .find((o) => o.cluster === c && o.name === "laterally exserted style")!
        .points.at(-1)![0] > 0.07,
    );
  }
});

test("african-violet: dedicated anatomy preserves its defining floral arrangement", async () => {
  const anatomy =
    await import("../components/flowers/african-violet/africanVioletGeometry").catch(
      () => null,
    );
  assert.ok(anatomy, "african-violet anatomy is missing");
  const model = anatomy.AFRICAN_VIOLET_MODEL;
  assert.equal(model.clusters.length, 6);
  assert.equal(
    model.surfaces.filter((s) => s.name === "bilateral fused corolla").length,
    6,
  );
});

test("african violet: folded and retained buds have a tight apex rather than an open tube mouth", () => {
  const corollas = AFRICAN_VIOLET_MODEL.surfaces.filter(
    (s) => s.name === "bilateral fused corolla",
  );
  for (const s of corollas)
    for (let i = 0; i < 40; i++) {
      const tip = s.sample(i / 40, 1, 0);
      assert.ok(
        Math.hypot(tip[0], tip[2]) < s.thickness * 0.9,
        `${s.cluster}: folded corolla closes tightly`,
      );
      if (s.cluster === 5) {
        const bud = s.sample(i / 40, 1, 1);
        assert.ok(
          Math.hypot(bud[0], bud[2]) < s.thickness * 0.9,
          "the retained bud never becomes a hollow funnel",
        );
      }
    }
});

test("african violet: thick offset shells stay outside the folded apex axis at every quality", () => {
  for (const quality of ["overview", "low", "medium", "high", "ultra"] as const)
    for (const s of AFRICAN_VIOLET_MODEL.surfaces.filter(
      (s) => s.name === "bilateral fused corolla",
    )) {
      const geometry = specimenGeometry(s, quality),
        p = geometry.getAttribute("position"),
        f = geometry.morphAttributes.position![0],
        uv = geometry.getAttribute("uv"),
        ix = geometry.index!.array;
      for (let i = 0; i < p.count; i++)
        if (uv.getY(i) === 1) {
          assert.ok(
            Math.hypot(f.getX(i), f.getZ(i)) > 0.001,
            "folded inner offset never crosses the apex axis",
          );
        }
      for (const open of [0, 0.5, 1])
        for (let i = 0; i < ix.length; i += 3) {
          const a = ix[i] * 3,
            b = ix[i + 1] * 3,
            c = ix[i + 2] * 3,
            at = (k: number) => p.array[k] * open + f.array[k] * (1 - open),
            ux = at(b) - at(a),
            uy = at(b + 1) - at(a + 1),
            uz = at(b + 2) - at(a + 2),
            vx = at(c) - at(a),
            vy = at(c + 1) - at(a + 1),
            vz = at(c + 2) - at(a + 2);
          assert.ok(
            Math.hypot(
              uy * vz - uz * vy,
              uz * vx - ux * vz,
              ux * vy - uy * vx,
            ) > 1e-12,
            `${quality}: bloom ${open} keeps every shell triangle noncollapsed`,
          );
        }
      geometry.dispose();
    }
});

test("african violet: the green upper leaf surface faces upward in the pitched rosette", () => {
  const geometry = specimenGeometry(AFRICAN_VIOLET_LEAF, "low"),
    normal = geometry.getAttribute("normal"),
    local = new Vector3(normal.getX(110), normal.getY(110), normal.getZ(110)),
    rotation = AFRICAN_VIOLET_LEAF_FACE_ROTATION,
    tilt = AFRICAN_VIOLET_LEAF_TILT;
  local
    .applyEuler(new Euler(...rotation))
    .applyEuler(new Euler(tilt, 0, 0.1, "YXZ"));
  assert.ok(
    local.y > 0.7,
    "the pigment's upper side faces upward after the actual rosette pitch",
  );
  const axis = new Vector3(0, 1, 0).applyEuler(new Euler(...rotation));
  assert.ok(
    axis.distanceTo(new Vector3(0, 1, 0)) < 1e-10,
    "the correction preserves the base-to-tip leaf axis",
  );
  geometry.dispose();
});
