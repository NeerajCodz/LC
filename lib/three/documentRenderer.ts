interface DocumentRenderer {
  getContext: () => Pick<WebGL2RenderingContext, "isContextLost">;
  dispose: () => void;
  forceContextLoss: () => void;
}

/** React teardown need not run when a whole document is discarded. Release its
 * native allocations before a subsequent route creates another renderer.
 * Cached history documents retain their scenes and normal visibility pausing.
 */
export function bindRendererDocumentExit(
  renderer: DocumentRenderer,
  page: EventTarget,
  stop: () => void,
) {
  let discarded = false;
  const hide = (event: Event) => {
    if ((event as PageTransitionEvent).persisted || discarded) return;
    discarded = true;
    stop();
    if (renderer.getContext().isContextLost()) return;
    try {
      renderer.dispose();
    } finally {
      renderer.forceContextLoss();
    }
  };
  page.addEventListener("pagehide", hide);
  return () => page.removeEventListener("pagehide", hide);
}
