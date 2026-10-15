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

async function cachedVariantsFixture() {
  const f = await fixture();
  let finished = false,
    waitingPolls = 0,
    completePolls = 0;
  const waiting = {
    isReady: () => {
      waitingPolls++;
      return finished;
    },
  };
  const complete = {
    isReady: () => {
      completePolls++;
      return true;
    },
  };
  // Lotus shares Mesh/InstancedMesh material; Fuchsia shares static/morph
  // material. Three caches both variants but currentProgram names only the last.
  const programsA = new Map([
      ["mesh", waiting],
      ["instanced", complete],
    ]),
    programsB = new Map([
      ["morph", waiting],
      ["static", complete],
    ]),
    materialA = { programs: programsA, currentProgram: complete },
    materialB = { programs: programsB, currentProgram: complete };
  f.properties.set(f.a, materialA);
  f.properties.set(f.b, materialB);
  return {
    ...f,
    waiting,
    complete,
    programsA,
    programsB,
    materialA,
    materialB,
    finishVariant: () => {
      finished = true;
    },
    variantCounts: () => ({ waitingPolls, completePolls }),
  };
}

test("a cached noncurrent program variant must finish even when the current variant is ready", async () => {
  const f = await cachedVariantsFixture();
  f.preparation.begin(f.scene, f.camera);
  assert.equal(
    f.preparation.ready(),
    false,
    "the earlier Mesh/morph variant must not inherit the last variant's readiness",
  );
  assert.deepEqual(f.variantCounts(), { waitingPolls: 1, completePolls: 1 });
  f.finishVariant();
  assert.equal(f.preparation.ready(), true);
  assert.deepEqual(f.variantCounts(), { waitingPolls: 2, completePolls: 1 });
});

test("cached program objects are polled once across cache keys and material aliases", async () => {
  const f = await cachedVariantsFixture();
  f.programsA.set("another-key-for-the-same-program", f.waiting);
  f.programsB.set("another-alias-key", f.waiting);
  f.preparation.begin(f.scene, f.camera);
  f.preparation.ready();
  assert.deepEqual(
    f.variantCounts(),
    { waitingPolls: 1, completePolls: 1 },
    "several cache entries must not duplicate or omit the native readiness query",
  );
});

test("a noncurrent cached alias stays pending until its last material is disposed", async () => {
  const f = await cachedVariantsFixture();
  f.materialA.currentProgram = f.waiting;
  f.materialB.currentProgram = f.waiting;
  f.preparation.begin(f.scene, f.camera);
  f.properties.delete(f.a);
  f.materialB.currentProgram = f.complete;
  assert.equal(
    f.preparation.ready(),
    false,
    "removing one alias and changing currentProgram must retain the other cached alias",
  );
  assert.equal(f.variantCounts().waitingPolls, 1);
  f.properties.delete(f.b);
  assert.equal(f.preparation.ready(), true);
  assert.equal(
    f.variantCounts().waitingPolls,
    1,
    "disposing the last cached alias must cancel without another native query",
  );
});

test("an authoritative empty program map cancels a stale currentProgram without polling it", async () => {
  const f = await cachedVariantsFixture();
  f.materialA.currentProgram = f.waiting;
  f.materialB.currentProgram = f.waiting;
  f.preparation.begin(f.scene, f.camera);
  f.programsA.clear();
  f.programsB.clear();
  assert.equal(
    f.preparation.ready(),
    true,
    "an empty cache must not fall back to the stale currentProgram reference",
  );
  assert.equal(f.variantCounts().waitingPolls, 0);
});

test("actual renderer state replaces pending color variants without inheriting old readiness", async () => {
  const { SceneProgramPreparation } =
    await import("../lib/three/sceneProgramPreparation");
  const observed: unknown[] = [],
    expected: unknown[] = [];
  for (const transition of [
    "shadow enabled",
    "shadow type",
    "tone mapping",
    "output color space",
    "attach target",
    "remove target",
    "target color space",
    "target texture type",
  ]) {
    const material = new Material(),
      scene = new Scene(),
      camera = new PerspectiveCamera(),
      target = { texture: { colorSpace: "srgb", type: 1009 } };
    scene.add(new Mesh(undefined, material));
    let currentTarget = transition === "attach target" ? null : target,
      compiled = 0;
    const initialTarget = currentTarget,
      variants: { finished: boolean; polls: number; isReady: () => boolean }[] =
        [],
      properties = { programs: new Map() };
    const renderer = {
      shadowMap: { enabled: true, type: 1 },
      toneMapping: 4,
      outputColorSpace: "srgb",
      getRenderTarget: () => currentTarget,
      compile: () => {
        compiled++;
        const variant = {
          finished: false,
          polls: 0,
          isReady: () => {
            variant.polls++;
            return variant.finished;
          },
        };
        variants.push(variant);
        properties.programs.clear();
        properties.programs.set("actual-color-pass", variant);
        return new Set([material]);
      },
      properties: { get: () => properties },
    };
    const preparation = new SceneProgramPreparation(renderer);
    preparation.begin(scene, camera);
    preparation.begin(scene, camera);
    assert.equal(compiled, 1, `${transition}: unchanged state compiles once`);
    switch (transition) {
      case "shadow enabled":
        renderer.shadowMap.enabled = false;
        break;
      case "shadow type":
        renderer.shadowMap.type = 2;
        break;
      case "tone mapping":
        renderer.toneMapping = 1;
        break;
      case "output color space":
        renderer.outputColorSpace = "srgb-linear";
        break;
      case "attach target":
        currentTarget = target;
        break;
      case "remove target":
        currentTarget = null;
        break;
      case "target color space":
        target.texture.colorSpace = "srgb-linear";
        break;
      case "target texture type":
        target.texture.type = 1015;
        break;
    }
    preparation.begin(scene, camera);
    const pending = preparation.ready(),
      oldPolls = variants[0].polls;
    preparation.begin(scene, camera);
    observed.push([
      transition,
      "pending replacement",
      compiled,
      pending,
      oldPolls,
    ]);
    expected.push([transition, "pending replacement", 2, false, 0]);
    variants.at(-1)!.finished = true;
    assert.equal(preparation.ready(), true);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = 1;
    renderer.toneMapping = 4;
    renderer.outputColorSpace = "srgb";
    target.texture.colorSpace = "srgb";
    target.texture.type = 1009;
    currentTarget = initialTarget;
    preparation.begin(scene, camera);
    const restored = preparation.ready();
    preparation.begin(scene, camera);
    observed.push([transition, "completed replacement", compiled, restored]);
    expected.push([transition, "completed replacement", 3, false]);
    preparation.reset();
    assert.equal(preparation.started, false);
    assert.equal(preparation.ready(), false);
    preparation.begin(scene, camera);
    observed.push([transition, "reset", compiled, preparation.ready()]);
    expected.push([transition, "reset", 4, false]);
  }
  assert.deepEqual(observed, expected);
});
