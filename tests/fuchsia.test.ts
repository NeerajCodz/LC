import test from "node:test";
import assert from "node:assert/strict";
import {
  createFuchsiaBlade,
  createFuchsiaHypanthium,
  createFuchsiaStamen,
  createFuchsiaPistil,
  fuchsiaSepalPoint,
  FUCHSIA_MOUTH,
  FUCHSIA_COUNTS,
} from "../components/flowers/fuchsia/fuchsiaGeometry";
import { stepFuchsiaPendant } from "../components/flowers/fuchsia/fuchsiaMotion";
test("fuchsia surfaces remain sealed, thick and nondegenerate through bloom", () => {
  for (const quality of ["low", "ultra"] as const) {
    for (const make of [
      () => createFuchsiaBlade("sepal", quality, 0),
      () => createFuchsiaBlade("petal", quality, 0),
      () => createFuchsiaHypanthium(quality),
    ]) {
      const g = make(),
        other = make(),
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
            ) >= 0.0047,
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
  }
});

test("fuchsia preserves valvate buds, spreading sepals and alternating exserted stamens", () => {
  assert.deepEqual(FUCHSIA_COUNTS, {
    sepals: 4,
    petals: 4,
    stamens: 8,
    stigmaLobes: 4,
  });
  for (let t = 0; t <= 1; t += 0.025) {
    const right = fuchsiaSepalPoint(1, t, 0),
      left = fuchsiaSepalPoint(0, t, 0);
    assert.ok(
      Math.abs(right[0] - left[2]) < 1e-10 &&
        Math.abs(right[2] + left[0]) < 1e-10,
      "valvate edges meet adjacent quadrant",
    );
    assert.ok(
      fuchsiaSepalPoint(0.5, t, 1)[1] <= FUCHSIA_MOUTH + 0.001,
      "sepals never reflex above insertion",
    );
  }
  for (let i = 0; i < 8; i++) {
    const g = createFuchsiaStamen("low", i);
    g.computeBoundingBox();
    assert.ok(g.boundingBox!.min.y < -1.22);
    if (i % 2 === 0) assert.ok(g.boundingBox!.min.y < -1.43);
    else assert.ok(g.boundingBox!.min.y > -1.3);
    for (const a of [
      g.morphAttributes.position![0],
      g.morphAttributes.normal![0],
    ])
      assert.equal(a.count, g.getAttribute("position").count);
    g.dispose();
  }
  const pistil = createFuchsiaPistil("low");
  pistil.computeBoundingBox();
  assert.ok(pistil.boundingBox!.min.y < -1.62);
  assert.ok(
    Math.min(
      ...pistil.morphAttributes.position![0].array.filter(
        (_, i) => i % 3 === 1,
      ),
    ) > -1.12,
    "bud encloses style",
  );
  pistil.dispose();
});
test("pendant gravity response is stable across frame rates and pauses", () => {
  const ends: number[] = [];
  for (const fps of [30, 60, 120]) {
    const state = { value: 0, velocity: 0 };
    for (let i = 0; i < fps * 2; i++) stepFuchsiaPendant(state, 0.15, 1 / fps);
    assert.ok(Math.abs(state.value - 0.15) < 0.001);
    const before = { ...state };
    stepFuchsiaPendant(state, -0.1, 0);
    assert.deepEqual(state, before);
    for (let i = 0; i < fps * 2; i++) stepFuchsiaPendant(state, 0, 1 / fps);
    assert.ok(Math.abs(state.value) < 0.001 && Math.abs(state.velocity) < 0.01);
    ends.push(state.value);
    stepFuchsiaPendant(state, 100, 60);
    assert.ok(Number.isFinite(state.value) && Math.abs(state.value) < 0.25);
  }
  assert.ok(Math.max(...ends) - Math.min(...ends) < 0.0001);
});
