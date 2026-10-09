import { expect, test } from "@playwright/test";
import type {
  BufferAttribute,
  InterleavedBufferAttribute,
  InstancedMesh,
  Mesh,
  Object3D,
} from "three";
import { FLOWER_TYPES } from "../../lib/flowers/types";
import { expectRenderedFlower } from "./pixel-content";

test("offscreen retained previews release GPU buffers while keeping their scenes", async ({
  page,
}, info) => {
  test.setTimeout(180000 + FLOWER_TYPES.length * 2000);
  await page.addInitScript(() => {
    const scenes = new Map<string, Object3D>();
    const diagnostics = new EventTarget();
    (
      window as typeof window & { __THREE_DEVTOOLS__: EventTarget }
    ).__THREE_DEVTOOLS__ = diagnostics;
    diagnostics.addEventListener("observe", (event) => {
      const renderer = (event as CustomEvent).detail as {
        domElement?: HTMLCanvasElement;
        render?: (scene: Object3D, camera: unknown) => void;
      };
      if (!renderer.domElement || !renderer.render) return;
      const render = renderer.render;
      renderer.render = function (scene, camera) {
        scenes.set(scene.uuid, scene);
        return render.call(this, scene, camera);
      };
    });
    (
      window as typeof window & { visiblePreviewBytes: () => number }
    ).visiblePreviewBytes = () => {
      const arrays = new Set<ArrayBufferView>();
      const add = (attribute: BufferAttribute | InterleavedBufferAttribute) =>
        arrays.add(
          "data" in attribute ? attribute.data.array : attribute.array,
        );
      document
        .querySelectorAll<HTMLElement>(".flower-preview[data-scene-id]")
        .forEach((node) => {
          const rect = node.getBoundingClientRect();
          if (
            !rect.width ||
            !rect.height ||
            rect.bottom <= 0 ||
            rect.top >= innerHeight ||
            rect.right <= 0 ||
            rect.left >= innerWidth
          )
            return;
          scenes.get(node.dataset.sceneId!)?.traverseVisible((object) => {
            const mesh = object as Mesh;
            if (!mesh.geometry) return;
            for (const attribute of Object.values(mesh.geometry.attributes))
              add(attribute);
            if (mesh.geometry.index) add(mesh.geometry.index);
            const instance = mesh as InstancedMesh;
            if (instance.instanceMatrix) add(instance.instanceMatrix);
            if (instance.instanceColor) add(instance.instanceColor);
          });
        });
      return [...arrays].reduce((total, array) => total + array.byteLength, 0);
    };
    // Track actual native allocations without synchronous getParameter queries.
    const contexts = new WeakMap<
      WebGL2RenderingContext,
      {
        bindings: Map<number, WebGLBuffer | null>;
        sizes: WeakMap<WebGLBuffer, number>;
        bytes: number;
      }
    >();
    const originalContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args
    ) {
      const context = Reflect.apply(originalContext, this, args);
      if (args[0] === "webgl2" && context && !contexts.has(context)) {
        const allocations = {
          bindings: new Map(),
          sizes: new WeakMap(),
          bytes: 0,
        };
        contexts.set(context, allocations);
        Object.defineProperty(this, "residentBufferBytes", {
          value: () => allocations.bytes,
        });
      }
      return context;
    } as typeof originalContext;
    const prototype = WebGL2RenderingContext.prototype;
    const bind = prototype.bindBuffer,
      allocate = prototype.bufferData,
      free = prototype.deleteBuffer;
    prototype.bindBuffer = function (target, buffer) {
      contexts.get(this)?.bindings.set(target, buffer);
      return bind.call(this, target, buffer);
    };
    prototype.bufferData = function (this: WebGL2RenderingContext, ...args) {
      const state = contexts.get(this),
        buffer = state?.bindings.get(args[0]);
      if (state && buffer) {
        const size =
          typeof args[1] === "number" ? args[1] : (args[1]?.byteLength ?? 0);
        state.bytes += size - (state.sizes.get(buffer) ?? 0);
        state.sizes.set(buffer, size);
      }
      return Reflect.apply(allocate, this, args);
    } as typeof allocate;
    prototype.deleteBuffer = function (buffer) {
      const state = contexts.get(this);
      if (state && buffer) {
        state.bytes -= state.sizes.get(buffer) ?? 0;
        state.sizes.delete(buffer);
      }
      return free.call(this, buffer);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/gallery/");
  const previews = page.locator(
    ".gallery-specimen:not([hidden]) .flower-preview",
  );
  const first = page.locator("[data-flower-preview=rose]");
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute("data-render-rect", /,/);
  const identity = await first.getAttribute("data-scene-id");
  const canvas = page.locator(".preview-stage canvas");
  const bytes = () =>
    canvas.evaluate((node) =>
      (
        node as HTMLCanvasElement & { residentBufferBytes: () => number }
      ).residentBufferBytes(),
    );
  const pages = Math.ceil(FLOWER_TYPES.length / 15);
  for (let p = 1; p <= pages; p++) {
    if (p > 1)
      await page
        .getByRole("button", { name: `Page ${p}`, exact: true })
        .click();
    for (let i = 0; i < (await previews.count()); i++) {
      await previews.nth(i).scrollIntoViewIfNeeded();
      await expect(previews.nth(i)).toHaveAttribute("data-render-rect", /,/);
    }
    // Desktop medium geometry can legitimately exceed the constrained 32 MB
    // ceiling. Bound native residency by the actual visible CPU attributes,
    // rather than by the number of catalog scenes retained offscreen.
    const visibleBytes = await page.evaluate(() =>
      (
        window as typeof window & { visiblePreviewBytes: () => number }
      ).visiblePreviewBytes(),
    );
    expect(visibleBytes).toBeGreaterThan(0);
    await info.attach(`page-${p}-buffer-budget`, {
      body: JSON.stringify({ visibleBytes, residentBytes: await bytes() }),
      contentType: "application/json",
    });
    await expect.poll(bytes).toBeLessThan(visibleBytes + 1_048_576);
    if (info.project.name === "mobile")
      await expect.poll(bytes).toBeLessThan(32_000_000);
  }
  const search = page.getByRole("searchbox", { name: "Search the collection" });
  await search.fill("no botanical match for residency check");
  await expect(previews).toHaveCount(0);
  await expect.poll(bytes).toBeLessThan(1_048_576);
  await expect(page.locator(".preview-stage")).toHaveAttribute(
    "data-retained-scenes",
    String(FLOWER_TYPES.length),
  );
  await search.clear();
  if (pages > 1)
    await page.getByRole("button", { name: "Page 1", exact: true }).click();
  await first.scrollIntoViewIfNeeded();
  await expect(first).toHaveAttribute("data-scene-id", identity!);
  await expectRenderedFlower(canvas, 0.007);
  await expect(page.locator(".preview-stage")).toHaveAttribute(
    "data-retained-scenes",
    String(FLOWER_TYPES.length),
  );
  await expect(canvas).toHaveCount(1);
});
