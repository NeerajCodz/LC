import test from "node:test";
import assert from "node:assert/strict";
import {
  specimenGeometry,
  type SpecimenSurface,
} from "../lib/three/specimenModel";
const blade = (): SpecimenSurface => ({
  name: "curved test blade",
  cluster: 0,
  role: "petal",
  thickness: 0.01,
  sample: (u, v, o) => [u, v, 0.1 * Math.sin(v * Math.PI) * o],
});
test("distant floral sampling keeps four axial intervals, explicit landmarks and unchanged leaf detail", () => {
  const cases: [SpecimenSurface, number][] = [
    [blade(), 4],
    [{ ...blade(), overviewRows: 12 }, 12],
    [{ ...blade(), tissue: "leaf" }, 6],
    [{ ...blade(), minimumRows: 8 }, 8],
  ];
  for (const [surface, rows] of cases) {
    const g = specimenGeometry(surface, "overview");
    try {
      assert.equal(
        g.getAttribute("position").count,
        2 * 7 * (rows + 1),
        surface.name,
      );
    } finally {
      g.dispose();
    }
  }
});
test("distant axial sampling leaves all focused geometry and contact parameters unchanged", () => {
  const surface = {
    ...blade(),
    flexible: true,
    cage: [8, 8] as [number, number],
    mobileCage: [4, 4] as [number, number],
  };
  for (const quality of ["low", "medium", "high", "ultra"] as const) {
    const original = specimenGeometry({ ...surface, overviewRows: 6 }, quality),
      next = specimenGeometry(surface, quality);
    try {
      assert.deepEqual(next.index!.array, original.index!.array);
      for (const key of ["position", "normal", "uv", "tissueSide"])
        assert.deepEqual(
          next.getAttribute(key).array,
          original.getAttribute(key).array,
        );
      for (const key of ["position", "normal"] as const)
        assert.deepEqual(
          next.morphAttributes[key]![0].array,
          original.morphAttributes[key]![0].array,
        );
    } finally {
      original.dispose();
      next.dispose();
    }
  }
  assert.deepEqual(surface.cage, [8, 8]);
  assert.deepEqual(surface.mobileCage, [4, 4]);
});
