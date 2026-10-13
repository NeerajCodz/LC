import test from "node:test";
import assert from "node:assert/strict";
import { createPalmateBlade, leafBlade } from "../lib/three/botanicalBlades";
import { specimenGeometry, SINGLE_CLUSTER } from "../lib/three/specimenModel";
import { createParametricShell } from "../lib/three/parametricShell";
import { ANEMONE_LEAF } from "../components/flowers/anemone/anemoneLeaf";
import { ANEMONE_MODEL } from "../components/flowers/anemone/anemoneGeometry";
import { RANUNCULUS_LEAFLET } from "../components/flowers/ranunculus/ranunculusLeaf";
import {
  PANSY_LEAF,
  PANSY_STIPULE,
} from "../components/flowers/pansy/pansyLeaf";
import {
  SCABIOSA_UPPER_LEAF,
  SCABIOSA_BASAL_LEAF,
} from "../components/flowers/scabiosa/scabiosaLeaf";
import { verifySpecimen } from "./specimen-checks";

const divided = [
  { name: "anemone leaflet", surface: ANEMONE_LEAF, lobes: 5 },
  { name: "pansy stipule", surface: PANSY_STIPULE, lobes: 5 },
  { name: "ranunculus leaflet", surface: RANUNCULUS_LEAFLET, lobes: 4 },
  { name: "scabiosa upper blade", surface: SCABIOSA_UPPER_LEAF, lobes: 5 },
];
const involucral = ANEMONE_MODEL.surfaces.filter(
  (s) => s.name === "involucral leaf",
);
verifySpecimen("actual deeply divided leaf profiles", {
  clusters: [SINGLE_CLUSTER],
  surfaces: [...divided.map((p) => p.surface), ...involucral],
  organs: [],
});

for (const profile of divided)
  test(`${profile.name}: real overview margins retain every deep division at folded, half and open states`, () => {
    const g = specimenGeometry(profile.surface, "overview"),
      p = g.getAttribute("position"),
      f = g.morphAttributes.position![0],
      uv = g.getAttribute("uv"),
      half = p.count / 2;
    for (const open of [0, 0.5, 1]) {
      const widths: number[] = [];
      for (let i = 0; i < half; i++)
        if (uv.getX(i) === 1)
          widths.push(
            Math.abs(
              (p.getX(i) + p.getX(i + half)) * 0.5 * open +
                (f.getX(i) + f.getX(i + half)) * 0.5 * (1 - open),
            ),
          );
      const peaks = widths.flatMap((width, i) =>
          i > 0 &&
          i < widths.length - 1 &&
          width > widths[i - 1] &&
          width > widths[i + 1]
            ? [i]
            : [],
        ),
        cuts = widths.flatMap((width, i) =>
          i > 0 &&
          i < widths.length - 1 &&
          width < widths[i - 1] &&
          width < widths[i + 1]
            ? [i]
            : [],
        ),
        midrib = 0.004 * (0.25 + 0.75 * open);
      assert.equal(
        peaks.length,
        profile.lobes,
        `${profile.name} at${open}: real silhouette lobes`,
      );
      assert.equal(cuts.length, profile.lobes - 1);
      cuts.forEach((cut, i) =>
        assert.ok(
          widths[cut] - midrib <
            0.6 *
              Math.min(
                widths[peaks[i]] - midrib,
                widths[peaks[i + 1]] - midrib,
              ),
          `${profile.name} at${open}: deep cut${i}`,
        ),
      );
    }
    g.dispose();
  });

test("anemone: actual transformed involucral leaves retain their four deeply cut lobes", () => {
  involucral.forEach((surface, k) => {
    const geometry = specimenGeometry(surface, "overview"),
      p = geometry.getAttribute("position"),
      f = geometry.morphAttributes.position![0],
      uv = geometry.getAttribute("uv"),
      half = p.count / 2,
      a = (k * Math.PI * 2) / 3;
    for (const open of [0, 0.5, 1]) {
      const widths: number[] = [];
      for (let i = 0; i < half; i++)
        if (uv.getX(i) === 1) {
          const x =
              (p.getX(i) + p.getX(i + half)) * 0.5 * open +
              (f.getX(i) + f.getX(i + half)) * 0.5 * (1 - open),
            z =
              (p.getZ(i) + p.getZ(i + half)) * 0.5 * open +
              (f.getZ(i) + f.getZ(i + half)) * 0.5 * (1 - open);
          widths.push(Math.abs(Math.cos(a) * x - Math.sin(a) * z));
        }
      const peaks = widths.flatMap((w, i) =>
          i > 0 &&
          i < widths.length - 1 &&
          w > widths[i - 1] &&
          w > widths[i + 1]
            ? [i]
            : [],
        ),
        cuts = widths.flatMap((w, i) =>
          i > 0 &&
          i < widths.length - 1 &&
          w < widths[i - 1] &&
          w < widths[i + 1]
            ? [i]
            : [],
        ),
        midrib = 0.004 * (0.7375 + 0.2625 * open);
      assert.equal(peaks.length, 4);
      assert.equal(cuts.length, 3);
      cuts.forEach((cut, i) =>
        assert.ok(
          widths[cut] - midrib <
            0.6 *
              Math.min(
                widths[peaks[i]] - midrib,
                widths[peaks[i + 1]] - midrib,
              ),
        ),
      );
    }
    geometry.dispose();
  });
});

test("deep-leaf resolution changes only overview and leaves real shallow profiles untouched", () => {
  for (const surface of [...divided.map((p) => p.surface), ...involucral])
    for (const [quality, columns, rows] of [
      ["low", 12, 16],
      ["medium", 20, 24],
      ["high", 32, 32],
      ["ultra", 48, 44],
    ] as const) {
      const actual = specimenGeometry(surface, quality),
        original = createParametricShell({ ...surface, columns, rows });
      for (const name of ["position", "normal", "uv", "color"])
        assert.deepEqual(
          actual.getAttribute(name).array,
          original.getAttribute(name).array,
          `${surface.name} ${quality} ${name}`,
        );
      assert.deepEqual(actual.index!.array, original.index!.array);
      for (const name of ["position", "normal"] as const)
        assert.deepEqual(
          actual.morphAttributes[name]![0].array,
          original.morphAttributes[name]![0].array,
        );
      actual.dispose();
      original.dispose();
    }
  for (const surface of [
    PANSY_LEAF,
    SCABIOSA_BASAL_LEAF,
    leafBlade("entire control blade", 0.6, 0.16),
  ]) {
    const actual = specimenGeometry(surface, "overview"),
      original = createParametricShell({ ...surface, columns: 6, rows: 6 });
    for (const name of ["position", "normal", "uv", "color"])
      assert.deepEqual(
        actual.getAttribute(name).array,
        original.getAttribute(name).array,
      );
    assert.deepEqual(actual.index!.array, original.index!.array);
    for (const name of ["position", "normal"] as const)
      assert.deepEqual(
        actual.morphAttributes[name]![0].array,
        original.morphAttributes[name]![0].array,
      );
    actual.dispose();
    original.dispose();
  }
});

test("a divided simple blade remains sealed, deterministic and thick with valid folded normals", () => {
  for (const quality of ["low", "high"] as const) {
    const g = createPalmateBlade(quality, 5),
      b = createPalmateBlade(quality, 5);
    const p = g.getAttribute("position"),
      f = g.morphAttributes.position![0];
    assert.deepEqual(p.array, b.getAttribute("position").array);
    for (const a of [
      p,
      f,
      g.getAttribute("normal"),
      g.morphAttributes.normal![0],
    ])
      assert.ok(Array.from(a.array).every(Number.isFinite));
    for (const a of [g.getAttribute("normal"), g.morphAttributes.normal![0]])
      for (let i = 0; i < a.count; i++)
        assert.ok(
          Math.abs(Math.hypot(a.getX(i), a.getY(i), a.getZ(i)) - 1) < 0.002,
        );
    const edges = new Map<string, number>(),
      ix = g.index!.array;
    for (let i = 0; i < ix.length; i += 3)
      for (let j = 0; j < 3; j++) {
        const a = ix[i + j],
          b = ix[i + ((j + 1) % 3)],
          k = a < b ? `${a}:${b}` : `${b}:${a}`;
        edges.set(k, (edges.get(k) ?? 0) + 1);
      }
    assert.ok([...edges.values()].every((n) => n === 2));
    for (const a of [p, f])
      for (let i = 0; i < a.count / 2; i++)
        assert.ok(
          Math.hypot(
            a.getX(i) - a.getX(i + a.count / 2),
            a.getY(i) - a.getY(i + a.count / 2),
            a.getZ(i) - a.getZ(i + a.count / 2),
          ) > 0.006,
        );
    assert.equal(g.getAttribute("tissueSide").count, p.count);
    const colors = g.getAttribute("color");
    assert.ok(colors);
    assert.equal(colors.count, p.count);
    assert.ok(
      Array.from(colors.array).every((value) => value === 1),
      "procedural pigment receives neutral vertex colors",
    );
    g.dispose();
    b.dispose();
  }
});
