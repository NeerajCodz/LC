import test from "node:test";
import assert from "node:assert/strict";
import { stepSpring } from "../lib/three/easing";

test("keyboard pulse reaches the lower raceme independently of the cached pointer", async () => {
  const motion = await import("../lib/three/specimenMotion").catch(() => null);
  assert.ok(motion, "shared specimen articulation is missing");
  assert.equal(
    motion.specimenPressTarget([0, -1.8, 0], [0, 0, 0], 0, 1, false),
    0.35,
  );
  assert.equal(
    motion.specimenPressTarget([0, -1.8, 0], [0, 0, 0], 1, 0, false),
    0,
  );
});
test("pointer articulation stays local while pulse, recovery and reduced motion stay bounded", async () => {
  const { specimenPressTarget } = await import("../lib/three/specimenMotion");
  assert.equal(specimenPressTarget([0, 0, 0], [0, 0, 0], 1, 0, false), 0.24);
  assert.equal(specimenPressTarget([0, 0, 0], [0, 0.6, 0], 1, 0, false), 0.12);
  assert.equal(specimenPressTarget([0, 0, 0], undefined, 1, 0, false), 0.24);
  assert.equal(specimenPressTarget([0, -1.8, 0], [0, 0, 0], 1, 1, true), 0);
  for (const value of [100, -100, Infinity, NaN]) {
    const target = specimenPressTarget(
      [0, -1.8, 0],
      [NaN, 0, 0],
      value,
      value,
      false,
    );
    assert.ok(Number.isFinite(target) && target >= -0.25 && target <= 0.35);
  }
  const state = { value: 0, velocity: 0 };
  for (let frame = 0; frame < 60; frame++)
    stepSpring(
      state,
      specimenPressTarget([0, -1.8, 0], [0, 0, 0], 0, 1, false),
      1 / 60,
      65,
    );
  assert.ok(state.value > 0.3);
  for (let frame = 0; frame < 300; frame++)
    stepSpring(
      state,
      specimenPressTarget([0, -1.8, 0], [0, 0, 0], 0, 0, false),
      1 / 60,
      65,
    );
  assert.ok(Math.abs(state.value) < 1e-6);
});
