import type { Vec3 } from "../flowers/types";

/** Pointer pressure is local; the accessible pulse acts on the whole specimen. */
export function specimenPressTarget(
  cluster: Vec3,
  point: Vec3 | undefined,
  proximity: number,
  pulse: number,
  reducedMotion: boolean,
) {
  if (reducedMotion) return 0;
  const distance = point
    ? Math.hypot(
        point[0] - cluster[0],
        point[1] - cluster[1],
        point[2] - cluster[2],
      )
    : 0;
  const near = Number.isFinite(distance) ? Math.max(0, 1 - distance / 1.2) : 0;
  const pointer = Number.isFinite(proximity) ? proximity * 0.24 * near : 0;
  const globalPulse = Number.isFinite(pulse) ? pulse * 0.35 : 0;
  return Math.max(-0.25, Math.min(0.35, pointer + globalPulse));
}
