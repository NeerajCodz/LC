import test from "node:test";
import assert from "node:assert/strict";
import { ANEMONE_MODEL } from "../components/flowers/anemone/anemoneGeometry";
import {
  CROCUS_MODEL,
  CROCUS_STALKS,
} from "../components/flowers/crocus/crocusGeometry";
test("anemone sepals and involucre join the peduncle instead of floating around it", () => {
  const neck = ANEMONE_MODEL.surfaces.find(
    (s) => s.name === "receptacular neck",
  );
  assert.ok(neck, "anemone receptacular neck is missing");
  const p = ANEMONE_MODEL.surfaces
      .find((s) => s.name === "petaloid sepal")!
      .sample(0.5, 0, 1),
    n = neck.sample(0.25, 1, 1);
  assert.ok(Math.abs(Math.hypot(p[0], p[2]) - Math.hypot(n[0], n[2])) < 0.02);
  const leaf = ANEMONE_MODEL.surfaces
    .find((s) => s.name === "involucral leaf")!
    .sample(0.5, 0, 1);
  assert.ok(Math.hypot(leaf[0], leaf[2]) < 0.03);
});
test("crocus basal tubes overlap their scape insertions", () => {
  const tube = CROCUS_MODEL.surfaces.find(
      (s) => s.name === "basal perianth tube",
    )!,
    p = tube.sample(0.5, 0, 1),
    stalk = CROCUS_STALKS.find((o) => o.name === "perianth stalk")!;
  assert.ok(
    Math.hypot(p[0], p[2]) - tube.thickness * 0.5 <=
      (stalk.endRadius ?? stalk.radius) + 0.001,
  );
});
