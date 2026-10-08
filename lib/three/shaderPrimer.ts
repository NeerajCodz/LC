import {
  NoToneMapping,
  WebGLRenderTarget,
  type Camera,
  type Scene,
} from "three";

interface ShaderRenderer {
  compile: (scene: Scene, camera: Camera) => unknown;
  toneMapping: number;
  getRenderTarget: () => WebGLRenderTarget | null;
  setRenderTarget: (target: WebGLRenderTarget | null) => void;
}
const prepared = new WeakSet<ShaderRenderer>();

/** Submit all garden programs before dense geometry draws enter the GPU queue. */
export function primeSceneShaders(
  renderer: ShaderRenderer,
  scene: Scene,
  camera: Camera,
) {
  if (prepared.has(renderer)) return;
  const previous = renderer.getRenderTarget();
  // r185 draws tone-mapped scenes into a linear target and applies tone mapping
  // in its output pass. Compiling against the canvas creates unused variants.
  const target =
    previous === null && renderer.toneMapping !== NoToneMapping
      ? new WebGLRenderTarget(1, 1, { depthBuffer: false })
      : null;
  try {
    if (target) renderer.setRenderTarget(target);
    renderer.compile(scene, camera);
    prepared.add(renderer);
  } finally {
    if (target) {
      renderer.setRenderTarget(previous);
      target.dispose();
    }
  }
}
