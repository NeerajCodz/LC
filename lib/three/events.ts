import { events, type RootStore } from "@react-three/fiber";

/**
 * Canvas can finish mounting its scene after Suspense has detached its wrapper
 * ref. The renderer still owns a real canvas until R3F disposes the root. Bind
 * to that canvas in this case; the stock manager retains ownership of listener
 * reconnection and cleanup. Never bind preview events to document/window.
 */
export function botanicalEvents(store: RootStore) {
  const manager = events(store);
  const connect = manager.connect;
  return {
    ...manager,
    connect(target: HTMLElement | null) {
      connect?.(target ?? store.getState().gl.domElement);
    },
  };
}
