import assert from "node:assert/strict";
import test from "node:test";
import type { BufferGeometry } from "three";
import {
  specimenGeometry,
  type SpecimenModel,
  type SpecimenSurface,
} from "../lib/three/specimenModel";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import { PROTEA_MODEL } from "../components/flowers/king-protea/proteaGeometry";
import { COSMOS_MODEL } from "../components/flowers/cosmos/cosmosGeometry";
import { ZINNIA_MODEL } from "../components/flowers/zinnia/zinniaGeometry";
import { GERBERA_MODEL } from "../components/flowers/gerbera/gerberaGeometry";
import { HYDRANGEA_MODEL } from "../components/flowers/hydrangea/hydrangeaGeometry";
import { BOTTLEBRUSH_MODEL } from "../components/flowers/bottlebrush/bottlebrushGeometry";
import { AGAPANTHUS_MODEL } from "../components/flowers/agapanthus/agapanthusGeometry";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
import { HYACINTH_MODEL } from "../components/flowers/hyacinth/hyacinthGeometry";
import { BLUEBELL_MODEL } from "../components/flowers/bluebell/bluebellGeometry";
import { LILY_OF_THE_VALLEY_MODEL } from "../components/flowers/lily-of-the-valley/lilyOfTheValleyGeometry";
import { LISIANTHUS_MODEL } from "../components/flowers/lisianthus/lisianthusGeometry";
import { ALSTROEMERIA_MODEL } from "../components/flowers/alstroemeria/alstroemeriaGeometry";
import { SNOWDROP_MODEL } from "../components/flowers/snowdrop/snowdropGeometry";
import { GARDENIA_MODEL } from "../components/flowers/gardenia/gardeniaGeometry";
import { AMARYLLIS_MODEL } from "../components/flowers/amaryllis/amaryllisGeometry";
import { CAMELLIA_MODEL } from "../components/flowers/camellia/camelliaGeometry";
import { HELLEBORE_MODEL } from "../components/flowers/hellebore/helleboreGeometry";
import { RANUNCULUS_MODEL } from "../components/flowers/ranunculus/ranunculusGeometry";
import { ANEMONE_MODEL } from "../components/flowers/anemone/anemoneGeometry";
import { MAGNOLIA_MODEL } from "../components/flowers/magnolia/magnoliaGeometry";
import { SCABIOSA_MODEL } from "../components/flowers/scabiosa/scabiosaGeometry";

const models: SpecimenModel[] = [
  PROTEA_MODEL,
  COSMOS_MODEL,
  ZINNIA_MODEL,
  GERBERA_MODEL,
  HYDRANGEA_MODEL,
  BOTTLEBRUSH_MODEL,
  AGAPANTHUS_MODEL,
  AFRICAN_VIOLET_MODEL,
  HYACINTH_MODEL,
  BLUEBELL_MODEL,
  LILY_OF_THE_VALLEY_MODEL,
  LISIANTHUS_MODEL,
  ALSTROEMERIA_MODEL,
  SNOWDROP_MODEL,
  GARDENIA_MODEL,
  AMARYLLIS_MODEL,
  CAMELLIA_MODEL,
  HELLEBORE_MODEL,
  RANUNCULUS_MODEL,
  ANEMONE_MODEL,
  MAGNOLIA_MODEL,
  SCABIOSA_MODEL,
];

function finiteSealed(g: BufferGeometry) {
  const edges = new Map<string, number>();
  const ix = g.index!.array;
  for (let i = 0; i < ix.length; i += 3)
    for (let j = 0; j < 3; j++) {
      const a = ix[i + j],
        b = ix[i + ((j + 1) % 3)],
        key = a < b ? `${a}:${b}` : `${b}:${a}`;
      edges.set(key, (edges.get(key) ?? 0) + 1);
    }
  assert.ok([...edges.values()].every((count) => count === 2));
  for (const attribute of [
    g.getAttribute("position"),
    g.getAttribute("normal"),
    ...Object.values(g.morphAttributes).flat(),
  ]) {
    assert.equal(attribute.count, g.getAttribute("position").count);
    assert.ok(Array.from(attribute.array).every(Number.isFinite));
  }
}

function rim(g: BufferGeometry, axis: number) {
  const p = g.getAttribute("position"),
    uv = g.getAttribute("uv"),
    half = p.count / 2,
    values: number[] = [];
  for (let i = 0; i < half; i++)
    if (uv.getY(i) === 1)
      values.push((p.array[i * 3 + axis] + p.array[(i + half) * 3 + axis]) / 2);
  return values;
}

test("explicit dense shell grids free 576840 inputs while retaining every authored surface and instance pose", () => {
  let before = 0,
    after = 0;
  for (const model of models) {
    const poses = JSON.stringify(model.instances?.map((group) => group.poses));
    for (const surface of model.surfaces) {
      const a = specimenGeometry(surface, "overview"),
        b = specimenGeometry(
          { ...surface, overviewColumns: undefined },
          "overview",
        );
      after += a.index!.count;
      before += b.index!.count;
      if (surface.overviewColumns !== undefined) finiteSealed(a);
      a.dispose();
      b.dispose();
    }
    for (const group of model.instances ?? []) {
      const a = specimenInstanceGeometry(group, "overview"),
        b = specimenInstanceGeometry(
          {
            ...group,
            surfaces: group.surfaces.map((surface) => ({
              ...surface,
              overviewColumns: undefined,
            })),
          },
          "overview",
        );
      assert.equal(a.surfaces.length, group.surfaces.length);
      a.surfaces.forEach((g, i) => {
        after += g.index!.count * group.poses.length;
        before += b.surfaces[i].index!.count * group.poses.length;
        finiteSealed(g);
      });
      [...a.surfaces, ...a.organs, ...b.surfaces, ...b.organs].forEach((g) =>
        g.dispose(),
      );
    }
    assert.equal(
      JSON.stringify(model.instances?.map((group) => group.poses)),
      poses,
    );
  }
  assert.equal(before - after, 576840);
});

test("narrow periodic bases retain exact lobe peaks and notches while the Gerbera three-toothed limb remains intact", () => {
  for (const [model, lobes] of [
    [PROTEA_MODEL, 4],
    [COSMOS_MODEL, 5],
  ] as const) {
    const group = model.instances![0];
    const geometry = specimenInstanceGeometry(group, "overview").surfaces[0];
    const values = rim(geometry, 1);
    assert.equal(values.length, lobes * 2);
    assert.equal(
      values.filter(
        (y, i) =>
          y > values[(i + values.length - 1) % values.length] &&
          y > values[(i + 1) % values.length],
      ).length,
      lobes,
    );
    assert.equal(
      values.filter(
        (y, i) =>
          y < values[(i + values.length - 1) % values.length] &&
          y < values[(i + 1) % values.length],
      ).length,
      lobes,
    );
    geometry.dispose();
  }
  const parts = specimenInstanceGeometry(
    GERBERA_MODEL.instances![0],
    "overview",
  );
  const values = rim(parts.surfaces[1], 2);
  assert.equal(values.length, 7);
  assert.equal(
    values.filter(
      (z, i) =>
        i > 0 &&
        i < values.length - 1 &&
        z > values[i - 1] &&
        z > values[i + 1],
    ).length,
    3,
  );
  [...parts.surfaces, ...parts.organs].forEach((g) => g.dispose());
  // Scabiosa terminal coverage remains the exact already-validated prototype.
  for (const group of SCABIOSA_MODEL.instances ?? [])
    for (const surface of group.surfaces)
      assert.equal(surface.overviewColumns, undefined);
});

test("authored dense overview hints leave all four focused shell buffer tiers unchanged", () => {
  for (const model of models) {
    const checked = new Set<string>();
    const entries = [
      ...model.surfaces.map((surface) => ({ surface, instance: false })),
      ...(model.instances ?? []).flatMap((group) =>
        group.surfaces.map((surface) => ({ surface, instance: true })),
      ),
    ];
    for (const { surface, instance } of entries) {
      const key = `${surface.name}/${instance}`;
      if (surface.overviewColumns === undefined || checked.has(key)) continue;
      checked.add(key);
      const unhinted: SpecimenSurface = {
        ...surface,
        overviewColumns: undefined,
      };
      for (const quality of ["low", "medium", "high", "ultra"] as const) {
        const create = (s: SpecimenSurface) =>
          instance
            ? specimenInstanceGeometry(
                {
                  name: "actual prototype",
                  cluster: s.cluster,
                  surfaces: [s],
                  organs: [],
                  poses: [],
                },
                quality,
              ).surfaces[0]
            : specimenGeometry(s, quality);
        const actual = create(surface),
          original = create(unhinted);
        assert.deepEqual(
          actual.index!.array,
          original.index!.array,
          `${key} ${quality}`,
        );
        for (const name of Object.keys(original.attributes))
          assert.deepEqual(
            actual.getAttribute(name).array,
            original.getAttribute(name).array,
            `${key} ${quality} ${name}`,
          );
        for (const name of ["position", "normal"] as const)
          for (let i = 0; i < original.morphAttributes[name]!.length; i++)
            assert.deepEqual(
              actual.morphAttributes[name]![i].array,
              original.morphAttributes[name]![i].array,
              `${key} ${quality} folded ${name}`,
            );
        actual.dispose();
        original.dispose();
      }
    }
  }
});
