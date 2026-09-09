import assert from "node:assert/strict";
import test from "node:test";
import type { BufferGeometry } from "three";
import {
  createLotusReceptacle,
  createLotusStamenParts,
  lotusCarpels,
  lotusStamenLayout,
  receptacleTop,
} from "../components/flowers/lotus/lotusHeartGeometry";
import { createLotusLeaf } from "../components/flowers/lotus/lotusLeafGeometry";

function assertClosed(geometry: BufferGeometry) {
  const p = geometry.getAttribute("position"),
    n = geometry.getAttribute("normal"),
    index = geometry.index!.array;
  assert.ok(Array.from(p.array).every(Number.isFinite));
  assert.ok(Array.from(n.array).every(Number.isFinite));
  const edges = new Map<string, number>();
  for (let i = 0; i < index.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = index[i + j],
        b = index[i + ((j + 1) % 3)];
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok(
    [...edges.values()].every((faces) => faces === 2),
    "all organ surfaces are sealed",
  );
}

test("lotus organs have sealed geometry and correctly facing receptacle/leaf surfaces", () => {
  for (const quality of ["high", "ultra"] as const) {
    const receptacle = createLotusReceptacle(0.25, 0.51, quality),
      leaf = createLotusLeaf(quality),
      parts = createLotusStamenParts(quality);
    for (const geometry of [receptacle, leaf, ...Object.values(parts)])
      assertClosed(geometry);
    const normals = receptacle.getAttribute("normal");
    assert.ok(normals.getY(normals.count - 1) > 0.9, "top faces the light");
    assert.ok(normals.getY(normals.count - 2) < -0.9, "base faces downward");
    const leafNormals = leaf.getAttribute("normal");
    assert.ok(leafNormals.getY(leafNormals.count - 2) > 0.9);
    assert.ok(leafNormals.getY(leafNormals.count - 1) < -0.9);
    for (const geometry of [receptacle, leaf, ...Object.values(parts)])
      geometry.dispose();
  }
});

test("lotus has recessed carpel sockets and deterministic varied stamens", () => {
  const carpels = lotusCarpels(0.25);
  for (const c of carpels) {
    assert.ok(Math.hypot(c.x, c.z) + c.radius < 0.25);
    const baseHeight = 0.51 + 0.007 * (1 - (Math.hypot(c.x, c.z) / 0.25) ** 2);
    assert.ok(
      receptacleTop(c.x, c.z, 0.25, 0.51, carpels) < baseHeight - 0.005,
    );
  }
  const stamens = lotusStamenLayout();
  assert.equal(stamens.length, 156);
  assert.deepEqual(stamens, lotusStamenLayout());
  assert.equal(new Set(stamens.map((s) => s.length)).size, stamens.length);
  assert.equal(new Set(stamens.map((s) => s.radius)).size, 4);
});
