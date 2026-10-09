type SyncContext = Pick<
  WebGL2RenderingContext,
  | "TIMEOUT_EXPIRED"
  | "ALREADY_SIGNALED"
  | "CONDITION_SATISFIED"
  | "WAIT_FAILED"
  | "SYNC_GPU_COMMANDS_COMPLETE"
  | "fenceSync"
  | "clientWaitSync"
  | "deleteSync"
  | "flush"
>;

/** Bound a constrained garden's submitted work to one unfinished GPU frame. */
export class GpuFrameGate {
  private fence: WebGLSync | null = null;
  constructor(private readonly gl: SyncContext) {}

  ready() {
    if (!this.fence) return true;
    const status = this.gl.clientWaitSync(this.fence, 0, 0);
    if (status === this.gl.TIMEOUT_EXPIRED) return false;
    this.dispose();
    if (
      status !== this.gl.ALREADY_SIGNALED &&
      status !== this.gl.CONDITION_SATISFIED
    )
      throw new Error("GPU frame completion failed");
    return true;
  }

  submitted() {
    if (this.fence) throw new Error("A GPU frame is already pending");
    this.fence = this.gl.fenceSync(this.gl.SYNC_GPU_COMMANDS_COMPLETE, 0);
    if (!this.fence) throw new Error("GPU frame fence could not be created");
    this.gl.flush();
  }

  dispose() {
    if (this.fence) this.gl.deleteSync(this.fence);
    this.fence = null;
  }
}
