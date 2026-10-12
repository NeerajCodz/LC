import test from "node:test";
import assert from "node:assert/strict";
import { Triangle, Vector3 } from "three";
import {
  SINGLE_CLUSTER,
  specimenGeometry,
  specimenOrganFollowsBloom,
  specimenOrganParts,
  specimenOrganCarrier,
  type SpecimenModel,
} from "../lib/three/specimenModel";
import { joinOrgans } from "../lib/three/floralOrgans";
import { petalOpenness } from "../lib/three/easing";
import { HYACINTH_MODEL } from "../components/flowers/hyacinth/hyacinthGeometry";
import { AMARYLLIS_MODEL } from "../components/flowers/amaryllis/amaryllisGeometry";
import { AGAPANTHUS_MODEL } from "../components/flowers/agapanthus/agapanthusGeometry";
import { CANNA_MODEL } from "../components/flowers/canna/cannaGeometry";

test("reproductive organs include stigmas in the renderer bloom partition while shoot attachments stay fixed", () => {
  for (const name of [
    "stamen filament",
    "paired anther chamber",
    "included style",
    "pistil",
    "pollen hair",
    "three-branched stigma tip",
    "marginal stigma ridge",
  ])
    assert.equal(specimenOrganFollowsBloom({ name }), true, name);
  for (const name of [
    "flower pedicel",
    "inferior ovary",
    "woody shoot",
    "calyx bristle",
  ])
    assert.equal(specimenOrganFollowsBloom({ name }), false, name);
});

test("renderer organ parts retain legacy fine-organ thinning and identity morph normals for mixed batches", () => {
  const model: SpecimenModel = {
    clusters: [SINGLE_CLUSTER],
    surfaces: [],
    organs: [
      {
        name: "pollen hair",
        cluster: 0,
        fine: true,
        points: [
          [0, 0, 0],
          [0, 0.04, 0],
          [0, 0.08, 0],
        ],
        radius: 0.002,
        color: "#eedccc",
      },
      {
        name: "flower pedicel",
        cluster: 0,
        points: [
          [0, -0.1, 0],
          [0, -0.05, 0],
          [0, 0, 0],
        ],
        radius: 0.01,
        color: "#719253",
      },
      {
        name: "pollen hair",
        cluster: 0,
        fine: true,
        points: [
          [0.01, 0, 0],
          [0.01, 0.04, 0],
          [0.01, 0.08, 0],
        ],
        radius: 0.002,
        color: "#eedccc",
      },
      {
        name: "style",
        cluster: 0,
        fine: true,
        points: [
          [0, 0, 0],
          [0, 0.1, 0],
          [0, 0.2, 0],
        ],
        foldedPoints: [
          [0, 0, 0],
          [0, 0.04, 0],
          [0, 0.08, 0],
        ],
        radius: 0.003,
        color: "#ddccb9",
      },
    ],
  };
  const parts = specimenOrganParts(model, 0, "low", true);
  assert.deepEqual(
    parts.map((part) => part.organ.name),
    ["pollen hair", "style"],
  );
  const identity = parts[0].geometry;
  assert.deepEqual(
    identity.morphAttributes.position![0].array,
    identity.getAttribute("position").array,
  );
  assert.deepEqual(
    identity.morphAttributes.normal![0].array,
    identity.getAttribute("normal").array,
  );
  const merged = joinOrgans(parts.map((part) => part.geometry));
  assert.equal(
    merged.morphAttributes.position![0].count,
    merged.getAttribute("position").count,
  );
  assert.equal(
    merged.morphAttributes.normal![0].count,
    merged.getAttribute("normal").count,
  );
  merged.dispose();
  const high = specimenOrganParts(model, 0, "high", true),
    attachments = specimenOrganParts(model, 0, "low", false);
  assert.deepEqual(
    high.map((part) => part.organ.name),
    ["pollen hair", "pollen hair", "style"],
  );
  assert.deepEqual(
    attachments.map((part) => part.organ.name),
    ["flower pedicel"],
  );
  assert.equal(
    attachments[0].geometry.morphAttributes.position?.length ?? 0,
    0,
  );
  [...high, ...attachments].forEach((part) => part.geometry.dispose());
});

for (const [name, model] of [
  ["hyacinth", HYACINTH_MODEL],
  ["amaryllis", AMARYLLIS_MODEL],
  ["agapanthus", AGAPANTHUS_MODEL],
] as [string, SpecimenModel][]) {
  test(`${name}: generated style and stigma roots stay attached in the renderer partition through reversed bloom`, () => {
    let measurements = 0;
    for (const quality of ["overview", "low", "high"] as const)
      for (let cluster = 0; cluster < model.clusters.length; cluster++) {
        const styles = model.organs.filter(
            (o) => o.cluster === cluster && /style/.test(o.name),
          ),
          stigmas = model.organs.filter(
            (o) => o.cluster === cluster && /stigma/.test(o.name),
          );
        if (!styles.length || !stigmas.length) continue;
        const parts = [
            ...specimenOrganParts(model, cluster, quality, false).map(
              (part) => ({ ...part, included: false }),
            ),
            ...specimenOrganParts(model, cluster, quality, true).map(
              (part) => ({ ...part, included: true }),
            ),
          ],
          carrier = specimenOrganCarrier(model, cluster),
          style = parts.find((part) => part.organ === styles[0])!;
        assert.ok(style);
        for (const stigmaOrgan of stigmas) {
          const stigma = parts.find((part) => part.organ === stigmaOrgan)!;
          assert.ok(stigma);
          for (const bloom of [1, 0.5, 0, 0.5, 1, 0]) {
            const open = petalOpenness(bloom, carrier.delay, carrier.phase);
            const cap = (part: typeof style, end: boolean) => {
              const p = part.geometry.getAttribute("position"),
                folded = part.geometry.morphAttributes.position?.[0],
                index = p.count - (end ? 1 : 2),
                point = new Vector3().fromBufferAttribute(p, index);
              if (part.included && folded)
                point.lerp(
                  new Vector3().fromBufferAttribute(folded, index),
                  1 - open,
                );
              return point;
            };
            assert.ok(
              cap(style, true).distanceTo(cap(stigma, false)) < 0.02,
              `${name} ${quality} bloom ${bloom}: actual generated stigma detached from folded style`,
            );
            measurements++;
          }
        }
        for (const { geometry } of parts) {
          if (geometry.morphAttributes.position?.length) {
            assert.equal(
              geometry.morphAttributes.normal![0].count,
              geometry.getAttribute("normal").count,
            );
            for (const normal of [
              geometry.getAttribute("normal"),
              geometry.morphAttributes.normal![0],
            ])
              for (let i = 0; i < normal.count; i++)
                assert.ok(
                  Math.abs(
                    Math.hypot(normal.getX(i), normal.getY(i), normal.getZ(i)) -
                      1,
                  ) < 0.002,
                );
          }
          geometry.dispose();
        }
      }
    assert.ok(
      measurements > 0,
      "the test must measure real stigma attachments",
    );
  });
}

test("canna: generated marginal stigma ridge remains on its flat style surface through reversed bloom", () => {
  let measurements = 0;
  for (const quality of ["overview", "low", "high"] as const)
    for (let cluster = 0; cluster < CANNA_MODEL.clusters.length; cluster++) {
      const surfaceIndex = CANNA_MODEL.surfaces.findIndex(
        (s) => s.cluster === cluster && s.name === "flat petaloid style",
      );
      if (surfaceIndex < 0) continue;
      const surface = CANNA_MODEL.surfaces[surfaceIndex],
        geometry = specimenGeometry(surface, quality),
        p = geometry.getAttribute("position"),
        folded = geometry.morphAttributes.position![0],
        indices = geometry.index!.array,
        parts = [
          ...specimenOrganParts(CANNA_MODEL, cluster, quality, false).map(
            (part) => ({ ...part, included: false }),
          ),
          ...specimenOrganParts(CANNA_MODEL, cluster, quality, true).map(
            (part) => ({ ...part, included: true }),
          ),
        ],
        stigma = parts.find(
          (part) => part.organ.name === "marginal stigma ridge",
        )!,
        carrier = specimenOrganCarrier(CANNA_MODEL, cluster),
        triangle = new Triangle(),
        nearest = new Vector3(),
        scratch = new Vector3();
      assert.ok(stigma);
      for (const bloom of [1, 0.5, 0, 0.5, 1, 0]) {
        const open = petalOpenness(bloom, carrier.delay, carrier.phase),
          styleOpen = petalOpenness(bloom, surface.delay!, surfaceIndex * 0.31),
          base = stigma.geometry.getAttribute("position"),
          closed = stigma.geometry.morphAttributes.position![0],
          root = new Vector3().fromBufferAttribute(base, base.count - 2);
        if (stigma.included)
          root.lerp(
            new Vector3().fromBufferAttribute(closed, closed.count - 2),
            1 - open,
          );
        const vertex = (index: number, target: Vector3) =>
          target
            .fromBufferAttribute(p, index)
            .lerp(scratch.fromBufferAttribute(folded, index), 1 - styleOpen);
        let distance = Infinity;
        for (let i = 0; i < indices.length; i += 3) {
          vertex(indices[i], triangle.a);
          vertex(indices[i + 1], triangle.b);
          vertex(indices[i + 2], triangle.c);
          triangle.closestPointToPoint(root, nearest);
          distance = Math.min(distance, root.distanceTo(nearest));
        }
        assert.ok(
          distance < 0.014,
          `${quality} bloom ${bloom}: generated stigma ridge separated ${distance.toFixed(4)} from style tissue`,
        );
        measurements++;
      }
      for (const part of parts) part.geometry.dispose();
      geometry.dispose();
    }
  assert.ok(measurements > 0);
});
