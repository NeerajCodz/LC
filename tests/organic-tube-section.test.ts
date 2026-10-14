import test from "node:test";
import assert from "node:assert/strict";
import { Matrix4, Vector3 } from "three";
import { createOrganicTube } from "../lib/three/organicTube";

test("organic tube section roll rotates a flattened tissue section while preserving capped topology", () => {
  const options = {
    points: [
      [0, -0.02, 0],
      [0, 0, 0],
      [0, 0.02, 0],
    ] as [number, number, number][],
    radius: 0.026,
    endRadius: 0.018,
    flatten: 0.32,
    segments: 12,
    sides: 12,
  };
  const base = createOrganicTube(options);
  const rolled = createOrganicTube({ ...options, sectionRoll: Math.PI / 2 });
  const unchanged = createOrganicTube({ ...options, sectionRoll: 0 });
  try {
    assert.deepEqual(
      unchanged.getAttribute("position").array,
      base.getAttribute("position").array,
    );
    assert.deepEqual(
      unchanged.getAttribute("normal").array,
      base.getAttribute("normal").array,
    );
    assert.deepEqual(rolled.index!.array, base.index!.array);
    const rotate = new Matrix4().makeRotationY(Math.PI / 2),
      p = new Vector3();
    for (const name of ["position", "normal"] as const) {
      const a = base.getAttribute(name),
        b = rolled.getAttribute(name);
      for (let i = 0; i < a.count; i++) {
        p.fromBufferAttribute(a, i).applyMatrix4(rotate);
        assert.ok(
          p.distanceTo(new Vector3().fromBufferAttribute(b, i)) < 1e-6,
          `${name} ${i} must follow the transported section roll`,
        );
      }
    }
    const edges = new Map<string, number>(),
      indices = rolled.index!.array;
    for (let i = 0; i < indices.length; i += 3)
      for (let edge = 0; edge < 3; edge++) {
        const a = indices[i + edge],
          b = indices[i + ((edge + 1) % 3)];
        const key = `${Math.min(a, b)}:${Math.max(a, b)}`;
        edges.set(key, (edges.get(key) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((count) => count === 2));
  } finally {
    base.dispose();
    rolled.dispose();
    unchanged.dispose();
  }
});
