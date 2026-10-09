import test from "node:test";
import assert from "node:assert/strict";
import { LISIANTHUS_MODEL } from "../components/flowers/lisianthus/lisianthusGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("lisianthus", LISIANTHUS_MODEL);
import { LISIANTHUS_LEAF } from "../components/flowers/lisianthus/lisianthusLeaf";
verifySpecimen("lisianthus clasping leaves", {
  clusters: [],
  surfaces: [LISIANTHUS_LEAF],
  organs: [],
});
test("lisianthus blades retain broad stem-clasping insertions", () => {
  assert.ok(
    LISIANTHUS_LEAF.sample(1, 0, 1)[0] - LISIANTHUS_LEAF.sample(0, 0, 1)[0] >
      0.09,
  );
});
test("lisianthus petal centers avoid repeated deep corrugations", () => {
  const s = LISIANTHUS_MODEL.surfaces.find((s) => s.name === "corolla lobe")!,
    d = 0.0125;
  for (let v = 0.12; v < 0.88; v += 0.03) {
    const curve =
      s.sample(0.5, v - d, 1)[1] +
      s.sample(0.5, v + d, 1)[1] -
      2 * s.sample(0.5, v, 1)[1];
    assert.ok(
      Math.abs(curve) < 0.0006,
      "petal pleats are too mechanically regular and deep",
    );
  }
});
test("lisianthus retains short fused bases, five lobes and two stigma tips", async () => {
  const a =
    await import("../components/flowers/lisianthus/lisianthusGeometry").catch(
      () => null,
    );
  assert.ok(a, "lisianthus anatomy is missing");
  const m = a.LISIANTHUS_MODEL;
  assert.equal(m.clusters.length, 5);
  assert.equal(m.surfaces.filter((s) => s.name === "corolla lobe").length, 25);
  assert.equal(
    m.surfaces.filter((s) => s.name === "short fused corolla base").length,
    5,
  );
  assert.equal(m.organs.filter((o) => o.name === "stamen filament").length, 25);
  assert.equal(m.organs.filter((o) => o.name === "stigma lobe").length, 10);
});
