/** Analytic fallback/reference for the WGSL studio radiance field. */
export function studioRadiance(u: number, v: number): [number, number, number] {
  const longitude = (u - 0.5) * Math.PI * 2,
    latitude = (v - 0.5) * Math.PI;
  const x = Math.cos(latitude) * Math.cos(longitude),
    y = Math.sin(latitude),
    z = Math.cos(latitude) * Math.sin(longitude);
  function box(
    cx: number,
    cy: number,
    cz: number,
    width: number,
    height: number,
  ) {
    const length = Math.hypot(cx, cy, cz);
    const nx = cx / length,
      ny = cy / length,
      nz = cz / length;
    const rightLength = Math.hypot(nz, nx),
      rx = nz / rightLength,
      rz = -nx / rightLength;
    const ux = ny * rz,
      uy = nz * rx - nx * rz,
      uz = -ny * rx;
    const facing = x * nx + y * ny + z * nz;
    if (facing <= 0) return 0;
    const edge = Math.max(
      Math.abs(x * rx + z * rz) / facing / width,
      Math.abs(x * ux + y * uy + z * uz) / facing / height,
    );
    const t = Math.max(0, Math.min(1, (edge - 0.88) / 0.24));
    return 1 - t * t * (3 - 2 * t);
  }
  const key = box(-3, 4, 2, 0.42, 0.66),
    fill = box(4, 2, 1, 0.38, 0.6),
    rim = box(0, 4, -4, 0.5, 0.2);
  const ceiling = Math.max(y, 0) ** 3 * 0.025;
  return [
    0.012 + ceiling + key * 3.4 + fill * 0.62 + rim * 2.6,
    0.013 + ceiling + key * 3.15 + fill * 0.71 + rim * 2.4,
    0.014 + ceiling + key * 2.94 + fill * 0.86 + rim * 2.2,
  ];
}
