import test from "node:test";
import assert from "node:assert/strict";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import type { SpecimenInstanceGroup } from "../lib/three/specimenModel";
const group: SpecimenInstanceGroup = {
  name: "five-lobed fused floret",
  cluster: 0,
  organs: [],
  poses: [],
  surfaces: [
    {
      name: "corolla",
      cluster: 0,
      role: "tube",
      periodic: true,
      thickness: 0.007,
      sample: (u, v, open) => {
        const a = u * Math.PI * 2,
          r =
            0.045 +
            open * v ** 3 * (0.02 + 0.025 * (0.5 + 0.5 * Math.cos(a * 5)));
        return [Math.cos(a) * r, v * 0.13, Math.sin(a) * r];
      },
    },
  ],
};
test("instanced fused corollas preserve five separate limb lobes at every quality", () => {
  for (const quality of [
    "overview",
    "low",
    "medium",
    "high",
    "ultra",
  ] as const) {
    const { surfaces, organs } = specimenInstanceGeometry(group, quality),
      g = surfaces[0];
    const uv = g.getAttribute("uv"),
      p = g.getAttribute("position"),
      half = p.count / 2;
    const rim: number[] = [];
    for (let i = 0; i < half; i++)
      if (uv.getY(i) === 1) rim.push(Math.hypot(p.getX(i), p.getZ(i)));
    const peaks = rim.filter(
      (r, i) =>
        r >= rim[(i + rim.length - 1) % rim.length] &&
        r > rim[(i + 1) % rim.length],
    );
    assert.equal(peaks.length, 5, `${quality} aliases the true five-lobed rim`);
    assert.ok(rim.length >= 24, `${quality} needs enough angular samples`);
    for (const attribute of [
      p,
      g.getAttribute("normal"),
      g.morphAttributes.position![0],
      g.morphAttributes.normal![0],
    ])
      assert.ok(Array.from(attribute.array).every(Number.isFinite));
    g.dispose();
    organs.forEach((o) => o.dispose());
  }
});
