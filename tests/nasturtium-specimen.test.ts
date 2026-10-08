import test from "node:test";
import assert from "node:assert/strict";
import { NASTURTIUM_MODEL } from "../components/flowers/nasturtium/nasturtiumGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("nasturtium", NASTURTIUM_MODEL);
test("nasturtium preserves bilateral petals, a hollow calyx spur and eight stamens", async () => {
  const a =
    await import("../components/flowers/nasturtium/nasturtiumGeometry").catch(
      () => null,
    );
  assert.ok(a, "nasturtium anatomy is missing");
  const m = a.NASTURTIUM_MODEL;
  assert.equal(m.clusters.length, 4);
  assert.equal(
    m.surfaces.filter((s) => s.name === "upper guide petal").length,
    8,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "fringed lower petal").length,
    12,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "hollow dorsal spur").length,
    4,
  );
  assert.equal(m.organs.filter((o) => o.name === "stamen filament").length, 32);
});
