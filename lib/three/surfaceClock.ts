/** Uses the plant's retained active time, never elapsed wall time. */
export class SurfaceClock {
  private last: number | undefined;
  delta(time: number, reducedMotion = false): number {
    const dt =
      this.last === undefined
        ? 0
        : Math.max(0, Math.min(0.05, time - this.last));
    this.last = time;
    return reducedMotion ? -1 : dt;
  }
}
