/** The same authored uint hash and smooth noise field as petal-tissue.wgsl.
 * Bake once at texel centers, rather than evaluating twelve hashes per fragment.
 * The channels are material inputs, not a flower image or measured tissue data.
 */
function hash(x: number, y: number) {
  let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + 93) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0;
  return ((h ^ (h >>> 16)) & 0x00ffffff) / 16777215;
}
function noise(x: number, y: number) {
  const ix = Math.floor(x),
    iy = Math.floor(y);
  const fx = x - ix,
    fy = y - iy;
  const wx = fx * fx * (3 - 2 * fx),
    wy = fy * fy * (3 - 2 * fy);
  const lower = hash(ix, iy) * (1 - wx) + hash(ix + 1, iy) * wx;
  const upper = hash(ix, iy + 1) * (1 - wx) + hash(ix + 1, iy + 1) * wx;
  return lower * (1 - wy) + upper * wy;
}

export function createTissueFallback(size: number) {
  if (!Number.isInteger(size) || size < 1 || size > 1024)
    throw new RangeError("Tissue atlas size must be an integer from 1 to 1024");
  const pixels = new Uint8Array(size * size * 4);
  for (let y = 0; y < size; y++) {
    const v = (y + 0.5) / size;
    for (let x = 0; x < size; x++) {
      const u = (x + 0.5) / size,
        offset = (y * size + x) * 4;
      pixels[offset] = Math.round(noise(u * 8, v * 8) * 255);
      pixels[offset + 1] = Math.round(noise(u * 11, v * 18) * 255);
      pixels[offset + 2] = Math.round(noise(u * 340, v * 340) * 255);
      pixels[offset + 3] = 255;
    }
  }
  return pixels;
}
