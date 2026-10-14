import test from "node:test";
import assert from "node:assert/strict";
import {
  HOYA_MODEL,
  HOYA_STALKS,
  hoyaCorolla,
} from "../components/flowers/hoya/hoyaGeometry";
import { verifySpecimen } from "./specimen-checks";
import { HOYA_LEAF } from "../components/flowers/hoya/hoyaLeaf";

test("hoya is complete throughout the typed botanical catalog", async () => {
  const { FLOWER_TYPES } = await import("../lib/flowers/types"),
    { getFlower } = await import("../lib/flowers/catalog"),
    { FLOWER_STRUCTURES } = await import("../lib/flowers/structures"),
    { WIND_PROFILES } = await import("../lib/flowers/wind");
  const type = FLOWER_TYPES.find((t) => String(t) === "hoya");
  assert.ok(type, "Hoya catalog integration is missing");
  assert.equal(getFlower(type).latin, "Hoya carnosa");
  assert.equal(FLOWER_STRUCTURES[type].layers.length, 0);
  assert.equal(FLOWER_STRUCTURES[type].simulatedSurfaces, true);
  assert.equal(FLOWER_STRUCTURES[type].airbornePollen, false);
  assert.ok(FLOWER_STRUCTURES[type].supportHeight! > 0);
  assert.ok(WIND_PROFILES[type].compliance > 0);
});
import {
  specimenOrganParts,
  specimenOrganCarrier,
} from "../lib/three/specimenModel";
import { petalOpenness } from "../lib/three/easing";
import { Vector3 } from "three";

test("hoya: all ten anatomical pollinia survive the actual renderer partition at overview and low quality", () => {
  for (const quality of ["overview", "low"] as const)
    for (let cluster = 0; cluster < HOYA_MODEL.clusters.length; cluster++) {
      const parts = [
        ...specimenOrganParts(HOYA_MODEL, cluster, quality, true),
        ...specimenOrganParts(HOYA_MODEL, cluster, quality, false),
      ];
      try {
        assert.equal(
          parts.filter((p) => p.organ.name === "paired pollinium").length,
          10,
          `${quality} cluster ${cluster}`,
        );
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
});

test("hoya: actual pollinium and gynostegium cap coordinates follow the enclosing corolla through reverse bloom", () => {
  for (const quality of ["overview", "low"] as const)
    for (let cluster = 0; cluster < HOYA_MODEL.clusters.length; cluster++) {
      const parts = specimenOrganParts(HOYA_MODEL, cluster, quality, true),
        carrier = specimenOrganCarrier(HOYA_MODEL, cluster),
        reproductive = parts.filter((p) =>
          /pollinium|gynostegium/.test(p.organ.name),
        );
      try {
        assert.equal(reproductive.length, 11);
        for (const part of reproductive) {
          const position = part.geometry.getAttribute("position"),
            folded = part.geometry.morphAttributes.position![0],
            index = position.count - 1;
          assert.equal(
            part.geometry.morphAttributes.normal![0].count,
            position.count,
          );
          for (const bloom of [1, 0.5, 0, 0.5, 1]) {
            const open = petalOpenness(bloom, carrier.delay, carrier.phase),
              actual = new Vector3()
                .fromBufferAttribute(position, index)
                .lerp(
                  new Vector3().fromBufferAttribute(folded, index),
                  1 - open,
                ),
              fullTip = part.organ.points.at(-1)!,
              budTip = part.organ.foldedPoints!.at(-1)!,
              expected = new Vector3(...budTip).lerp(
                new Vector3(...fullTip),
                open,
              );
            assert.ok(
              actual.distanceTo(expected) < 1e-7,
              `${part.organ.name}: ${quality} bloom ${bloom}`,
            );
          }
        }
      } finally {
        parts.forEach((p) => p.geometry.dispose());
      }
    }
});

verifySpecimen("hoya", HOYA_MODEL);
verifySpecimen("hoya foliage", {
  clusters: [{ position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 }],
  surfaces: [HOYA_LEAF],
  organs: [],
});
test("hoya: fleshy entire leaf has a broad center and finite tapered insertion", () => {
  const base = HOYA_LEAF.sample(1, 0, 1),
    center = HOYA_LEAF.sample(1, 0.5, 1),
    tip = HOYA_LEAF.sample(1, 1, 1);
  assert.ok(center[0] > 0.2);
  assert.ok(base[0] < 0.02 && tip[0] < 0.02);
  assert.ok(HOYA_LEAF.thickness >= 0.02);
});

test("hoya: complete five-part corollas and coronas surround enclosed gynostegia", () => {
  assert.equal(HOYA_MODEL.clusters.length, 22);
  for (let c = 0; c < 22; c++) {
    const surfaces = HOYA_MODEL.surfaces.filter((s) => s.cluster === c);
    assert.equal(
      surfaces.filter((s) => s.name === "papillose five-lobed corolla").length,
      1,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "ridged waxy corona limb").length,
      5,
    );
    assert.equal(
      surfaces.filter((s) => s.name === "small calyx lobe").length,
      5,
    );
    const organs = HOYA_MODEL.organs.filter((o) => o.cluster === c);
    assert.equal(
      organs.filter((o) => o.name === "paired pollinium").length,
      10,
    );
    assert.equal(organs.filter((o) => o.name === "gynostegium").length, 1);
    for (const o of organs)
      for (const p of o.points) assert.ok(Math.hypot(p[0], p[2]) < 0.16);
  }
});

test("hoya: five genuine limb peaks persist and all pedicels converge at one umbel", () => {
  for (let i = 0; i < 5; i++) {
    const peak = hoyaCorolla(i / 5, 1, 1);
    const notch = hoyaCorolla((i + 0.5) / 5, 1, 1);
    assert.ok(
      Math.hypot(peak[0], peak[2]) > Math.hypot(notch[0], notch[2]) * 1.5,
    );
  }
  const stalks = HOYA_STALKS.filter((s) => s.name === "umbel pedicel");
  assert.equal(stalks.length, 22);
  for (let i = 0; i < stalks.length; i++) {
    assert.deepEqual(stalks[i].points[0], [0, -0.18, 0]);
    assert.deepEqual(stalks[i].points.at(-1), HOYA_MODEL.clusters[i].position);
  }
  const radii = HOYA_MODEL.clusters
    .slice(0, 19)
    .map((c) => Math.hypot(c.position[0], c.position[2]));
  assert.ok(Math.max(...radii) - Math.min(...radii) > 0.4);
  assert.ok(HOYA_MODEL.clusters.some((c) => c.position[1] > 0.1));
});
