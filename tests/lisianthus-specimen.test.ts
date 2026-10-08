import test from "node:test";
import assert from "node:assert/strict";
import { LISIANTHUS_MODEL } from "../components/flowers/lisianthus/lisianthusGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("lisianthus", LISIANTHUS_MODEL);
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
