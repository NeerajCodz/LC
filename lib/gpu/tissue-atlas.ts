import { DataTexture, LinearFilter, LinearMipmapLinearFilter } from "three";

export type TissueBackend = "vgpu" | "webgl";
export const TISSUE_SIZE = 1024;

// One application-wide texture, shared by all species and WebGL contexts.
// A valid neutral texel keeps samplers complete before the optional bake.
const texture = new DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
texture.name = "Botanical tissue · vgpu";
texture.magFilter = LinearFilter;
texture.minFilter = LinearMipmapLinearFilter;
texture.generateMipmaps = true;
texture.needsUpdate = true;

export const tissueUniforms = {
  uTissueAtlas: { value: texture },
  uTissueReady: { value: false },
};

let pending: Promise<TissueBackend> | undefined;

/** Bake once, read once, release WebGPU. No GPU readback in the animation loop. */
async function bake(): Promise<TissueBackend> {
  if (typeof navigator === "undefined" || !navigator.gpu) return "webgl";
  const [{ init }, { default: source }, { renderTissue }] = await Promise.all([
    import("vgpu"),
    import("./shaders/petal-tissue.wgsl"),
    import("./render-tissue"),
  ]);
  const gpu = await init({ powerPreference: "low-power" });
  try {
    const pixels = await renderTissue(gpu, source, TISSUE_SIZE);
    // DataTexture does not flip rows. Row zero is sampled at v=0, preserving
    // the numeric UV field produced by vgpu's top-origin effect coordinates.
    texture.image = { data: pixels, width: TISSUE_SIZE, height: TISSUE_SIZE };
    texture.needsUpdate = true;
    tissueUniforms.uTissueReady.value = true;
    return "vgpu";
  } finally {
    gpu.dispose();
  }
}

export function prepareTissueAtlas(): Promise<TissueBackend> {
  return (pending ??= bake().catch((error: unknown) => {
    // WebGPU may be disabled, unavailable, or lose its device. The complete
    // procedural GLSL material remains active; flower viewing never suspends.
    if (process.env.NODE_ENV === "development")
      console.info("Petal detail uses the WebGL shader:", error);
    return "webgl";
  }));
}
