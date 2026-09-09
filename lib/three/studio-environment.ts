import {
  DataTexture,
  DataUtils,
  EquirectangularReflectionMapping,
  HalfFloatType,
  LinearFilter,
  PMREMGenerator,
  RGBAFormat,
  type WebGLRenderer,
  type WebGLRenderTarget,
} from "three";
import { studioRadiance } from "../gpu/studio-field";

type Studio = { texture: DataTexture; backend: "vgpu" | "webgl" };
let studio: Promise<Studio> | undefined;
function textureFrom(data: Uint16Array, width: number, height: number) {
  const texture = new DataTexture(
    data,
    width,
    height,
    RGBAFormat,
    HalfFloatType,
  );
  texture.mapping = EquirectangularReflectionMapping;
  texture.minFilter = texture.magFilter = LinearFilter;
  texture.name = "Botanical studio radiance";
  texture.needsUpdate = true;
  return texture;
}
async function prepareStudio(): Promise<Studio> {
  if (typeof navigator !== "undefined" && navigator.gpu) {
    try {
      const [{ init }, { default: source }, { renderStudio }] =
        await Promise.all([
          import("vgpu"),
          import("../gpu/shaders/studio-lighting.wgsl"),
          import("../gpu/render-studio"),
        ]);
      const gpu = await init({ powerPreference: "low-power" });
      try {
        const data = await renderStudio(gpu, source);
        return { texture: textureFrom(data, 1024, 512), backend: "vgpu" };
      } finally {
        gpu.dispose();
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development")
        console.info("Studio lighting uses its WebGL fallback:", error);
    }
  }
  // Preserve the same light positions, colors, and HDR range without WebGPU.
  const width = 512,
    height = 256,
    data = new Uint16Array(width * height * 4);
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const rgb = studioRadiance((x + 0.5) / width, (y + 0.5) / height),
        offset = (y * width + x) * 4;
      for (let channel = 0; channel < 3; channel++)
        data[offset + channel] = DataUtils.toHalfFloat(rgb[channel]);
      data[offset + 3] = DataUtils.toHalfFloat(1);
    }
  return { texture: textureFrom(data, width, height), backend: "webgl" };
}
interface EnvironmentCache {
  users: number;
  ready: Promise<{ target: WebGLRenderTarget; backend: Studio["backend"] }>;
}
const environments = new WeakMap<WebGLRenderer, EnvironmentCache>();

/** One GGX-filtered environment per renderer, shared by all retained scenes. */
export function acquireStudioEnvironment(gl: WebGLRenderer) {
  let cached = environments.get(gl);
  if (!cached) {
    cached = {
      users: 0,
      ready: (studio ??= prepareStudio()).then(({ texture, backend }) => {
        const pmrem = new PMREMGenerator(gl);
        try {
          return { target: pmrem.fromEquirectangular(texture), backend };
        } finally {
          pmrem.dispose();
        }
      }),
    };
    environments.set(gl, cached);
  }
  const entry = cached;
  entry.users++;
  let released = false;
  return {
    ready: entry.ready,
    release() {
      if (released) return;
      released = true;
      entry.users--;
      queueMicrotask(() => {
        // Strict Mode's cleanup/remount reuses this pending environment.
        if (entry.users !== 0) return;
        if (environments.get(gl) === entry) environments.delete(gl);
        void entry.ready.then(
          ({ target }) => target.dispose(),
          () => {},
        );
      });
    },
  };
}
