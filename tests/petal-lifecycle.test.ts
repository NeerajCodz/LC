import test from "node:test";
import assert from "node:assert/strict";
import { SurfaceClock } from "../lib/three/surfaceClock";

test("surface time freezes without catch-up and reduced motion settles immediately", () => {
  const clock = new SurfaceClock();
  assert.equal(clock.delta(0), 0);
  assert.equal(clock.delta(0.016), 0.016);
  assert.equal(clock.delta(0.016), 0);
  assert.equal(clock.delta(0.032), 0.016);
  assert.equal(clock.delta(80), 0.05);
  assert.equal(clock.delta(80.02, true), -1);
  assert.ok(Math.abs(clock.delta(80.03) - 0.01) < 1e-9);
});
