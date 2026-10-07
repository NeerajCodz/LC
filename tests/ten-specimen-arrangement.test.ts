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
