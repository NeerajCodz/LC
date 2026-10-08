import { expect, test } from "@playwright/test";
import { writeFile } from "node:fs/promises";
import { expectRenderedFlower, expectScreenshotFlower } from "./pixel-content";

// Exercise the same constrained layout in both rendering engines. Enabling or
// disabling desktop shadows legitimately changes shader variants; resizing an
// already shadowless canvas must not switch its unused shadow algorithm.
test.use({
  viewport: { width: 390, height: 844 },
  deviceScaleFactor: 3,
  isMobile: true,
  hasTouch: true,
});

test("shadowless garden shader sources stay shared through canvas reconfiguration", async ({
  page,
}, info) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (error) => errors.push(error.message));
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /shader|WebGLProgram/.test(message.text())
    )
      errors.push(message.text());
  });
  await page.addInitScript(() => {
    Object.defineProperty(navigator, "gpu", {
      value: undefined,
      configurable: true,
    });
    const source = new WeakMap<WebGLShader, string>();
    const attached = new WeakMap<WebGLProgram, WebGLShader[]>();
    const signatures = new WeakMap<WebGLProgram, string>();
    const tissueLocations = new WeakSet<WebGLUniformLocation>();
    const snapshots: (() => unknown)[] = [];
    (
      window as typeof window & { lcShaderSnapshots: () => unknown[] }
    ).lcShaderSnapshots = () => snapshots.map((snapshot) => snapshot());
    const contexts = new WeakMap<
      WebGL2RenderingContext,
      {
        live: Map<string, Set<WebGLProgram>>;
        links: number;
        duplicates: number[];
        sampledAtlasUploads: number;
        submittedVertices: number;
        losses: number;
        maximumVerticesPerFrame: number;
        drawCalls: number;
        maximumDrawsPerFrame: number;
      }
    >();
    const originalContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (
      this: HTMLCanvasElement,
      ...args
    ) {
      const gl = Reflect.apply(originalContext, this, args);
      if (args[0] === "webgl2" && gl && !contexts.has(gl)) {
        const state = {
          live: new Map(),
          links: 0,
          duplicates: [] as number[],
          sampledAtlasUploads: 0,
          submittedVertices: 0,
          losses: 0,
          maximumVerticesPerFrame: 0,
          drawCalls: 0,
          maximumDrawsPerFrame: 0,
        };
        contexts.set(gl, state);
        this.addEventListener("webglcontextlost", () => state.losses++);
        const connected = this.isConnected;
        const contextOptions = args[1];
        const snapshot = () => ({
          connected,
          contextOptions,
          links: state.links,
          duplicates: state.duplicates,
          sampledAtlasUploads: state.sampledAtlasUploads,
          submittedVertices: state.submittedVertices,
          losses: state.losses,
          maximumVerticesPerFrame: state.maximumVerticesPerFrame,
          maximumDrawsPerFrame: state.maximumDrawsPerFrame,
        });
        snapshots.push(snapshot);
        Object.defineProperty(this, "shaderReuseStats", {
          value: snapshot,
        });
      }
      return gl;
    } as typeof originalContext;
    // Three's diagnostics hook identifies the actual render boundary. DOM draw
    // counters update every 30 frames and cannot measure an exact vertex budget.
    const diagnostics = new EventTarget();
    (
      window as typeof window & { __THREE_DEVTOOLS__: EventTarget }
    ).__THREE_DEVTOOLS__ = diagnostics;
    diagnostics.addEventListener("observe", (event) => {
      const renderer = (event as CustomEvent).detail as {
        domElement?: HTMLCanvasElement;
        getContext: () => WebGL2RenderingContext;
        render?: (...args: unknown[]) => void;
      };
      if (!renderer.domElement || !renderer.render) return;
      const render = renderer.render;
      renderer.render = function (...args) {
        const state = contexts.get(renderer.getContext());
        const before = state?.submittedVertices ?? 0;
        const beforeCalls = state?.drawCalls ?? 0;
        const result = render.apply(this, args);
        if (state)
          state.maximumVerticesPerFrame = Math.max(
            state.maximumVerticesPerFrame,
            state.submittedVertices - before,
          );
        if (state)
          state.maximumDrawsPerFrame = Math.max(
            state.maximumDrawsPerFrame,
            state.drawCalls - beforeCalls,
          );
        return result;
      };
    });
    const prototype = WebGL2RenderingContext.prototype;
    const elements = prototype.drawElements,
      instances = prototype.drawElementsInstanced,
      arrays = prototype.drawArrays,
      arrayInstances = prototype.drawArraysInstanced;
    prototype.drawElements = function (mode, count, type, offset) {
      const state = contexts.get(this);
      if (state) {
        state.submittedVertices += count;
        state.drawCalls++;
      }
      return elements.call(this, mode, count, type, offset);
    };
    prototype.drawElementsInstanced = function (mode, count, type, offset, n) {
      const state = contexts.get(this);
      if (state) {
        state.submittedVertices += count * n;
        state.drawCalls++;
      }
      return instances.call(this, mode, count, type, offset, n);
    };
    prototype.drawArrays = function (mode, first, count) {
      const state = contexts.get(this);
      if (state) {
        state.submittedVertices += count;
        state.drawCalls++;
      }
      return arrays.call(this, mode, first, count);
    };
    prototype.drawArraysInstanced = function (mode, first, count, n) {
      const state = contexts.get(this);
      if (state) {
        state.submittedVertices += count * n;
        state.drawCalls++;
      }
      return arrayInstances.call(this, mode, first, count, n);
    };
    const location = prototype.getUniformLocation,
      upload = prototype.uniform1i;
    prototype.getUniformLocation = function (program, name) {
      const result = location.call(this, program, name);
      if (result && name === "uTissueAtlas") tissueLocations.add(result);
      return result;
    };
    prototype.uniform1i = function (location, value) {
      if (location && tissueLocations.has(location)) {
        const state = contexts.get(this);
        if (state) state.sampledAtlasUploads++;
      }
      return upload.call(this, location, value);
    };
    const setSource = prototype.shaderSource,
      attach = prototype.attachShader,
      link = prototype.linkProgram,
      remove = prototype.deleteProgram;
    prototype.shaderSource = function (shader, text) {
      source.set(shader, text);
      return setSource.call(this, shader, text);
    };
    prototype.attachShader = function (program, shader) {
      const shaders = attached.get(program) ?? [];
      shaders.push(shader);
      attached.set(program, shaders);
      return attach.call(this, program, shader);
    };
    prototype.linkProgram = function (program) {
      const state = contexts.get(this);
      if (state) {
        const signature = (attached.get(program) ?? [])
          .map((s) => source.get(s) ?? "")
          .sort()
          .join("\n");
        signatures.set(program, signature);
        const live = state.live.get(signature) ?? new Set();
        state.links++;
        if (live.size) state.duplicates.push(state.links);
        live.add(program);
        state.live.set(signature, live);
      }
      return link.call(this, program);
    };
    prototype.deleteProgram = function (program) {
      if (program) {
        const state = contexts.get(this),
          signature = signatures.get(program);
        if (state && signature) {
          const live = state.live.get(signature);
          live?.delete(program);
          if (!live?.size) state.live.delete(signature);
        }
        signatures.delete(program);
        attached.delete(program);
      }
      return remove.call(this, program);
    };
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/garden/");
  await page.bringToFront();
  const canvas = page.locator(".garden-scene canvas");
  try {
    await expect(canvas).toHaveAttribute("data-render-frames", /\d+/, {
      timeout: 120000,
    });
  } finally {
    const path = info.outputPath("startup-native-stats.json");
    const snapshots = await page.evaluate(() =>
      (
        window as typeof window & { lcShaderSnapshots: () => unknown[] }
      ).lcShaderSnapshots(),
    );
    await writeFile(path, JSON.stringify(snapshots, null, 2));
    await info.attach("startup-native-stats", {
      path,
      contentType: "application/json",
    });
  }
  const stats = () =>
    canvas.evaluate((node) =>
      (
        node as HTMLCanvasElement & {
          shaderReuseStats: () => {
            links: number;
            duplicates: number[];
            sampledAtlasUploads: number;
            submittedVertices: number;
            losses: number;
            maximumVerticesPerFrame: number;
            maximumDrawsPerFrame: number;
          };
        }
      ).shaderReuseStats(),
    );
  const initial = await stats();
  await info.attach("initial-shader-reuse", {
    body: JSON.stringify(initial),
    contentType: "application/json",
  });
  expect(initial.duplicates).toEqual([]);
  expect(initial.sampledAtlasUploads).toBeGreaterThan(0);
  expect(initial.losses).toBe(0);
  await expectRenderedFlower(canvas, 0.007);
  const settled = await stats();
  const verticesPerFrame = settled.maximumVerticesPerFrame;
  await info.attach("overview-submitted-vertices-per-frame", {
    body: JSON.stringify({ verticesPerFrame }),
    contentType: "application/json",
  });
  expect(verticesPerFrame).toBeLessThan(15000000);
  expect(verticesPerFrame).toBeGreaterThan(1000000);
  expect(settled.maximumDrawsPerFrame).toBeLessThan(1800);
  const size = page.viewportSize()!;
  await page.setViewportSize({
    width: size.width + 10,
    height: size.height + 10,
  });
  await expectRenderedFlower(canvas, 0.007);
  const resized = await stats();
  await info.attach("resized-shader-reuse", {
    body: JSON.stringify(resized),
    contentType: "application/json",
  });
  expect(resized.duplicates).toEqual([]);
  expect(resized.losses).toBe(0);
  const gardenPath = info.outputPath("garden-after-resize.png");
  await expectScreenshotFlower(
    canvas,
    await canvas.screenshot({ path: gardenPath }),
    0.007,
  );
  await info.attach("garden-after-resize", {
    path: gardenPath,
    contentType: "image/png",
  });
  await page
    .getByRole("combobox", { name: "Explore a garden flower" })
    .selectOption("rose");
  await expectRenderedFlower(canvas, 0.007);
  expect((await stats()).losses).toBe(0);
  const rosePath = info.outputPath("rose-garden-close-up.png");
  await expectScreenshotFlower(
    canvas,
    await canvas.screenshot({ path: rosePath }),
    0.007,
  );
  await info.attach("rose-garden-close-up", {
    path: rosePath,
    contentType: "image/png",
  });
  expect(errors).toEqual([]);
});
