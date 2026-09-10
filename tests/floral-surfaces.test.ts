import test from "node:test";
import assert from "node:assert/strict";
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
