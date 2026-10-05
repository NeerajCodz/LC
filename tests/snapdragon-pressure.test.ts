import test from "node:test";
import assert from "node:assert/strict";
import { createCagePatch, PetalDynamics } from "../lib/three/petalDynamics";
import { snapdragonCorolla } from "../components/flowers/snapdragon/snapdragonGeometry";
test("mouth pressure changes cage rest and leaves the pinned insertion fixed at every bloom", () => {
  const patch = createCagePatch({
    columns: 12,
    rows: 7,
    periodic: true,
    thickness: 0.014,
    sample: snapdragonCorolla,
    pressureSample: (u, v, o) => snapdragonCorolla(u, v, o, 1),
  });
  const sim = new PetalDynamics([patch]);
  sim.setRest(0, 1, undefined, 0);
  const initial = sim.rest.slice();
  sim.setRest(0, 1, undefined, 1);
  const lower = (5 * 12 + 9) * 3;
  assert.ok(sim.rest[lower + 1] < initial[lower + 1] - 0.1);
  assert.deepEqual(sim.rest.slice(0, 36), initial.slice(0, 36));
  sim.setRest(0, 0, undefined, 1);
  const bud = sim.rest.slice();
  sim.setRest(0, 0, undefined, 0);
  assert.deepEqual(sim.rest, bud);
  sim.setRest(0, 1, undefined, 0);
  assert.deepEqual(sim.rest, initial);
});
