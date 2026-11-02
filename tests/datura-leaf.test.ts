import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import {
  DATURA_LEAF,
  DATURA_PETIOLE,
  DATURA_FOLIAGE_NODES,
  DATURA_FORKS,
  DATURA_LEAF_TILT,
  DATURA_STEM_LENGTH,
} from "../components/flowers/datura/daturaLeaf";
import { specimenGeometry, SINGLE_CLUSTER } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("datura foliage", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [DATURA_LEAF],
  organs: [],
});
test("datura: sealed ovate foliage retains coarse irregular teeth at every tier and meets its petiole", () => {
  assert.deepEqual(DATURA_LEAF.sample(0.5, 0, 1), DATURA_PETIOLE.points.at(-1));
  for (const quality of [
    "overview",
    "low",
    "medium",
    "high",
    "ultra",
  ] as const) {
    const g = specimenGeometry(DATURA_LEAF, quality),
      p = g.getAttribute("position"),
      uv = g.getAttribute("uv");
    try {
      const edge = Array.from({ length: p.count / 2 }, (_, i) => i)
        .filter((i) => uv.getX(i) === 1)
        .map((i) => p.getX(i));
      let teeth = 0;
      for (let i = 1; i < edge.length - 1; i++)
        if (edge[i] > edge[i - 1] && edge[i] > edge[i + 1]) teeth++;
      assert.ok(teeth >= 3, `${quality} has only ${teeth} coarse teeth`);
    } finally {
      g.dispose();
    }
  }
  assert.notEqual(
    DATURA_LEAF.sample(0, 0.35, 1)[0],
    -DATURA_LEAF.sample(1, 0.35, 1)[0],
  );
});
test("datura: upper foliage inserts on both real forks and every transformed blade clears the planting point", () => {
  assert.equal(DATURA_FORKS.length, 2);
  assert.deepEqual(DATURA_FORKS[0].points[0], DATURA_FORKS[1].points[0]);
  for (let i = 0; i < 2; i++) {
    const node = DATURA_FOLIAGE_NODES.at(-2 + i)!,
      tip = DATURA_FORKS[i].points.at(-1)!;
    const insertion = [
      0.025 * Math.sin(node.t * Math.PI) + (node.offset?.[0] ?? 0),
      -DATURA_STEM_LENGTH +
        DATURA_STEM_LENGTH * node.t +
        (node.offset?.[1] ?? 0),
      node.offset?.[2] ?? 0,
    ];
    assert.ok(
      Math.hypot(...tip.map((n, k) => n - insertion[k])) < 0.005,
      "leaf floats off fork",
    );
  }
  const g = specimenGeometry(DATURA_LEAF, "high"),
    p = g.getAttribute("position");
  try {
    for (const node of DATURA_FOLIAGE_NODES)
      for (let i = 0; i < p.count; i++) {
        const point = new Vector3(p.getX(i), p.getY(i), p.getZ(i))
          .multiplyScalar(node.scale)
          .applyEuler(new Euler(DATURA_LEAF_TILT, node.angle, 0.1, "YXZ"));
        point.y +=
          -DATURA_STEM_LENGTH +
          DATURA_STEM_LENGTH * node.t +
          (node.offset?.[1] ?? 0);
        assert.ok(
          point.y > -DATURA_STEM_LENGTH,
          "blade crosses planting point",
        );
      }
  } finally {
    g.dispose();
  }
});
