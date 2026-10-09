import test from "node:test";
import assert from "node:assert/strict";

test("paired anther chambers retain exact filament attachments at both bloom stages", async () => {
  const stamens = await import("../lib/three/floralStamens").catch(() => null);
  assert.ok(stamens, "paired anatomical stamen construction is missing");
  const organs = stamens.floralStamens({
    count: 5,
    cluster: 2,
    radius: 0.12,
    height: 0.3,
  });
  const again = stamens.floralStamens({
    count: 5,
    cluster: 2,
    radius: 0.12,
    height: 0.3,
  });
  assert.deepEqual(organs, again);
  assert.equal(organs.filter((o) => o.name === "stamen filament").length, 5);
  assert.equal(
    organs.filter((o) => o.name === "stamen anther chamber").length,
    10,
  );
  for (let i = 0; i < 5; i++) {
    const filament = organs[i * 3];
    for (const anther of organs.slice(i * 3 + 1, i * 3 + 3)) {
      assert.equal(anther.cluster, 2);
      assert.deepEqual(anther.points[0], filament.points[2]);
      assert.deepEqual(anther.foldedPoints![0], filament.foldedPoints![2]);
      assert.ok(anther.radius > 0);
    }
  }
});
