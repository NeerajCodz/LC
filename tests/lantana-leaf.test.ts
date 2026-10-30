import test from "node:test";
import assert from "node:assert/strict";
import {
  LANTANA_LEAF,
  LANTANA_PETIOLE,
  createLantanaShoot,
} from "../components/flowers/lantana/lantanaLeaf";
import { verifySpecimen } from "./specimen-checks";
verifySpecimen("lantana rugose foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  surfaces: [LANTANA_LEAF],
  organs: [],
});
test("lantana leaves: petiolate ovate rugose blade has real crenate serrations", () => {
  assert.equal(
    LANTANA_LEAF.sample(0.5, 0, 1)[1],
    LANTANA_PETIOLE.points.at(-1)![1],
  );
  const width = (v: number) => LANTANA_LEAF.sample(1, v, 1)[0];
  assert.ok(width(0.35) > width(0.75) * 1.3);
  let turns = 0,
    last = 0;
  for (let i = 11; i < 89; i++) {
    const slope = width((i + 1) / 100) - width(i / 100);
    if (slope * last < 0) turns++;
    last = slope;
  }
  assert.ok(turns >= 12, String(turns));
  const z = [0.3, 0.32, 0.34, 0.36].map(
    (v) => LANTANA_LEAF.sample(0.7, v, 1)[2],
  );
  assert.ok(Math.max(...z) - Math.min(...z) > 0.002);
});
test("lantana shoot: young section is quadrangular and mature basal tissue stays rounder", () => {
  const g = createLantanaShoot("low", 1.8, 0.032),
    p = g.getAttribute("position");
  try {
    const ratio = (lo: number, hi: number) => {
      const radii = [];
      for (let i = 0; i < p.count; i++)
        if (p.getY(i) > lo && p.getY(i) < hi)
          radii.push(Math.hypot(p.getX(i), p.getZ(i)));
      return Math.max(...radii) / Math.min(...radii);
    };
    assert.ok(ratio(-0.25, -0.18) > 1.25);
    assert.ok(ratio(-1.5, -1.4) < 1.1);
    assert.ok(Array.from(p.array).every(Number.isFinite));
  } finally {
    g.dispose();
  }
});
