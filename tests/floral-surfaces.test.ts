import test from "node:test";
import assert from "node:assert/strict";
import { createSpadix } from "../lib/three/spadixGeometry";
import {
  createFloralSurface,
  type FloralSurface,
} from "../lib/three/floralSurfaces";
const kinds: FloralSurface[] = [
  "corona",
  "calla",
  "anthurium",
  "pouch",
  "spur",
  "boat",
];

test("packed spadices have closed ends, outward normals and bounded mobile detail", () => {
  for (const anthurium of [true, false]) {
    const low = createSpadix("low", anthurium),
      macro = createSpadix("ultra", anthurium);
    assert.ok(low.getAttribute("position").count < 6000);
    assert.ok(
      macro.getAttribute("position").count > low.getAttribute("position").count,
    );
    for (const geometry of [low, macro]) {
      const normals = geometry.getAttribute("normal"),
        p = geometry.getAttribute("position");
      assert.ok(Array.from(p.array).every(Number.isFinite));
      assert.ok(Array.from(normals.array).every(Number.isFinite));
      assert.ok(normals.getY(normals.count - 2) < -0.9);
      assert.ok(normals.getY(normals.count - 1) > 0.9);
      const edges = new Map<string, number>(),
        index = geometry.index!.array;
      for (let i = 0; i < index.length; i += 3)
        for (let j = 0; j < 3; j++) {
          const a = index[i + j],
            b = index[i + ((j + 1) % 3)],
            key = a < b ? `${a}:${b}` : `${b}:${a}`;
          edges.set(key, (edges.get(key) ?? 0) + 1);
        }
      assert.ok([...edges.values()].every((n) => n === 2));
      geometry.dispose();
    }
  }
});
test("specialized organ shells are deterministic, sealed, finite and morph with matched normals", () => {
  for (const kind of kinds) {
    const a = createFloralSurface(kind, "low"),
      b = createFloralSurface(kind, "low");
    assert.deepEqual(
      a.getAttribute("position").array,
      b.getAttribute("position").array,
    );
    const count = a.getAttribute("position").count;
    for (const attr of [
      a.getAttribute("position"),
      a.getAttribute("normal"),
      ...a.morphAttributes.position!,
      ...a.morphAttributes.normal!,
    ]) {
      assert.equal(attr.count, count);
      assert.ok(Array.from(attr.array).every(Number.isFinite), kind);
    }
    const edges = new Map<string, number>(),
      ix = a.index!.array;
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const x = ix[i + j],
          y = ix[i + ((j + 1) % 3)],
          key = x < y ? `${x}:${y}` : `${y}:${x}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    assert.ok(
      [...edges.values()].every((n) => n === 2),
      kind,
    );
    const p = a.getAttribute("position");
    for (let i = 0; i < count / 2; i++)
      assert.ok(
        Math.hypot(
          p.getX(i) - p.getX(i + count / 2),
          p.getY(i) - p.getY(i + count / 2),
          p.getZ(i) - p.getZ(i + count / 2),
        ) > 0.001,
        kind,
      );
    a.dispose();
    b.dispose();
  }
});
