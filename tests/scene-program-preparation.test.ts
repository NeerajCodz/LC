import assert from "node:assert/strict";
import test from "node:test";
import { Group, Material, Mesh, PerspectiveCamera, Scene } from "three";

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
