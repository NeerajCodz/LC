import test from "node:test";
import assert from "node:assert/strict";
import { IXORA_LEAF } from "../components/flowers/ixora/ixoraLeaf";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("ixora entire leathery foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  organs: [],
  surfaces: [IXORA_LEAF],
});
test("ixora: nearly sessile blade keeps a broad entire limb and real leathery thickness", () => {
  assert.ok(IXORA_LEAF.sample(0.5, 0, 1)[1] < 0.01);
  assert.ok(IXORA_LEAF.thickness >= 0.015);
  const edge = [0.4, 0.45, 0.5, 0.55, 0.6].map(
    (v) => IXORA_LEAF.sample(1, v, 1)[0],
  );
  assert.ok(Math.max(...edge) - Math.min(...edge) < 0.022);
});
