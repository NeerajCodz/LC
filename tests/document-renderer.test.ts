import test from "node:test";
import assert from "node:assert/strict";
import { bindRendererDocumentExit } from "../lib/three/documentRenderer";

function transition(persisted: boolean) {
  const event = new Event("pagehide");
  Object.defineProperty(event, "persisted", { value: persisted });
  return event;
}
function fixture(lost = false) {
  const page = new EventTarget(),
    calls: string[] = [];
  const detach = bindRendererDocumentExit(
    {
      getContext: () => ({ isContextLost: () => lost }),
      dispose: () => calls.push("dispose"),
      forceContextLoss: () => calls.push("lose"),
    },
    page,
    () => calls.push("stop"),
  );
  return { page, calls, detach };
}
test("discarded documents stop their clock before disposing native resources, once", () => {
  const { page, calls, detach } = fixture();
  page.dispatchEvent(transition(false));
  assert.deepEqual(calls, ["stop", "dispose", "lose"]);
  page.dispatchEvent(transition(false));
  assert.equal(calls.length, 3);
  detach();
});
test("backgrounding and cached history do not release a retained renderer", () => {
  const { page, calls, detach } = fixture();
  page.dispatchEvent(new Event("visibilitychange"));
  page.dispatchEvent(transition(true));
  assert.deepEqual(calls, []);
  page.dispatchEvent(transition(false));
  assert.deepEqual(calls, ["stop", "dispose", "lose"]);
  detach();
});
test("an already lost context stops without issuing invalid native deletion calls", () => {
  const { page, calls, detach } = fixture(true);
  page.dispatchEvent(transition(false));
  assert.deepEqual(calls, ["stop"]);
  detach();
});
test("unmounted canvas listeners cannot dispose a later document", () => {
  const { page, calls, detach } = fixture();
  detach();
  page.dispatchEvent(transition(false));
  assert.deepEqual(calls, []);
});
