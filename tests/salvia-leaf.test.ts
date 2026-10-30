import test from "node:test";
import assert from "node:assert/strict";
import {
  SALVIA_LEAF,
  SALVIA_PETIOLE,
  SALVIA_FOLIAGE_NODES,
} from "../components/flowers/salvia/salviaLeaf";
import { specimenGeometry, SINGLE_CLUSTER } from "../lib/three/specimenModel";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("salvia foliage", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [SALVIA_LEAF],
  organs: [],
});
test("salvia: real serrated ovate blades retain their teeth at all tiers and meet their petioles", () => {
  assert.deepEqual(SALVIA_PETIOLE.points.at(-1), SALVIA_LEAF.sample(0.5, 0, 1));
  for (let n = 0; n < SALVIA_FOLIAGE_NODES.length; n += 2) {
    assert.equal(SALVIA_FOLIAGE_NODES[n].t, SALVIA_FOLIAGE_NODES[n + 1].t);
    assert.equal(
      SALVIA_FOLIAGE_NODES[n + 1].angle - SALVIA_FOLIAGE_NODES[n].angle,
      Math.PI,
    );
  }
  for (const q of ["overview", "low", "medium", "high", "ultra"] as const) {
    const g = specimenGeometry(SALVIA_LEAF, q),
      p = g.getAttribute("position"),
      uv = g.getAttribute("uv"),
      edge: number[] = [];
    for (let i = 0; i < p.count / 2; i++)
      if (uv.getX(i) === 1) edge.push(p.getX(i));
    let teeth = 0;
    for (let i = 1; i < edge.length - 1; i++)
      if (edge[i] < edge[i - 1] && edge[i] < edge[i + 1]) teeth++;
    assert.ok(teeth >= 5, `${q} only ${teeth} teeth`);
    g.dispose();
  }
});
