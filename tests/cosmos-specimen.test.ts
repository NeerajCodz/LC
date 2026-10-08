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
test("cosmos bipinnate foliage keeps sealed filiform segments and folded normals", async () => {
  const a = await import("../components/flowers/cosmos/cosmosLeaf").catch(
    () => null,
  );
  assert.ok(a, "cosmos bipinnate foliage is missing");
  const g = a.createCosmosLeaf("low"),
    p = g.getAttribute("position"),
    f = g.morphAttributes.position![0];
  assert.ok(p.count > 1000);
  assert.equal(f.count, p.count);
  for (const x of [
    p,
    f,
    g.getAttribute("normal"),
    g.morphAttributes.normal![0],
  ])
    assert.ok(Array.from(x.array).every(Number.isFinite));
  assert.ok(g.getAttribute("color"));
  assert.ok(g.getAttribute("tissueSide"));
  const edges = new Map<string, number>(),
    ix = g.index!.array;
  for (let i = 0; i < ix.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const x = ix[i + j],
        y = ix[i + ((j + 1) % 3)],
        key = x < y ? `${x}:${y}` : `${y}:${x}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok([...edges.values()].every((n) => n === 2));
  g.dispose();
});
test("cosmos closed heads retain a compact rounded profile", () => {
  const ray = COSMOS_MODEL.surfaces.find(
      (s) => s.name === "neuter ray ligule",
    )!,
    root = COSMOS_MODEL.surfaces
      .find((s) => s.name === "head receptacle")!
      .sample(0, 0, 0),
    tip = ray.sample(0.5, 1, 0),
    body = ray.sample(0.5, 0.5, 0);
  assert.ok(
    (tip[1] - root[1]) / (2 * Math.hypot(body[0], body[2])) < 1.25,
    "closed cosmos head is too elongated",
  );
});
