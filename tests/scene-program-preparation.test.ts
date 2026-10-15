import assert from "node:assert/strict";
import test from "node:test";
import {
  Group,
  Material,
  Mesh,
  PerspectiveCamera,
  Scene,
  Texture,
} from "three";

async function fixture() {
  const preparationApi = await import("../lib/three/sceneProgramPreparation");
  const a = new Material(),
    b = new Material(),
    c = new Material(),
    scene = new Scene(),
    camera = new PerspectiveCamera();
  let compiled = 0,
    ready = false,
    polls = 0;
  const shared = {
    isReady: () => {
      polls++;
      return ready;
    },
  };
  const finished = { isReady: () => true };
  const properties = new Map<Material, unknown>([
    [a, { currentProgram: shared }],
    [b, { currentProgram: shared }],
    [c, { currentProgram: finished }],
  ]);
  const draws = [
    new Mesh(undefined, a),
    new Mesh(undefined, b),
    new Mesh(undefined, c),
  ];
  const hidden = new Group();
  hidden.visible = false;
  hidden.add(new Mesh());
  scene.add(...draws, hidden);
  const preparation = new preparationApi.SceneProgramPreparation({
    compile: (scope, actualCamera, actualScene) => {
      assert.notEqual(scope, scene);
      assert.equal(actualScene, scene);
      assert.equal(actualCamera, camera);
      const viewed: Mesh[] = [];
      scope.traverse((object) => {
        if ((object as Mesh).isMesh) viewed.push(object as Mesh);
      });
      assert.deepEqual(viewed, draws);
      for (const draw of draws) assert.equal(draw.parent, scene);
      assert.equal(hidden.children[0].parent, hidden);
      compiled++;
      return new Set([a, b, c]);
    },
    properties: { get: (material) => properties.get(material) },
  });
  return {
    preparation,
    scene,
    camera,
    properties,
    a,
    b,
    c,
    finish: () => {
      ready = true;
    },
    counts: () => ({ compiled, polls }),
  };
}

test("scene program preparation compiles once in the caller's render pass and polls shared programs once", async () => {
  const f = await fixture();
  assert.equal(f.preparation.started, false);
  assert.equal(f.preparation.ready(), false);
  f.preparation.begin(f.scene, f.camera);
  f.preparation.begin(f.scene, f.camera);
  assert.equal(f.preparation.started, true);
  assert.equal(f.preparation.ready(), false);
  assert.deepEqual(f.counts(), { compiled: 1, polls: 1 });
  f.finish();
  assert.equal(f.preparation.ready(), true);
  assert.equal(f.preparation.ready(), true);
  assert.deepEqual(f.counts(), { compiled: 1, polls: 2 });
});

test("disposing hidden materials during preparation cancels only unreferenced programs", async () => {
  const f = await fixture();
  f.preparation.begin(f.scene, f.camera);
  f.properties.delete(f.a);
  assert.equal(f.preparation.ready(), false);
  f.properties.delete(f.b);
  assert.equal(f.preparation.ready(), true);
  assert.deepEqual(f.counts(), { compiled: 1, polls: 1 });
});

test("visible revisions rearm a completed preparation for evicted program replacements without restarting unchanged scopes", async () => {
  const f = await fixture();
  f.preparation.setRevision("overview");
  f.preparation.begin(f.scene, f.camera);
  f.finish();
  assert.equal(f.preparation.ready(), true);
  let replacementReady = false,
    replacementPolls = 0;
  const replacement = {
    isReady: () => {
      replacementPolls++;
      return replacementReady;
    },
  };
  // Residency eviction removes the original native program, while CPU materials survive.
  f.properties.delete(f.a);
  f.properties.delete(f.b);
  f.properties.set(f.a, { currentProgram: replacement });
  f.properties.set(f.b, { currentProgram: replacement });
  f.preparation.setRevision("rose");
  assert.equal(
    f.preparation.ready(),
    false,
    "newly visible programs must not inherit completed readiness",
  );
  assert.equal(f.preparation.started, false);
  f.preparation.begin(f.scene, f.camera);
  assert.equal(f.preparation.ready(), false);
  assert.equal(replacementPolls, 1, "shared replacement is polled once");
  assert.equal(f.counts().compiled, 2);
  assert.equal(f.preparation.setRevision("rose"), false);
  f.preparation.begin(f.scene, f.camera);
  assert.equal(
    f.counts().compiled,
    2,
    "an unchanged selection does not compile again",
  );
  replacementReady = true;
  assert.equal(f.preparation.ready(), true);
  f.preparation.setRevision("overview");
  assert.equal(
    f.preparation.ready(),
    false,
    "returning to a previous scope is also a new visible generation",
  );
  f.preparation.begin(f.scene, f.camera);
  assert.equal(f.preparation.ready(), true);
  assert.equal(f.counts().compiled, 3);
});

test("a visibility revision cancels pending stale programs before polling new membership", async () => {
  const f = await fixture();
  f.preparation.setRevision("overview");
  f.preparation.begin(f.scene, f.camera);
  f.properties.clear();
  f.preparation.setRevision("rose");
  assert.equal(f.preparation.started, false);
  assert.equal(f.preparation.ready(), false);
  assert.deepEqual(f.counts(), { compiled: 1, polls: 0 });
  let polls = 0;
  const replacement = {
    isReady: () => {
      polls++;
      return false;
    },
  };
  f.properties.set(f.c, { currentProgram: replacement });
  f.preparation.begin(f.scene, f.camera);
  assert.equal(f.preparation.ready(), false);
  assert.equal(polls, 1);
  f.properties.delete(f.c);
  assert.equal(
    f.preparation.ready(),
    true,
    "deleted replacement is cancelled without another native query",
  );
  assert.equal(polls, 1);
  f.preparation.reset();
  assert.equal(f.preparation.started, false);
  assert.equal(f.preparation.ready(), false);
  assert.equal(polls, 1);
});

test("preparation resets without polling a lost or unmounted renderer and can prepare again", async () => {
  const f = await fixture();
  f.preparation.begin(f.scene, f.camera);
  f.preparation.reset();
  f.properties.clear();
  assert.equal(f.preparation.started, false);
  assert.equal(f.preparation.ready(), false);
  assert.deepEqual(f.counts(), { compiled: 1, polls: 0 });
  f.preparation.begin(f.scene, f.camera);
  assert.equal(f.preparation.ready(), true);
  assert.equal(f.counts().compiled, 2);
});

test("native preparation failures propagate to the guarded render clock", async () => {
  const preparationApi = await import("../lib/three/sceneProgramPreparation");
  const material = new Material();
  const program = {
    isReady: () => {
      throw new Error("driver failed");
    },
  };
  const preparation = new preparationApi.SceneProgramPreparation({
    compile: () => new Set([material]),
    properties: {
      get: () => ({ currentProgram: program }),
    },
  });
  preparation.begin(new Scene(), new PerspectiveCamera());
  assert.throws(() => preparation.ready(), /driver failed/);
  preparation.reset();
  assert.equal(preparation.ready(), false);
});

for (const completed of [false, true]) {
  test(`a late environment replaces ${completed ? "completed" : "pending"} visible program preparation`, async () => {
    const f = await fixture();
    f.preparation.begin(f.scene, f.camera);
    if (completed) f.finish();
    assert.equal(f.preparation.ready(), completed);
    const priorPolls = f.counts().polls;
    let replacementReady = false,
      replacementPolls = 0;
    const replacement = {
      isReady: () => {
        replacementPolls++;
        return replacementReady;
      },
    };
    f.properties.set(f.a, { currentProgram: replacement });
    f.properties.set(f.b, { currentProgram: replacement });
    const environment = new Texture();
    f.scene.environment = environment;
    f.preparation.begin(f.scene, f.camera);
    assert.equal(f.counts().compiled, 2, "new environment needs new variants");
    assert.equal(f.preparation.ready(), false);
    assert.equal(replacementPolls, 1);
    assert.equal(f.counts().polls, priorPolls, "old generation is not polled");
    f.preparation.begin(f.scene, f.camera);
    assert.equal(f.counts().compiled, 2, "same environment is prepared once");
    replacementReady = true;
    assert.equal(f.preparation.ready(), true);
    f.scene.environment = null;
    f.preparation.begin(f.scene, f.camera);
    assert.equal(
      f.counts().compiled,
      3,
      "removing the map changes variants too",
    );
    assert.equal(f.preparation.ready(), true);
    f.preparation.reset();
    f.preparation.begin(f.scene, f.camera);
    assert.equal(f.counts().compiled, 4, "reset starts a fresh generation");
    assert.equal(f.preparation.ready(), true);
    environment.dispose();
  });
}
