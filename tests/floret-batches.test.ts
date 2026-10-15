import assert from "node:assert/strict";
import test from "node:test";
import { type BufferGeometry } from "three";
import { specimenInstanceGeometry } from "../lib/three/floretInstances";
import type { SpecimenInstanceGroup } from "../lib/three/specimenModel";
import { COSMOS_MODEL } from "../components/flowers/cosmos/cosmosGeometry";
import { SCABIOSA_MODEL } from "../components/flowers/scabiosa/scabiosaGeometry";
import { AFRICAN_VIOLET_MODEL } from "../components/flowers/african-violet/africanVioletGeometry";
import { AGAPANTHUS_MODEL } from "../components/flowers/agapanthus/agapanthusGeometry";
import { specimenInstanceBatches } from "../lib/three/floretBatches";

function expectConcatenation(actual: BufferGeometry, parts: BufferGeometry[]) {
  let vertices = 0;
  const indices: number[] = [];
  for (const part of parts) {
    indices.push(...Array.from(part.index!.array, (index) => index + vertices));
    vertices += part.getAttribute("position").count;
  }
  assert.deepEqual(Array.from(actual.index!.array), indices);
  for (const name of Object.keys(parts[0].attributes)) {
    const expected = parts.flatMap((part) =>
      Array.from(part.getAttribute(name).array),
    );
    assert.deepEqual(
      Array.from(actual.getAttribute(name).array),
      expected,
      name,
    );
  }
  for (const name of ["position", "normal"] as const) {
    const expected = parts.flatMap((part) =>
      Array.from(part.morphAttributes[name]![0].array),
    );
    assert.deepEqual(
      Array.from(actual.morphAttributes[name]![0].array),
      expected,
      `folded ${name}`,
    );
  }
}

test("overview packs compatible floret prototypes without changing any shell, organ, folded normal or authored pose", () => {
  for (const [group, expectedDraws] of [
    [COSMOS_MODEL.instances![0], 3],
    [SCABIOSA_MODEL.instances![0], 2],
    [SCABIOSA_MODEL.instances![1], 3],
    [AFRICAN_VIOLET_MODEL.instances![0], 1],
    [AGAPANTHUS_MODEL.instances![1], 1],
  ] as [SpecimenInstanceGroup, number][]) {
    const poses = JSON.stringify(group.poses);
    const original = specimenInstanceGeometry(group, "overview");
    const packed = specimenInstanceBatches(group, "overview");
    assert.equal(packed.surfaces.length + packed.organs.length, expectedDraws);
    assert.deepEqual(
      packed.surfaces
        .flatMap((part) => part.sourceIndices)
        .sort((a, b) => a - b),
      group.surfaces.map((_, i) => i),
      "all tissue prototypes are retained once",
    );
    for (const part of packed.surfaces) {
      assert.ok(
        part.sourceIndices.every(
          (i) =>
            group.surfaces[i].role === part.surface.role &&
            group.surfaces[i].tissue === part.surface.tissue,
        ),
        "different visible tissue channels cannot share a material",
      );
      expectConcatenation(
        part.geometry,
        part.sourceIndices.map((i) => original.surfaces[i]),
      );
    }
    if (original.organs.length) {
      assert.equal(packed.organs.length, 1);
      expectConcatenation(packed.organs[0], original.organs);
    }
    assert.equal(JSON.stringify(group.poses), poses);
    for (const geometry of [
      ...original.surfaces,
      ...original.organs,
      ...packed.surfaces.map((part) => part.geometry),
      ...packed.organs,
    ])
      geometry.dispose();
  }
});

test("focused floret tiers preserve their original separate prototype buffers", () => {
  const group = COSMOS_MODEL.instances![0];
  for (const quality of ["low", "medium", "high", "ultra"] as const) {
    const original = specimenInstanceGeometry(group, quality);
    const packed = specimenInstanceBatches(group, quality);
    assert.equal(packed.surfaces.length, group.surfaces.length);
    assert.equal(packed.organs.length, group.organs.length);
    packed.surfaces.forEach((part, i) => {
      assert.deepEqual(part.sourceIndices, [i]);
      expectConcatenation(part.geometry, [original.surfaces[i]]);
    });
    packed.organs.forEach((geometry, i) =>
      expectConcatenation(geometry, [original.organs[i]]),
    );
    for (const geometry of [
      ...original.surfaces,
      ...original.organs,
      ...packed.surfaces.map((part) => part.geometry),
      ...packed.organs,
    ])
      geometry.dispose();
  }
});
