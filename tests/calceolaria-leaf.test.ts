import test from "node:test";
import assert from "node:assert/strict";
import { Matrix4, Vector3 } from "three";
import {
  CALCEOLARIA_LEAF,
  CALCEOLARIA_PETIOLE,
  CALCEOLARIA_LEAF_NODES,
  CALCEOLARIA_LEAF_TILT,
} from "../components/flowers/calceolaria/calceolariaLeaf";
import { verifySpecimen } from "./specimen-checks";
import { writeStemNodeMatrix } from "../lib/three/plantAttachments";
import { specimenGeometry } from "../lib/three/specimenModel";

verifySpecimen("calceolaria rugose foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  organs: [],
  surfaces: [CALCEOLARIA_LEAF],
});

test("calceolaria: oblong leaves keep a short attached petiole, continuous midrib and real wrinkled tissue", () => {
  assert.deepEqual(
    CALCEOLARIA_PETIOLE.points.at(-1),
    CALCEOLARIA_LEAF.sample(0.5, 0, 1),
  );
  const tip = CALCEOLARIA_LEAF.sample(0.5, 1, 1),
    base = CALCEOLARIA_LEAF.sample(0.5, 0, 1),
    middle = CALCEOLARIA_LEAF.sample(1, 0.5, 1),
    root = CALCEOLARIA_LEAF.sample(1, 0, 1);
  assert.ok(tip[1] - base[1] > 0.8);
  assert.ok(middle[0] > 0.14 && middle[0] < 0.25);
  assert.ok(Math.abs(root[0]) < 0.009);
  for (const v of [0, 0.2, 0.4, 0.6, 0.8, 1])
    assert.equal(CALCEOLARIA_LEAF.sample(0.5, v, 1)[0], 0);
  const relief = [0.28, 0.31, 0.34, 0.37, 0.4].map(
    (v) => CALCEOLARIA_LEAF.sample(0.75, v, 1)[2],
  );
  assert.ok(
    Math.max(...relief) - Math.min(...relief) > 0.012,
    "rugosity must be present in geometry",
  );
});

test("calceolaria: three opposite pairs rotate decussately around the actual rooted shoot", () => {
  assert.equal(CALCEOLARIA_LEAF_NODES.length, 6);
  assert.ok(CALCEOLARIA_LEAF_TILT > 0.7 && CALCEOLARIA_LEAF_TILT < 1.3);
  const matrix = new Matrix4(),
    root = new Vector3(),
    state = {
      stemLength: 1.78,
      supportHeight: 0,
      growth: 0.63,
      motion: { x: 0.21, z: -0.17, drop: 0.032 },
      head: new Matrix4(),
    };
  for (let i = 0; i < CALCEOLARIA_LEAF_NODES.length; i += 2) {
    const a = CALCEOLARIA_LEAF_NODES[i],
      b = CALCEOLARIA_LEAF_NODES[i + 1];
    assert.equal(a.t, b.t);
    assert.ok(Math.abs(b.angle - a.angle - Math.PI) < 1e-12);
    if (i > 0)
      assert.ok(
        Math.abs(a.angle - CALCEOLARIA_LEAF_NODES[i - 2].angle - Math.PI / 2) <
          1e-12,
      );
    writeStemNodeMatrix(matrix, a, state);
    root.set(0, 0, 0).applyMatrix4(matrix);
    assert.ok(root.y < -0.2 && root.y > -state.stemLength);
    const opposite = new Vector3().setFromMatrixPosition(
      writeStemNodeMatrix(matrix, b, state),
    );
    assert.ok(
      root.distanceTo(opposite) < 1e-12,
      "opposite leaves must share the rendered insertion",
    );
  }
});

test("calceolaria: actual overview leaf buffer preserves an oblong curved blade rather than a flat quad", () => {
  const geometry = specimenGeometry(CALCEOLARIA_LEAF, "overview");
  try {
    const p = geometry.getAttribute("position"),
      uv = geometry.getAttribute("uv"),
      inner: number[] = [],
      edge: number[] = [];
    for (let i = 0; i < p.count / 2; i++) {
      if (
        uv.getY(i) > 0.2 &&
        uv.getY(i) < 0.8 &&
        Math.abs(uv.getX(i) - 0.5) < 0.01
      )
        inner.push(p.getZ(i));
      if (uv.getX(i) === 1) edge.push(p.getX(i));
    }
    assert.ok(Math.max(...edge) > 0.15);
    assert.ok(Math.max(...inner) - Math.min(...inner) > 0.015);
    assert.ok(p.count < 500, "distant rugosity must remain bounded");
  } finally {
    geometry.dispose();
  }
});
