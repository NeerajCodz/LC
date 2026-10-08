import test from "node:test";
import assert from "node:assert/strict";
import { CROCUS_MODEL } from "../components/flowers/crocus/crocusGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("crocus", CROCUS_MODEL);
test("crocus distinguishes six tepals, three stamens and three stigma branches on every scape", async () => {
  const anatomy =
    await import("../components/flowers/crocus/crocusGeometry").catch(
      () => null,
    );
  assert.ok(anatomy, "crocus anatomy is missing");
  const m = anatomy.CROCUS_MODEL;
  assert.equal(m.clusters.length, 4);
  assert.equal(
    m.surfaces.filter((s) => s.name === "perianth tepal").length,
    24,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "basal perianth tube").length,
    4,
  );
  assert.equal(m.organs.filter((o) => o.name === "stamen filament").length, 12);
  assert.equal(m.organs.filter((o) => o.name === "stigma branch").length, 12);
});
