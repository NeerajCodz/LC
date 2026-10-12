import test from "node:test";
import assert from "node:assert/strict";
import { verifySpecimen } from "./specimen-checks";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { FLOWERS } from "../lib/flowers/catalog";
import { AFRICAN_VIOLET_LEAF } from "../components/flowers/african-violet/africanVioletLeaf";
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
