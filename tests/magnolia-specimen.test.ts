import test from "node:test";
import assert from "node:assert/strict";
import { MAGNOLIA_MODEL } from "../components/flowers/magnolia/magnoliaGeometry";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("magnolia", MAGNOLIA_MODEL);
test("magnolia retains thick tepals and distinct spiral stamens and carpels", async () => {
  const a =
    await import("../components/flowers/magnolia/magnoliaGeometry").catch(
      () => null,
    );
  assert.ok(a, "magnolia anatomy is missing");
  const m = a.MAGNOLIA_MODEL;
  assert.equal(
    m.surfaces.filter((s) => s.name === "substantial tepal").length,
    9,
  );
  assert.equal(
    m.surfaces.filter((s) => s.name === "protective bud bract").length,
    2,
  );
  assert.equal(
    m.instances!.find((g) => g.name === "spiral stamens")!.poses.length,
    179,
  );
  assert.equal(
    m.instances!.find((g) => g.name === "spiral carpels")!.poses.length,
    60,
  );
});
