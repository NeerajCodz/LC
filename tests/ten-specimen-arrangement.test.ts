import test from "node:test";
import assert from "node:assert/strict";
import { Euler, Vector3 } from "three";
import type { Vec3 } from "../lib/flowers/types";
import type {
  SpecimenModel,
  SpecimenSurface,
} from "../lib/three/specimenModel";
import { ALSTROEMERIA_MODEL } from "../components/flowers/alstroemeria/alstroemeriaGeometry";
import { GLADIOLUS_MODEL } from "../components/flowers/gladiolus/gladiolusGeometry";
import { DELPHINIUM_MODEL } from "../components/flowers/delphinium/delphiniumGeometry";
import { ZINNIA_MODEL } from "../components/flowers/zinnia/zinniaGeometry";
import { ZINNIA_LEAF } from "../components/flowers/zinnia/zinniaLeaf";
import {
  zinniaAnatomy,
  zinniaStructure,
} from "../components/flowers/zinnia/Zinnia";
function world(model: SpecimenModel, s: SpecimenSurface, p: Vec3) {
  const c = model.clusters[s.cluster];
  return new Vector3(...p)
    .applyEuler(new Euler(...c.rotation))
    .multiplyScalar(c.scale)
    .add(new Vector3(...c.position));
}
test("bilateral upper organs face upward in the assembled flowers", () => {
  for (let c = 0; c < 3; c++) {
    const parts = ALSTROEMERIA_MODEL.surfaces.filter(
      (s) => s.cluster === c && s.name === "free tepal",
    );
    const lower = world(
      ALSTROEMERIA_MODEL,
      parts[3],
      parts[3].sample(0.5, 0.55, 1),
    );
    for (const s of parts.filter((s) => s.tissue === "inner"))
      assert.ok(
        world(ALSTROEMERIA_MODEL, s, s.sample(0.5, 0.55, 1)).y > lower.y,
      );
  }
  for (const model of [GLADIOLUS_MODEL, DELPHINIUM_MODEL]) {
    const name = model === GLADIOLUS_MODEL ? "unequal tepal" : "petaloid sepal";
    const parts = model.surfaces.filter(
      (s) => s.cluster === 0 && s.name === name,
    );
    const top = world(model, parts[0], parts[0].sample(0.5, 0.55, 1)),
      lower = world(
        model,
        parts[model === GLADIOLUS_MODEL ? 3 : 2],
        parts[model === GLADIOLUS_MODEL ? 3 : 2].sample(0.5, 0.55, 1),
      );
    assert.ok(top.y > lower.y);
  }
});
test("delphinium's dorsal spur ascends behind its flower", () => {
  const s = DELPHINIUM_MODEL.surfaces.find(
    (s) => s.name === "hollow dorsal spur",
  )!;
  const start = world(DELPHINIUM_MODEL, s, s.sample(0.25, 0, 1)),
    end = world(DELPHINIUM_MODEL, s, s.sample(0.25, 1, 1));
  assert.ok(end.y > start.y);
  assert.ok(end.z < start.z);
});
test("zinnia's elongated peduncle keeps opposite leaves below the mature flower", () => {
  let leafTop = -Infinity,
    headBottom = Infinity;
  for (const n of zinniaAnatomy.nodes)
    for (let u = 0; u <= 8; u++)
      for (let v = 0; v <= 16; v++) {
        const p = new Vector3(...ZINNIA_LEAF.sample(u / 8, v / 16, 1))
          .applyEuler(
            new Euler(zinniaAnatomy.leafTilt ?? 0.9, n.angle, 0.1, "YXZ"),
          )
          .multiplyScalar(n.scale ?? 1);
        leafTop = Math.max(
          leafTop,
          -zinniaStructure.stemLength + zinniaStructure.stemLength * n.t + p.y,
        );
      }
  for (const s of ZINNIA_MODEL.surfaces.filter((s) => s.name === "ray ligule"))
    for (let u = 0; u <= 8; u++)
      for (let v = 0; v <= 16; v++)
        headBottom = Math.min(
          headBottom,
          world(ZINNIA_MODEL, s, s.sample(u / 8, v / 16, 1)).y,
        );
  assert.ok(
    leafTop < headBottom - 0.04,
    `leaf top ${leafTop}, head bottom ${headBottom}`,
  );
});
