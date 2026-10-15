import test from "node:test";
import assert from "node:assert/strict";
import {
  specimenCages,
  type SpecimenSurface,
} from "../lib/three/specimenModel";

test("cage attachments reject pressure carriers whose independent morph would detach the child", () => {
  const carrier: SpecimenSurface = {
    name: "pressure carrier",
    cluster: 0,
    role: "petal",
    flexible: true,
    thickness: 0.01,
    sample: (u, v) => [u, v, 0],
    pressureSample: (u, v) => [u, v, 0.03],
  };
  const child: SpecimenSurface = {
    name: "attached terminal tissue",
    cluster: 0,
    role: "petal",
    thickness: 0.01,
    sample: (u, v) => [u, v, 0],
    cageAttachment: { surface: carrier, uv: (u, v) => [u, v] },
  };
  assert.equal(
    carrier.pressureSample!(0.5, 0, 1)[2] - child.sample(0.5, 0, 1)[2],
    0.03,
  );
  for (const constrained of [false, true]) {
    assert.throws(
      () =>
        specimenCages(
          {
            clusters: [
              { position: [0, 0, 0], rotation: [0, 0, 0], scale: 1, nod: 0 },
            ],
            surfaces: [carrier, child],
            organs: [],
          },
          constrained,
        ),
      /Attached cage tissue requires/,
    );
  }
});
