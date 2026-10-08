import assert from "node:assert/strict";
import test from "node:test";
import type { BufferGeometry } from "three";
import {
  createLotusStamenParts,
  LOTUS_STAMEN_COUNT,
} from "../components/flowers/lotus/lotusHeartGeometry";

function closed(geometry: BufferGeometry) {
  const p = geometry.getAttribute("position"),
    n = geometry.getAttribute("normal");
  assert.ok(Array.from(n.array).every(Number.isFinite));
  const welded = new Map<string, number>(),
    vertices: number[] = [];
  for (let i = 0; i < p.count; i++) {
    const key = [p.getX(i), p.getY(i), p.getZ(i)]
      .map((v) => Math.round(v * 1e8))
      .join(",");
    if (!welded.has(key)) welded.set(key, welded.size);
    vertices.push(welded.get(key)!);
  }
  const edges = new Map<string, number>(),
    ix = geometry.index!.array;
  for (let i = 0; i < ix.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = vertices[ix[i + j]],
        b = vertices[ix[i + ((j + 1) % 3)]];
      assert.notEqual(a, b);
      const key = a < b ? `${a}:${b}` : `${b}:${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok([...edges.values()].every((count) => count === 2));
}

test("distant Lotus keeps its paired anthers and appendages within a bounded closed prototype workload", () => {
  const parts = createLotusStamenParts("overview"),
    low = createLotusStamenParts("low");
  const values = Object.values(parts),
    workload =
      values.reduce((n, g) => n + g.index!.count, 0) * LOTUS_STAMEN_COUNT;
  assert.ok(
    workload < 180000,
    `${workload} submitted indices for the retained ${LOTUS_STAMEN_COUNT} stamens`,
  );
  for (const [key, geometry] of Object.entries(parts)) {
    closed(geometry);
    geometry.computeBoundingBox();
    low[key as keyof typeof low].computeBoundingBox();
    const full = low[key as keyof typeof low].boundingBox!,
      bound = geometry.boundingBox!;
    assert.ok(Math.abs(bound.min.y - full.min.y) < 0.006);
    assert.ok(Math.abs(bound.max.y - full.max.y) < 0.006);
  }
  for (const geometry of [...values, ...Object.values(low)]) geometry.dispose();
});
