import test from "node:test";
import assert from "node:assert/strict";
import type { BufferGeometry } from "three";
import {
  createCoronaFilament,
  createPassionAxis,
  createPassionLeaf,
  createPassionPetiole,
  createPassionStamen,
  createPassionStyle,
  createPassionTendril,
  PASSION_CORONA,
} from "../components/flowers/passionflower/passionflowerGeometry";
import { passionflowerStructure } from "../components/flowers/passionflower/Passionflower";
import {
  bendWeight,
  bendSlope,
  freeStemLength,
  supportedBendSlope,
  supportedBendWeight,
} from "../lib/flowers/wind";

function inspectShell(g: BufferGeometry, label = "organ") {
  const count = g.getAttribute("position").count;
  for (const attr of [
    g.getAttribute("position"),
    g.getAttribute("normal"),
    ...(g.morphAttributes.position ?? []),
    ...(g.morphAttributes.normal ?? []),
  ]) {
    assert.equal(attr.count, count);
    assert.ok(Array.from(attr.array).every(Number.isFinite));
  }
  for (const attr of [
    g.getAttribute("normal"),
    ...(g.morphAttributes.normal ?? []),
  ]) {
    for (let i = 0; i < attr.count; i++)
      assert.ok(
        Math.abs(Math.hypot(attr.getX(i), attr.getY(i), attr.getZ(i)) - 1) <
          0.001,
      );
  }
  const edges = new Map<string, { uses: number; winding: number }>(),
    ix = g.index!.array;
  for (let i = 0; i < ix.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = ix[i + j],
        b = ix[i + ((j + 1) % 3)],
        key = a < b ? `${a}:${b}` : `${b}:${a}`;
      const edge = edges.get(key) ?? { uses: 0, winding: 0 };
      edge.uses++;
      edge.winding += a < b ? 1 : -1;
      edges.set(key, edge);
    }
  assert.ok(
    [...edges.values()].every((e) => e.uses === 2 && e.winding === 0),
    `${label}: closed surface with consistent triangle winding`,
  );
}

test("passionflower organs are sealed, finite, deterministic and preserve their morph normals", () => {
  for (const quality of ["low", "ultra"] as const) {
    for (const make of [
      createPassionAxis,
      createPassionLeaf,
      createPassionPetiole,
      createPassionStamen,
      createPassionStyle,
    ]) {
      const a = make(quality),
        b = make(quality);
      inspectShell(a, make.name);
      assert.deepEqual(
        a.getAttribute("position").array,
        b.getAttribute("position").array,
      );
      a.dispose();
      b.dispose();
    }
    const tendril = createPassionTendril(quality, 736);
    inspectShell(tendril);
    tendril.dispose();
    for (let ring = 0; ring < PASSION_CORONA.length; ring++) {
      const filament = createCoronaFilament(quality, ring);
      inspectShell(filament);
      filament.dispose();
    }
  }
});

test("the simple palmate blade has five separated lobes, paired surfaces and a connected base", () => {
  const leaf = createPassionLeaf("low"),
    p = leaf.getAttribute("position"),
    n = p.count / 2;
  assert.equal(n, 1001);
  assert.ok(leaf.getAttribute("normal").getZ(0) > 0.8);
  assert.ok(leaf.getAttribute("normal").getZ(n) < -0.8);
  for (let i = 0; i < n; i++) assert.ok(p.getZ(i) - p.getZ(i + n) >= 0.0069);
  const radii = Array.from({ length: 100 }, (_, i) =>
    Math.hypot(p.getX(901 + i), p.getY(901 + i)),
  );
  const peaks = radii.filter(
    (r, i) => r > 0.4 && r > radii[(i + 99) % 100] && r > radii[(i + 1) % 100],
  );
  assert.equal(peaks.length, 5);
  leaf.dispose();
});

test("long corona filaments have purple, pale and blue pigment zones and bounded mobile geometry", () => {
  let vertices = 0;
  for (let ring = 0; ring < PASSION_CORONA.length; ring++) {
    const g = createCoronaFilament("low", ring),
      c = g.getAttribute("color");
    vertices += g.getAttribute("position").count * PASSION_CORONA[ring].count;
    if (ring < 2) {
      const base = 0,
        middle = 6 * 6,
        tip = 11 * 6;
      assert.ok(c.getZ(base) > c.getY(base));
      assert.ok(c.getX(middle) > c.getX(base) * 4);
      assert.ok(c.getZ(tip) > c.getX(tip) * 2);
    }
    g.dispose();
  }
  assert.ok(vertices < 16000, `corona mobile vertex budget: ${vertices}`);
});

test("supported vine stays fixed below its tendril attachment and joins the free head smoothly", () => {
  const support = passionflowerStructure.supportHeight!;
  for (let i = 0; i <= 100; i++) {
    const t = i / 100;
    assert.equal(supportedBendWeight(t, 0), bendWeight(t));
    assert.equal(supportedBendSlope(t, 0), bendSlope(t));
    if (t <= support) {
      assert.equal(supportedBendWeight(t, support), 0);
      assert.equal(supportedBendSlope(t, support), 0);
    }
  }
  assert.equal(supportedBendWeight(1, support), 1);
  const epsilon = 1e-6;
  assert.ok(supportedBendWeight(support + epsilon, support) < 1e-8);
  const derivative =
    (supportedBendWeight(0.9 + epsilon, support) -
      supportedBendWeight(0.9 - epsilon, support)) /
    (2 * epsilon);
  assert.ok(Math.abs(derivative - supportedBendSlope(0.9, support)) < 1e-6);
  assert.ok(
    freeStemLength(passionflowerStructure) <
      passionflowerStructure.stemLength / 3,
  );
});
