import test from "node:test";
import assert from "node:assert/strict";
import { CAMELLIA_MODEL } from "../components/flowers/camellia/camelliaGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("camellia", CAMELLIA_MODEL);
test("single camellia preserves seven petals, protective scales and fused filament collars", async () => {
  const a =
    await import("../components/flowers/camellia/camelliaGeometry").catch(
      () => null,
    );
  assert.ok(a, "camellia anatomy is missing");
  const m = a.CAMELLIA_MODEL;
  assert.equal(
    m.surfaces.filter((s) => s.name === "single-form petal").length,
    14,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "protective bracteole or sepal").length,
    18,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "connate filament collar").length,
    2,
  );
  assert.equal(
    m.organs.filter((o) => o.name === "stamen filament").length,
    128,
  );
  assert.equal(m.organs.filter((o) => o.name === "style lobe").length, 6);
});
