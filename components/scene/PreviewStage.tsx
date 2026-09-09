"use client";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useLayoutEffect,
  type ReactNode,
} from "react";
import {
  Canvas,
  createPortal,
  useFrame,
  useThree,
  type RootState,
} from "@react-three/fiber";
import { Scene } from "three";
import { botanicalEvents } from "@/lib/three/events";
import { RenderActivity } from "@/hooks/useActiveFrame";
import { BotanicalView } from "../flowers/BotanicalView";
import type { FlowerType } from "@/lib/flowers/types";
import type { FlowerView } from "@/lib/flowers/views";

export interface PreviewEntry {
  node: HTMLDivElement;
  type: FlowerType;
  angle: FlowerView;
  bloom: number;
  hovered: boolean;
  visible: boolean;
  detailed: boolean;
}
const Registry = createContext<{
  update: (id: string, entry: PreviewEntry) => void;
  remove: (id: string) => void;
} | null>(null);
export function usePreviewStage() {
  const stage = useContext(Registry);
  if (!stage) throw new Error("FlowerPreview must be inside PreviewStage");
  return stage;
}

/** One in-flow WebGL surface per gallery. Its pixels scroll with the DOM. */
export function PreviewStage({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const [entries, setEntries] = useState<Record<string, PreviewEntry>>({});
  const update = useCallback((id: string, entry: PreviewEntry) => {
    setEntries((current) => {
      // Lazy initialization is one-way: hide pauses a scene; it never deletes it.
      if (!entry.visible && !current[id]) return current;
      return { ...current, [id]: entry };
    });
  }, []);
  const remove = useCallback((id: string) => {
    setEntries((current) => {
      if (!current[id]) return current;
      const next = { ...current };
      delete next[id];
      return next;
    });
  }, []);
  const registry = useMemo(() => ({ update, remove }), [update, remove]);
  const loaded = Object.entries(entries);
  const active = loaded.some(([, entry]) => entry.visible);
  return (
    <Registry.Provider value={registry}>
      <div
        className={`${className} preview-stage`}
        data-retained-scenes={loaded.length}
      >
        {loaded.length > 0 && (
          <div className="preview-stage-surface" aria-hidden="true">
            <Canvas
              events={botanicalEvents}
              resize={{ scroll: false }}
              frameloop={active ? "always" : "never"}
              dpr={[1.5, 2]}
              gl={{
                antialias: true,
                alpha: true,
                powerPreference: "high-performance",
              }}
            >
              <ClearStage />
              {loaded.map(([id, entry]) => (
                <RetainedView key={id} entry={entry} />
              ))}
            </Canvas>
          </div>
        )}
        {children}
      </div>
    </Registry.Provider>
  );
}

function ClearStage() {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.setClearColor(0, 0);
    gl.clear(true, true, true);
  }, 1);
  return null;
}

function RetainedView({ entry }: { entry: PreviewEntry }) {
  const [scene] = useState(() => new Scene());
  const compute = useCallback(
    (event: MouseEvent, state: RootState) => {
      const rect = entry.node.getBoundingClientRect();
      state.pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
      state.raycaster.setFromCamera(state.pointer, state.camera);
    },
    [entry.node],
  );
  useLayoutEffect(() => {
    entry.node.setAttribute("data-scene-id", scene.uuid);
    return () => {
      entry.node.removeAttribute("data-scene-id");
    };
  }, [entry.node, scene]);
  return createPortal(
    <RenderActivity value={entry.visible}>
      <BotanicalView {...entry} />
      <DrawView entry={entry} />
    </RenderActivity>,
    scene,
    { events: { compute } },
  );
}

function DrawView({ entry }: { entry: PreviewEntry }) {
  const getState = useThree((state) => state.get);
  const lastRect = useRef("");
  useLayoutEffect(() => {
    // Pointer coordinates feed the flower's damped tracking without a global listener.
    const move = (event: PointerEvent) => {
      const rect = entry.node.getBoundingClientRect();
      const state = getState();
      state.pointer.set(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        (-(event.clientY - rect.top) / rect.height) * 2 + 1,
      );
    };
    entry.node.addEventListener("pointermove", move, { passive: true });
    return () => entry.node.removeEventListener("pointermove", move);
  }, [entry.node, getState]);
  useFrame(({ gl, camera, scene }) => {
    if (!entry.visible) return;
    const rect = entry.node.getBoundingClientRect();
    const canvas = gl.domElement.getBoundingClientRect();
    if (!rect.width || !rect.height) return;
    // Both bounds are sampled together. No debounced viewport offset, and no
    // fixed overlay: the browser compositor moves the entire surface naturally.
    const left = rect.left - canvas.left;
    const top = rect.top - canvas.top;
    const bottom = canvas.height - top - rect.height;
    if ("aspect" in camera && camera.aspect !== rect.width / rect.height) {
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
    }
    gl.autoClear = false;
    gl.setViewport(left, bottom, rect.width, rect.height);
    gl.setScissor(left, bottom, rect.width, rect.height);
    gl.setScissorTest(true);
    gl.clear(true, true, true);
    gl.render(scene, camera);
    gl.setScissorTest(false);
    const key = `${left.toFixed(2)},${top.toFixed(2)},${rect.width},${rect.height}`;
    if (lastRect.current !== key) {
      lastRect.current = key;
      entry.node.setAttribute("data-render-rect", key);
    }
  }, 2);
  return null;
}
