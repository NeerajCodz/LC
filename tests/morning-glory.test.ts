import test from "node:test";
import assert from "node:assert/strict";
import {
  createMorningCorolla,
  createMorningReproductiveOrgans,
  createMorningShoot,
  morningCorollaPoint,
  morningVinePoint,
} from "../components/flowers/morning-glory/morningGloryGeometry";

test("morning glory has a sealed continuous corolla with deterministic bud geometry and normals", () => {
  for (const quality of ["low", "ultra"] as const) {
    const g = createMorningCorolla(quality),
      other = createMorningCorolla(quality),
      p = g.getAttribute("position"),
      fold = g.morphAttributes.position![0],
      half = p.count / 2;
    assert.deepEqual(p.array, other.getAttribute("position").array);
    assert.ok(quality !== "low" || p.count < 4000);
    for (const a of [
      p,
      fold,
      g.getAttribute("normal"),
      g.morphAttributes.normal![0],
    ]) {
      assert.equal(a.count, p.count);
      assert.ok(Array.from(a.array).every(Number.isFinite));
    }
    for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
      for (let i = 0; i < a.count; i++)
        assert.ok(
          Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.001,
        );
    for (const a of [p, fold])
      for (let i = 0; i < half; i++)
        assert.ok(
          Math.hypot(
            a.getX(i) - a.getX(i + half),
            a.getY(i) - a.getY(i + half),
            a.getZ(i) - a.getZ(i + half),
          ) >= 0.0049,
        );
    const edges = new Map<string, { count: number; winding: number }>(),
      ix = g.index!.array;
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          key = a < b ? `${a}:${b}` : `${b}:${a}`,
          e = edges.get(key) ?? { count: 0, winding: 0 };
        e.count++;
        e.winding += a < b ? 1 : -1;
        edges.set(key, e);
      }
    assert.ok(
      [...edges.values()].every((e) => e.count === 2 && e.winding === 0),
    );
    for (const amount of [0, 0.25, 0.5, 0.75, 1])
      for (let i = 0; i < ix.length; i += 3) {
        const points = [ix[i], ix[i + 1], ix[i + 2]].map((k) =>
          [0, 1, 2].map(
            (c) =>
              p.array[k * 3 + c] * amount +
              fold.array[k * 3 + c] * (1 - amount),
          ),
        );
        const u = points[1].map((v, c) => v - points[0][c]),
          v = points[2].map((v, c) => v - points[0][c]);
        assert.ok(
          Math.hypot(
            u[1] * v[2] - u[2] * v[1],
            u[2] * v[0] - u[0] * v[2],
            u[0] * v[1] - u[1] * v[0],
          ) > 1e-10,
          "No collapsed triangles during unfolding",
        );
      }
    g.dispose();
    other.dispose();
  }
});

test("morning glory preserves its narrow tube, flared limb, enclosed organs and supported twining shoot", () => {
  const root = morningCorollaPoint(0, 0, 1),
    lip = morningCorollaPoint(0, 1, 1),
    bud = morningCorollaPoint(0, 1, 0);
  assert.ok(Math.hypot(root[0], root[2]) < 0.06);
  assert.ok(Math.hypot(lip[0], lip[2]) > 1.05);
  assert.ok(Math.hypot(bud[0], bud[2]) < 0.012);
  const organs = createMorningReproductiveOrgans("low");
  organs.computeBoundingBox();
  assert.ok(organs.boundingBox!.max.y < 0.8);
  organs.dispose();
  const head = morningVinePoint(1, 2.35);
  assert.equal(head[0], 0);
  assert.equal(head[2], 0);
  for (const t of [0.2, 0.4, 0.6]) {
    const p = morningVinePoint(t, 2.35);
    assert.ok(Math.abs(Math.hypot(p[0], p[2]) - 0.052) < 1e-10);
  }
  const shoot = createMorningShoot("low", 2.35);
  assert.ok(shoot.getAttribute("position").count < 2500);
  assert.ok(
    Array.from(shoot.getAttribute("position").array).every(Number.isFinite),
  );
  shoot.dispose();
});
