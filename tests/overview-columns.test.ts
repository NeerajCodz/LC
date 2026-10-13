import assert from "node:assert/strict";
import test from "node:test";
import { createParametricShell } from "../lib/three/parametricShell";
import {
  specimenGeometry,
  type SpecimenSurface,
  type SpecimenInstanceGroup,
} from "../lib/three/specimenModel";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";

const dividedLimb: SpecimenSurface = {
  name: "split limb with three large and two small lobes",
  cluster: 0,
  role: "petal",
  thickness: 0.004,
  overviewColumns: 20,
  sample: (u, v, open) => {
    const wave = Math.sin(u * Math.PI * 5);
    const lobe = Math.abs(wave) * (wave > 0 ? 0.06 : 0.02);
    return [u * 0.2, v * 0.3, (0.05 + lobe) * v * open];
  },
};

test("an authored overview angular grid preserves three large and two small split-limb landmarks", () => {
  const group: SpecimenInstanceGroup = {
    name: "retained split florets",
    cluster: 0,
    surfaces: [dividedLimb],
    organs: [],
    poses: [
      {
        position: [0, 0, 0],
        rotation: [0, 0, 0],
        scale: 1,
        delay: 0,
        phase: 0,
      },
    ],
  };
  const head = specimenGeometry(dividedLimb, "overview");
  const prototype = specimenInstanceGeometry(group, "overview").surfaces[0];
  for (const geometry of [head, prototype]) {
    const p = geometry.getAttribute("position"),
      uv = geometry.getAttribute("uv");
    const rim: number[] = [];
    for (let i = 0; i < p.count / 2; i++)
      if (uv.getY(i) === 1) rim.push(p.getZ(i));
    assert.equal(rim.length, 21);
    const peaks = rim.filter(
      (z, i) => i > 0 && i < rim.length - 1 && z > rim[i - 1] && z > rim[i + 1],
    );
    assert.equal(peaks.length, 5);
    assert.equal(peaks.filter((z) => z > 0.1).length, 3);
    assert.equal(peaks.filter((z) => z < 0.1).length, 2);
    assert.equal(geometry.morphAttributes.normal![0].count, p.count);
    geometry.dispose();
  }
});

test("explicit smooth overview circumference keeps its three lobes and all focused grids unchanged", () => {
  const surface: SpecimenSurface = {
    ...dividedLimb,
    name: "smooth three-lobed ovary",
    role: "calyx",
    periodic: true,
    overviewColumns: 12,
    sample: (u, v) => {
      const a = u * Math.PI * 2;
      const r = 0.05 + 0.008 * Math.cos(a * 3);
      return [Math.cos(a) * r, v * 0.2, Math.sin(a) * r];
    },
  };
  const overview = specimenGeometry(surface, "overview");
  assert.equal(overview.index!.count, 1008);
  const unhinted = { ...surface, overviewColumns: undefined };
  const defaultHead = specimenGeometry(unhinted, "overview");
  assert.equal(defaultHead.index!.count, 2016);
  defaultHead.dispose();
  const p = overview.getAttribute("position"),
    uv = overview.getAttribute("uv"),
    rim: number[] = [];
  for (let i = 0; i < p.count / 2; i++)
    if (uv.getY(i) === 1) rim.push(Math.hypot(p.getX(i), p.getZ(i)));
  assert.equal(rim.length, 12);
  assert.equal(
    rim.filter((r, i) => r > rim[(i + 11) % 12] && r > rim[(i + 1) % 12])
      .length,
    3,
  );
  overview.dispose();
  for (const [quality, columns, rows] of [
    ["low", 12, 16],
    ["medium", 20, 24],
    ["high", 32, 32],
    ["ultra", 48, 44],
  ] as const) {
    const actual = specimenGeometry(surface, quality),
      expected = createParametricShell({ ...surface, columns, rows });
    assert.deepEqual(actual.index!.array, expected.index!.array);
    for (const name of ["position", "normal", "uv", "color"])
      assert.deepEqual(
        actual.getAttribute(name).array,
        expected.getAttribute(name).array,
      );
    for (const name of ["position", "normal"] as const)
      assert.deepEqual(
        actual.morphAttributes[name]![0].array,
        expected.morphAttributes[name]![0].array,
      );
    actual.dispose();
    expected.dispose();
  }
  const group: SpecimenInstanceGroup = {
    name: "smooth ovary prototypes",
    cluster: 0,
    surfaces: [surface],
    organs: [],
    poses: [],
  };
  const prototype = specimenInstanceGeometry(group, "overview").surfaces[0];
  assert.equal(prototype.index!.count, 576);
  prototype.dispose();
  const defaultPrototype = specimenInstanceGeometry(
    { ...group, surfaces: [unhinted] },
    "overview",
  ).surfaces[0];
  assert.equal(defaultPrototype.index!.count, 1152);
  defaultPrototype.dispose();
  for (const [quality, columns, rows] of [
    ["low", 24, 5],
    ["medium", 24, 7],
    ["high", 24, 9],
    ["ultra", 24, 12],
  ] as const) {
    const actual = specimenInstanceGeometry(group, quality).surfaces[0];
    const expected = createParametricShell({ ...surface, columns, rows });
    assert.deepEqual(actual.index!.array, expected.index!.array);
    for (const name of ["position", "normal", "uv", "color"])
      assert.deepEqual(
        actual.getAttribute(name).array,
        expected.getAttribute(name).array,
      );
    for (const name of ["position", "normal"] as const)
      assert.deepEqual(
        actual.morphAttributes[name]![0].array,
        expected.morphAttributes[name]![0].array,
      );
    actual.dispose();
    expected.dispose();
  }
});
