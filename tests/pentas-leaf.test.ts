import test from "node:test";
import assert from "node:assert/strict";
import {
  PENTAS_LEAF,
  PENTAS_PETIOLE,
  pentasLeafHairs,
} from "../components/flowers/pentas/pentasLeaf";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("pentas hairy petiolate foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  organs: [],
  surfaces: [PENTAS_LEAF],
});
test("pentas: true petiole meets the blade and geometric underside hairs retain folded attachments", () => {
  assert.deepEqual(PENTAS_PETIOLE.points.at(-1), PENTAS_LEAF.sample(0.5, 0, 1));
  assert.ok(
    pentasLeafHairs("high").length > pentasLeafHairs("overview").length,
  );
  for (const hair of pentasLeafHairs("high")) {
    assert.equal(hair.points.length, hair.foldedPoints!.length);
    assert.ok(hair.points[1][2] < hair.points[0][2]);
    assert.ok(hair.radius > hair.endRadius!);
  }
});
