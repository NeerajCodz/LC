import test from "node:test";
import assert from "node:assert/strict";
import {
  TORENIA_LEAF,
  TORENIA_PETIOLE,
} from "../components/flowers/torenia/toreniaLeaf";
import { verifySpecimen } from "./specimen-checks";
import { specimenGeometry } from "../lib/three/specimenModel";
verifySpecimen("torenia toothed foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  organs: [],
  surfaces: [TORENIA_LEAF],
});

test("torenia: rendered leaf margins preserve repeated teeth at every geometry tier", () => {
  for (const quality of [
    "overview",
    "low",
    "medium",
    "high",
    "ultra",
  ] as const) {
    const geometry = specimenGeometry(TORENIA_LEAF, quality);
    try {
      const uv = geometry.getAttribute("uv"),
        positions = geometry.getAttribute("position"),
        edge: number[] = [];
      for (let i = 0; i < positions.count / 2; i++)
        if (uv.getX(i) === 1) edge.push(positions.getX(i));
      let notches = 0;
      for (let i = 1; i < edge.length - 1; i++)
        if (edge[i] < edge[i - 1] && edge[i] < edge[i + 1]) notches++;
      assert.ok(
        notches >= 4,
        `${quality}: the produced silhouette loses its toothed margin (${notches} notches)`,
      );
    } finally {
      geometry.dispose();
    }
  }
});
test("torenia: petiolate ovate leaves keep coarse teeth in actual sampled margins", () => {
  assert.deepEqual(
    TORENIA_PETIOLE.points.at(-1),
    TORENIA_LEAF.sample(0.5, 0, 1),
  );
  assert.ok(
    Math.abs(
      TORENIA_LEAF.sample(1, 0.5, 1)[0] -
        TORENIA_LEAF.sample(1, 0.5 + 1 / 24, 1)[0],
    ) > 0.025,
  );
});
