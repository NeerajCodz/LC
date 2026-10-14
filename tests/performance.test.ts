import assert from "node:assert/strict";
import test from "node:test";
import { boundedDpr, renderDprRequest } from "../lib/performance";
import { queueBake } from "../lib/gpu/bake-queue";

test("an inspection DPR cap preserves public defaults and the actual mobile pixel ceiling", () => {
  assert.equal(
    typeof renderDprRequest,
    "function",
    "renderer DPR request must support an explicit fixture cap",
  );
  assert.equal(renderDprRequest(false, false), 2);
  assert.equal(renderDprRequest(false, true), 2.5);
  assert.equal(renderDprRequest(true, true), 1);
  for (const constrained of [false, true])
    for (const macro of [false, true]) {
      const requested = renderDprRequest(constrained, macro, 1);
      assert.equal(requested, 1);
      const dpr = boundedDpr(1600, 1100, requested, constrained);
      assert.ok(dpr <= 1);
      assert.ok(
        1600 * 1100 * dpr * dpr <= (constrained ? 1_500_000 : 6_000_000) + 1,
      );
      if (constrained) assert.ok(dpr < 1);
    }
});

test("portrait galleries and large displays stay within pixel and dimension budgets", () => {
  for (const [width, height] of [
    [390, 6000],
    [430, 840],
    [1440, 5000],
    [768, 30000],
    [3840, 2160],
  ]) {
    for (const constrained of [true, false]) {
      const dpr = boundedDpr(width, height, 3, constrained);
      assert.ok(dpr > 0 && dpr <= 3);
      assert.ok(
        width * height * dpr * dpr <= (constrained ? 1_500_000 : 6_000_000) + 1,
      );
      assert.ok(Math.max(width, height) * dpr <= 4096 + 1);
    }
  }
});

test("optional GPU bakes serialize and a failed bake does not block the next", async () => {
  const order: string[] = [];
  const first = queueBake(async () => {
    order.push("start");
    await Promise.resolve();
    order.push("end");
    throw new Error("device unavailable");
  });
  const second = queueBake(async () => {
    order.push("next");
    return 42;
  });
  await assert.rejects(first, /device unavailable/);
  assert.equal(await second, 42);
  assert.deepEqual(order, ["start", "end", "next"]);
});
