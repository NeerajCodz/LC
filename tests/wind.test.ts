import assert from "node:assert/strict";
import test from "node:test";
import { FLOWER_TYPES } from "../lib/flowers/types";
import { FLOWER_STRUCTURES } from "../lib/flowers/structures";
import {
  GARDEN_GROUND,
  GARDEN_PLANTINGS,
  MOBILE_GARDEN_PLANTINGS,
} from "../lib/flowers/garden";
import {
  WIND_PROFILES,
  bendWeight,
  bendSlope,
  gustEnvelope,
  windLoad,
  stepPlantSpring,
  resolvePlantContacts,
  flowerEnvelope,
} from "../lib/flowers/wind";

test("every wind profile keeps the root clamped and its spring bounded through a gust and recovery", () => {
  assert.deepEqual(Object.keys(WIND_PROFILES).sort(), [...FLOWER_TYPES].sort());
  assert.equal(bendWeight(0), 0);
  assert.equal(bendSlope(0), 0);
  assert.equal(bendWeight(1), 1);
  for (const type of FLOWER_TYPES) {
    const profile = WIND_PROFILES[type],
      spring = { value: 0, velocity: 0 };
    let maximum = 0;
    for (let frame = 0; frame < 900; frame++) {
      const time = frame / 30;
      const target =
        time < 8
          ? windLoad(time, 0, 0, gustEnvelope(time - 1)) * profile.compliance
          : 0;
      stepPlantSpring(spring, target, 1 / 30, profile);
      assert.ok(Number.isFinite(spring.value));
      assert.equal(Math.abs(spring.value * bendWeight(0)), 0);
      maximum = Math.max(maximum, Math.abs(spring.value));
    }
    assert.ok(maximum > 0.01 && maximum < 1, type);
    assert.ok(Math.abs(spring.value) < 1e-6, `${type} settles`);
    stepPlantSpring(spring, 0.1, 100, profile);
    assert.ok(Math.abs(spring.value) < 0.15, `${type} tolerates tab resume`);
  }
});

test("contact separates blooms, transfers more displacement to the flexible stem, and ignores depth-separated heads", () => {
  const a = {
    x: 0,
    y: 0,
    z: 0,
    radius: 0.5,
    compliance: 1,
    dx: 0,
    dz: 0,
    pressure: 0,
  };
  const b = { ...a, x: 0.94, compliance: 3 };
  resolvePlantContacts([a, b]);
  assert.ok(b.x - a.x >= 1 - 1e-8);
  assert.ok(Math.abs(b.dx) > Math.abs(a.dx));
  assert.ok(a.pressure > 0 && b.pressure > 0);
  assert.equal(a.y, 0);
  assert.equal(b.y, 0);
  const separated = [
    { ...a, y: 0 },
    { ...b, x: a.x, y: 3 },
  ];
  resolvePlantContacts(separated);
  assert.equal(separated[0].dx, 0);
  assert.equal(separated[1].dx, 0);
});

test("both garden layouts have fixed ground roots and room for the authored mature bloom envelopes", () => {
  for (const layout of [GARDEN_PLANTINGS, MOBILE_GARDEN_PLANTINGS]) {
    for (let i = 0; i < layout.length; i++)
      for (let j = i + 1; j < layout.length; j++) {
        const a = layout[i],
          b = layout[j];
        assert.equal(a.position[1], GARDEN_GROUND);
        const sa = FLOWER_STRUCTURES[a.type],
          sb = FLOWER_STRUCTURES[b.type];
        const distance = Math.hypot(
          a.position[0] - b.position[0],
          (sa.stemLength * a.scale - sb.stemLength * b.scale) * 1.65,
          a.position[2] - b.position[2],
        );
        assert.ok(
          distance >=
            flowerEnvelope(sa) * a.scale + flowerEnvelope(sb) * b.scale,
          `${a.type} / ${b.type}`,
        );
      }
  }
});
