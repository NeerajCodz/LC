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
test("nasturtium peltate blades stay sealed with an interior insertion and folded normals", async () => {
  const a =
    await import("../components/flowers/nasturtium/nasturtiumLeaf").catch(
      () => null,
    );
  assert.ok(a, "nasturtium peltate leaf is missing");
  const g = a.createNasturtiumLeaf("low"),
    b = a.createNasturtiumLeaf("low"),
    p = g.getAttribute("position"),
    f = g.morphAttributes.position![0],
    half = p.count / 2;
  assert.deepEqual(p.array, b.getAttribute("position").array);
  assert.ok(Math.abs(p.getY(0) - 0.39) < 0.00001);
  assert.deepEqual(
    Array.from(g.getAttribute("uv").array).slice(0, 2),
    [0.5, 0.5],
  );
  for (const n of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
    for (let i = 0; i < n.count; i++)
      assert.ok(
        Math.abs(Math.hypot(n.getX(i), n.getY(i), n.getZ(i)) - 1) < 0.002,
      );
  for (const positions of [p, f])
    for (let i = 0; i < half; i++)
      assert.ok(
        Math.hypot(
          positions.getX(i) - positions.getX(i + half),
          positions.getY(i) - positions.getY(i + half),
          positions.getZ(i) - positions.getZ(i + half),
        ) > 0.012,
      );
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
  b.dispose();
});
