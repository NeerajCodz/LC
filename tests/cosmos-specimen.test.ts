import test from "node:test";
import assert from "node:assert/strict";
import { COSMOS_MODEL } from "../components/flowers/cosmos/cosmosGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("cosmos", COSMOS_MODEL);
verifySpecimen("cosmos disk prototypes", {
  clusters: [],
  surfaces: COSMOS_MODEL.instances![0].surfaces,
  organs: [],
});
test("cosmos retains neuter rays and true five-lobed bisexual disk flowers", async () => {
  const a = await import("../components/flowers/cosmos/cosmosGeometry").catch(
    () => null,
  );
  assert.ok(a, "cosmos anatomy is missing");
  const m = a.COSMOS_MODEL;
  assert.equal(
    m.surfaces.filter((s) => s.name === "neuter ray ligule").length,
    8,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "outer involucral bract").length,
    8,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "inner involucral bract").length,
    8,
  );
  const disk = m.instances![0];
  assert.equal(disk.poses.length, 80);
  assert.equal(
    disk.surfaces.filter((s) => s.name === "disk corolla lobe").length,
    5,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "stamen filament").length,
    5,
  );
  assert.equal(
    disk.organs.filter((o) => o.name === "disk style arm").length,
    2,
  );
});
