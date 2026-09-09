import assert from "node:assert/strict";
import test from "node:test";
import type { RootState, RootStore } from "@react-three/fiber";
import { botanicalEvents } from "../lib/three/events";

test("a cleared Canvas ref connects to its renderer and cleans up on reconnect/unmount", () => {
  const canvas = new EventTarget() as HTMLCanvasElement;
  const wrapper = new EventTarget() as HTMLElement;
  const state = {
    gl: { domElement: canvas },
    set: (update: (current: RootState) => Partial<RootState>) => {
      Object.assign(state, update(state));
    },
  } as RootState;
  const store = { getState: () => state } as RootStore;
  const manager = botanicalEvents(store);
  let clicks = 0;
  manager.handlers!.onClick = () => clicks++;
  state.events = manager;

  // This is the Provider call that previously threw after a suspended preview
  // detached its wrapper. Use the real R3F manager and real EventTargets.
  manager.connect(null);
  assert.equal(state.events.connected, canvas);
  canvas.dispatchEvent(new Event("click"));
  assert.equal(clicks, 1);

  manager.connect(wrapper);
  canvas.dispatchEvent(new Event("click"));
  assert.equal(clicks, 1, "reconnection removes listeners from the old canvas");
  wrapper.dispatchEvent(new Event("click"));
  assert.equal(clicks, 2);

  manager.disconnect?.();
  wrapper.dispatchEvent(new Event("click"));
  assert.equal(clicks, 2, "unmount removes listeners from the wrapper");
  assert.equal(state.events.connected, undefined);

  // Repeated attach/detach cycles must not accumulate listeners.
  for (let i = 0; i < 20; i++) {
    manager.connect(null);
    manager.disconnect?.();
  }
  canvas.dispatchEvent(new Event("click"));
  assert.equal(clicks, 2);
});
