import type { effect, Gpu } from "vgpu";

/** Shared by the browser bake and real-device pixel regression tests. */
export async function renderTissue(
  gpu: Gpu,
  source: Parameters<typeof effect>[1],
  size: number,
) {
  const { effect, target } = await import("vgpu");
  const output = target(gpu, {
    size: [size, size],
    format: "rgba8unorm",
    label: "Petal tissue atlas",
  });
  const tissue = effect(gpu, source, { label: "Petal tissue bake" });
  await tissue.compile(output);
  tissue.draw(output);
  const pixels = await output.read();
  if (pixels.length !== size * size * 4 || pixels[3] !== 255)
    throw new Error("Petal tissue GPU readback was incomplete");
  return pixels;
}
