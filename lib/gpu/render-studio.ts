import type { effect, Gpu } from "vgpu";

export async function renderStudio(
  gpu: Gpu,
  source: Parameters<typeof effect>[1],
  width = 1024,
  height = 512,
) {
  const { effect, target } = await import("vgpu");
  const output = target(gpu, {
    size: [width, height],
    format: "rgba16float",
    label: "Botanical HDR studio",
  });
  const lighting = effect(gpu, source, { label: "Studio radiance" });
  await lighting.compile(output);
  lighting.draw(output);
  const bytes = await output.read();
  return new Uint16Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 2);
}
