import test from "node:test";
import assert from "node:assert/strict";
import { createPalmateBlade } from "../lib/three/botanicalBlades";

test("a divided simple blade remains sealed, deterministic and thick with valid folded normals", () => {
  for (const quality of ["low", "high"] as const) {
    const g = createPalmateBlade(quality, 5),
      b = createPalmateBlade(quality, 5);
    const p = g.getAttribute("position"),
      f = g.morphAttributes.position![0];
    assert.deepEqual(p.array, b.getAttribute("position").array);
    for (const a of [
      p,
      f,
      g.getAttribute("normal"),
      g.morphAttributes.normal![0],
    ])
      assert.ok(Array.from(a.array).every(Number.isFinite));
    for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
      for (let i = 0; i < a.count; i++)
        assert.ok(
          Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
        );
    const edges = new Map<string, number>(),
      ix = g.index!.array;
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          k = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(k, (edges.get(k) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((n) => n === 2));
    for (const a of [p, f])
      for (let i = 0; i < a.count / 2; i++)
        assert.ok(
          Math.hypot(
            a.getX(i) - a.getX(i + a.count / 2),
            a.getY(i) - a.getY(i + a.count / 2),
            a.getZ(i) - a.getZ(i + a.count / 2),
          ) > 0.006,
        );
    assert.equal(g.getAttribute("tissueSide").count, p.count);
    g.dispose();
    b.dispose();
  }
});
