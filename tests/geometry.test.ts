import assert from "node:assert/strict";
import test from "node:test";
import { createPetalGeometry, PETAL } from "../lib/three/geometry";
import { petalOpenness, stepSpring } from "../lib/three/easing";
import { seededRandom } from "../lib/three/noise";
import { FLOWER_TYPES, type FlowerStructure } from "../lib/flowers/types";
import { FLOWER_STRUCTURES as structures } from "../lib/flowers/structures";

test("all species have distinct construction and finite, sealed petal shells", () => {
  assert.equal(
    new Set(Object.values(structures).map((s) => JSON.stringify(s))).size,
    FLOWER_TYPES.length,
  );
  for (const type of FLOWER_TYPES)
    for (const layer of structures[type].layers) {
      const geometry = createPetalGeometry(layer.profile, 123, "low");
      const position = geometry.getAttribute("position"),
        normal = geometry.getAttribute("normal");
      assert.ok(Array.from(position.array).every(Number.isFinite), type);
      assert.ok(Array.from(normal.array).every(Number.isFinite), type);
      const indices = geometry.index!.array,
        edges = new Map<string, number>();
      for (let i = 0; i < indices.length; i += 3) {
        for (const [a, b] of [
          [indices[i], indices[i + 1]],
          [indices[i + 1], indices[i + 2]],
          [indices[i + 2], indices[i]],
        ]) {
          const key = a < b ? `${a}:${b}` : `${b}:${a}`;
          edges.set(key, (edges.get(key) ?? 0) + 1);
        }
      }
      assert.ok(
        [...edges.values()].every((count) => count === 2),
        `${type}: every edge has two incident faces`,
      );
      for (const attribute of [
        ...geometry.morphAttributes.position!,
        ...geometry.morphAttributes.normal!,
      ]) {
        assert.equal(attribute.count, position.count);
        assert.ok(Array.from(attribute.array).every(Number.isFinite));
      }
      const half = position.count / 2;
      for (let i = 0; i < half; i++) {
        const distance = Math.hypot(
          position.getX(i) - position.getX(i + half),
          position.getY(i) - position.getY(i + half),
          position.getZ(i) - position.getZ(i + half),
        );
        assert.ok(distance > 0, `${type}: nonzero physical thickness`);
      }
      geometry.dispose();
    }
});
test("bloom reaches both exact endpoints and opens monotonically with offsets", () => {
  for (const delay of [-0.05, 0, 0.13, 0.25])
    for (const phase of [0, 2, 6.2]) {
      assert.equal(petalOpenness(0, delay, phase), 0);
      assert.equal(petalOpenness(1, delay, phase), 1);
      let previous = 0;
      for (let i = 0; i <= 100; i++) {
        const open = petalOpenness(i / 100, delay, phase);
        assert.ok(open >= previous);
        previous = open;
      }
    }
});
test("seeded geometry and random sequences are reproducible", () => {
  const a = seededRandom(12),
    b = seededRandom(12);
  for (let i = 0; i < 100; i++) assert.equal(a(), b());
  const first = createPetalGeometry(PETAL, 123, "medium"),
    second = createPetalGeometry(PETAL, 123, "medium"),
    third = createPetalGeometry(PETAL, 124, "medium");
  assert.deepEqual(
    first.getAttribute("position").array,
    second.getAttribute("position").array,
  );
  assert.notDeepEqual(
    first.getAttribute("position").array,
    third.getAttribute("position").array,
  );
  first.dispose();
  second.dispose();
  third.dispose();
});
test("spring remains stable after a background-tab time jump and reverses smoothly", () => {
  const state = { value: 0, velocity: 0 };
  for (let i = 0; i < 180; i++) stepSpring(state, 1, 1 / 60);
  assert.ok(Math.abs(state.value - 1) < 0.001);
  stepSpring(state, 0, 10);
  assert.ok(
    Number.isFinite(state.value) && state.value >= 0 && state.value <= 1,
  );
  for (let i = 0; i < 180; i++) stepSpring(state, 0, 1 / 60);
  assert.ok(Math.abs(state.value) < 0.001);
});
test("species preserve their defining organ counts", () => {
  const count = (s: FlowerStructure) =>
    s.layers.reduce((sum, layer) => sum + layer.count, 0);
  assert.equal(count(structures.tulip), 6);
  assert.equal(count(structures.lily), 6);
  assert.equal(count(structures.hibiscus), 5);
  assert.equal(count(structures["cherry-blossom"]), 5);
  assert.ok(count(structures.dahlia) > 200);
  assert.ok(count(structures.chrysanthemum) > 200);
  assert.equal(structures.sunflower.center, "seeds");
  assert.equal(structures.lotus.center, "pod");
  assert.ok(structures.jasmine.blossoms!.length > 1);
});
