import assert from "node:assert/strict";
import test from "node:test";

test("GPU frame pacing holds at most one pending submission and polls without waiting", async () => {
  const path = "../lib/three/gpuFrameGate";
  const pacing = (await import(path).catch(() => null)) as {
    GpuFrameGate: new (gl: unknown) => {
      ready: () => boolean;
      submitted: () => void;
      dispose: () => void;
    };
  } | null;
  assert.equal(typeof pacing?.GpuFrameGate, "function");
  let status = 2,
    created = 0,
    deleted = 0,
    flushed = 0;
  const sync = {} as WebGLSync;
  const gl = {
    TIMEOUT_EXPIRED: 2,
    ALREADY_SIGNALED: 3,
    CONDITION_SATISFIED: 4,
    WAIT_FAILED: 5,
    SYNC_GPU_COMMANDS_COMPLETE: 6,
    fenceSync(condition: number, flags: number) {
      assert.equal(condition, 6);
      assert.equal(flags, 0);
      created++;
      return sync;
    },
    clientWaitSync(value: WebGLSync, flags: number, timeout: number) {
      assert.equal(value, sync);
      assert.equal(flags, 0);
      assert.equal(timeout, 0);
      return status;
    },
    deleteSync(value: WebGLSync) {
      assert.equal(value, sync);
      deleted++;
    },
    flush() {
      flushed++;
    },
  };
  const gate = new pacing!.GpuFrameGate(gl);
  assert.equal(gate.ready(), true);
  gate.submitted();
  assert.equal(created, 1);
  assert.equal(flushed, 1);
  assert.throws(() => gate.submitted(), /pending/);
  assert.equal(gate.ready(), false);
  assert.equal(gate.ready(), false);
  assert.equal(created, 1);
  status = 3;
  assert.equal(gate.ready(), true);
  assert.equal(deleted, 1);
  gate.submitted();
  status = 4;
  assert.equal(gate.ready(), true);
  gate.submitted();
  gate.dispose();
  gate.dispose();
  assert.equal(deleted, 3);
  assert.equal(gate.ready(), true);
  gate.submitted();
  status = 5;
  assert.throws(() => gate.ready(), /GPU/);
  assert.equal(deleted, 4);
  const unavailable = new pacing!.GpuFrameGate({
    ...gl,
    fenceSync: () => null,
  });
  assert.throws(() => unavailable.submitted(), /GPU/);
  assert.equal(unavailable.ready(), true);
});
