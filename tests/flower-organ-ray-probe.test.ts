import test from "node:test";
import assert from "node:assert/strict";
import { Ray } from "three";
import type { ThreeEvent } from "@react-three/fiber";
import { FlowerInteraction } from "../components/flowers/FlowerInteraction";
test("envelope probes the actual ray before existing stop, hover and capture handlers", () => {
  const sequence: string[] = [],
    ray = new Ray(),
    rayProbe = {
      current: (actual: Ray) => {
        assert.equal(actual, ray);
        sequence.push("probe");
      },
    };
  const tree = FlowerInteraction({
    enabled: true,
    proxyRadius: 1,
    children: null,
    rayProbe,
    onHover: () => sequence.push("hover"),
    onClick: () => sequence.push("click"),
  });
  const mesh = tree.props.children[0],
    handlers = mesh.props;
  const event = {
    ray,
    pointerId: 7,
    delta: 0,
    target: {
      setPointerCapture: () => sequence.push("capture"),
      releasePointerCapture: () => sequence.push("release"),
    },
    stopPropagation: () => sequence.push("stop"),
  } as unknown as ThreeEvent<PointerEvent>;
  handlers.onPointerOver(event);
  assert.deepEqual(sequence, ["probe", "stop", "hover"]);
  sequence.length = 0;
  handlers.onPointerMove(event);
  assert.deepEqual(sequence, ["probe"]);
  sequence.length = 0;
  handlers.onPointerDown(event);
  assert.deepEqual(sequence, ["probe", "stop", "capture"]);
  sequence.length = 0;
  handlers.onPointerUp(event);
  assert.deepEqual(sequence, ["release"]);
  sequence.length = 0;
  handlers.onClick(event);
  assert.deepEqual(sequence, ["stop", "click"]);
});
test("unregistered and disabled flowers have no organ ray queries", () => {
  const tree = FlowerInteraction({
    enabled: true,
    proxyRadius: 1,
    children: null,
  });
  const handlers = tree.props.children[0].props;
  assert.doesNotThrow(() => handlers.onPointerMove({ ray: new Ray() }));
  const disabled = FlowerInteraction({
    enabled: false,
    children: null,
    rayProbe: { current: () => assert.fail("disabled probe") },
  });
  assert.equal(disabled.props.onPointerMove, undefined);
});
