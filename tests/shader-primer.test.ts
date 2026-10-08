import test from "node:test";
import assert from "node:assert/strict";
import {
  ACESFilmicToneMapping,
  Camera,
  NoToneMapping,
  Scene,
  type WebGLRenderTarget,
} from "three";

test("garden shaders prime once per renderer and failed preparation remains retryable", async () => {
  const modulePath = "../lib/three/shaderPrimer";
  const primer = (await import(modulePath).catch(() => null)) as {
    primeSceneShaders: (
      renderer: {
        compile: (scene: Scene, camera: Camera) => void;
        toneMapping: number;
        getRenderTarget: () => WebGLRenderTarget | null;
        setRenderTarget: (target: WebGLRenderTarget | null) => void;
      },
      scene: Scene,
      camera: Camera,
    ) => void;
  } | null;
  assert.equal(typeof primer?.primeSceneShaders, "function");
  const scene = new Scene(),
    camera = new Camera();
  let compiles = 0;
  const renderer = {
    toneMapping: NoToneMapping,
    getRenderTarget: () => null,
    setRenderTarget: () => {},
    compile(s: Scene, c: Camera) {
      assert.equal(s, scene);
      assert.equal(c, camera);
      compiles++;
    },
  };
  primer!.primeSceneShaders(renderer, scene, camera);
  primer!.primeSceneShaders(renderer, scene, camera);
  assert.equal(compiles, 1);
  primer!.primeSceneShaders({ ...renderer }, scene, camera);
  assert.equal(
    compiles,
    2,
    "a replacement context must prepare its own programs",
  );
  let failures = 0;
  const rejected = {
    ...renderer,
    compile() {
      if (++failures === 1) throw new Error("driver rejected preparation");
    },
  };
  assert.throws(
    () => primer!.primeSceneShaders(rejected, scene, camera),
    /driver rejected/,
  );
  primer!.primeSceneShaders(rejected, scene, camera);
  assert.equal(failures, 2);

  let current: WebGLRenderTarget | null = null;
  let releases = 0;
  const linear = {
    toneMapping: ACESFilmicToneMapping,
    getRenderTarget: () => current,
    setRenderTarget: (target: WebGLRenderTarget | null) => {
      current = target;
    },
    compile() {
      assert.ok(current);
      assert.equal(current.width, 1);
      assert.equal(current.height, 1);
      current.addEventListener("dispose", () => releases++);
      throw new Error("linear compilation rejected");
    },
  };
  assert.throws(
    () => primer!.primeSceneShaders(linear, scene, camera),
    /linear compilation rejected/,
  );
  assert.equal(current, null);
  assert.equal(releases, 1);
  assert.equal(linear.toneMapping, ACESFilmicToneMapping);
});
